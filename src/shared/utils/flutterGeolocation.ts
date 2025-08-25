// Утилита для работы с геолокацией в WebView (browser-first, fallback: Flutter)

interface GeolocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  error?: string;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface FlutterWebViewInterface {
  flutter_inappwebview?: {
    callHandler: (handlerName: string, ...args: unknown[]) => void;
  };
  flutterLocationResult?: (result: GeolocationResult) => void;
}

const getFlutterWindow = (): (Window & FlutterWebViewInterface) | null => {
  if (typeof window === "undefined") return null;
  return window as Window & FlutterWebViewInterface;
};

const isFlutterWebView = (): boolean => {
  const fw = getFlutterWindow();
  return !!fw?.flutter_inappwebview;
};

// ---- Helpers ----
const withTimeout = <T,>(p: Promise<T>, ms: number, onTimeout?: () => void): Promise<T> =>
  new Promise((resolve) => {
    let settled = false;
    const tid = setTimeout(() => {
      if (!settled) {
        onTimeout?.();
        // @ts-expect-error: we resolve to T but caller handles a failure object
        resolve({ success: false, error: "timeout" });
      }
    }, ms);
    p.then((v) => {
      settled = true;
      clearTimeout(tid);
      resolve(v);
    });
  });

// ---- Browser path ----
const getLocationFromBrowser = (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ success: false, error: "Geolocation API not available" });
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          success: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => resolve({ success: false, error: err?.message || "error" }),
      defaultOptions
    );
  });
};

// ---- Flutter path (с таймаутом) ----
const getLocationFromFlutter = (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  const timeoutMs = options.timeout ?? 10000;

  const p = new Promise<GeolocationResult>((resolve) => {
    const fw = getFlutterWindow();
    if (!fw) {
      resolve({ success: false, error: "Window not available (SSR)" });
      return;
    }

    const onResult = (result: GeolocationResult) => {
      cleanup();
      resolve(result);
    };

    const cleanup = () => {
      try {
        delete fw.flutterLocationResult;
      } catch {}
    };

    // регистрируем колбэк
    fw.flutterLocationResult = onResult;

    // вызываем обработчик во Flutter (должен дернуть window.flutterLocationResult)
    if (fw.flutter_inappwebview) {
      try {
        fw.flutter_inappwebview.callHandler("getCurrentPosition");
      } catch {
        cleanup();
        resolve({ success: false, error: "Flutter callHandler failed" });
      }
    } else {
      cleanup();
      resolve({ success: false, error: "Flutter WebView not available" });
    }
  });

  // оборачиваем таймаутом, чтобы не висеть, если Flutter не ответит
  return withTimeout(p, timeoutMs, () => {
    const fw = getFlutterWindow();
    if (fw) {
      try {
        delete fw.flutterLocationResult;
      } catch {}
    }
  }) as Promise<GeolocationResult>;
};

// ---- Основная функция (browser-first) ----
export const getCurrentPosition = async (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  console.log("🌍 getCurrentPosition: browser-first");

  // 1) Сначала пробуем браузер (работает и в WebView, если у контейнера есть пермишены)
  const browserResult = await getLocationFromBrowser(options);
  if (browserResult.success) return browserResult;

  // 2) Если не вышло — пробуем Flutter, но только если мы реально в нем
  if (isFlutterWebView()) {
    console.log("🌍 browser failed, trying Flutter");
    const flutterResult = await getLocationFromFlutter(options);
    if (flutterResult.success) return flutterResult;
    // если и Flutter не смог — вернем браузерный фейл (с его ошибкой)
    return browserResult;
  }

  return browserResult;
};

// ---- Доп. утилиты ----
export const isGeolocationAvailable = (): boolean => {
  return isFlutterWebView() || (typeof navigator !== "undefined" && !!navigator.geolocation);
};

export const getMyLocation = async (p: { enableHighAccuracy: boolean; timeout: number }): Promise<{ lat: number; lng: number } | null> => {
  try {
    const result = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    if (result.success && result.latitude != null && result.longitude != null) {
      return { lat: result.latitude, lng: result.longitude };
    } else {
      console.error("🌍 Ошибка геолокации:", result.error);
      return null;
    }
  } catch (error) {
    console.error("🌍 Исключение при получении геолокации:", error);
    return null;
  }
};

const flutterGeolocation = {
  getCurrentPosition,
  isGeolocationAvailable,
  getMyLocation,
  isFlutterWebView,
};

export default flutterGeolocation;
