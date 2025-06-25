// Утилита для работы с геолокацией через Flutter WebView

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

// Расширяем интерфейс Window для Flutter WebView
interface FlutterWebViewInterface {
  flutter_inappwebview?: {
    callHandler: (handlerName: string, ...args: unknown[]) => void;
  };
  flutterLocationResult?: (result: GeolocationResult) => void;
}

// Получаем типизированный window безопасно
const getFlutterWindow = (): (Window & FlutterWebViewInterface) | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window as Window & FlutterWebViewInterface;
};

// Проверяем, работаем ли мы в Flutter WebView
const isFlutterWebView = (): boolean => {
  const flutterWindow = getFlutterWindow();
  return (
    flutterWindow !== null &&
    typeof flutterWindow.flutter_inappwebview !== "undefined"
  );
};

// Получение геолокации через Flutter
const getLocationFromFlutter = (): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    const flutterWindow = getFlutterWindow();

    if (!flutterWindow) {
      resolve({
        success: false,
        error: "Window not available (SSR environment)",
      });
      return;
    }

    // Устанавливаем callback для результата
    flutterWindow.flutterLocationResult = (result: GeolocationResult) => {
      resolve(result);
      // Очищаем callback
      delete flutterWindow.flutterLocationResult;
    };

    // Вызываем Flutter handler
    if (flutterWindow.flutter_inappwebview) {
      flutterWindow.flutter_inappwebview.callHandler("getCurrentPosition");
    } else {
      resolve({
        success: false,
        error: "Flutter WebView not available",
      });
    }
  });
};

// Получение геолокации через браузер
const getLocationFromBrowser = (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: "Geolocation is not supported by this browser",
      });
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        resolve({
          success: false,
          error: error.message,
        });
      },
      defaultOptions
    );
  });
};

// Основная функция для получения геолокации
export const getCurrentPosition = async (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  console.log("🌍 Запрос геолокации...");

  // Если мы в Flutter WebView, используем Flutter
  if (isFlutterWebView()) {
    console.log("🌍 Используем Flutter геолокацию");
    const result = await getLocationFromFlutter();

    // Если Flutter не сработал, пробуем браузер
    if (!result.success) {
      console.log("🌍 Flutter геолокация не сработала, пробуем браузер");
      return await getLocationFromBrowser(options);
    }

    return result;
  } else {
    // Если не в Flutter WebView, используем браузер
    console.log("🌍 Используем браузерную геолокацию");
    return await getLocationFromBrowser(options);
  }
};

// Утилита для проверки доступности геолокации
export const isGeolocationAvailable = (): boolean => {
  return isFlutterWebView() || !!navigator.geolocation;
};

// Утилита для получения текущей позиции с обработкой ошибок
export const getMyLocation = async (): Promise<{
  lat: number;
  lng: number;
} | null> => {
  try {
    const result = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    });

    if (result.success && result.latitude && result.longitude) {
      console.log("🌍 Геолокация получена:", result.latitude, result.longitude);
      return {
        lat: result.latitude,
        lng: result.longitude,
      };
    } else {
      console.error("🌍 Ошибка геолокации:", result.error);
      return null;
    }
  } catch (error) {
    console.error("🌍 Исключение при получении геолокации:", error);
    return null;
  }
};

// Экспорт для использования в компонентах
const flutterGeolocation = {
  getCurrentPosition,
  isGeolocationAvailable,
  getMyLocation,
  isFlutterWebView,
};

export default flutterGeolocation;
