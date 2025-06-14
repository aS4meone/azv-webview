// Утилиты для оптимизации производительности Google Maps

// Дебаунс функция для предотвращения избыточных вызовов
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Throttle функция для ограничения частоты вызовов
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Функция для вычисления расстояния между двумя точками
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
};

// Функция для проверки, находится ли точка в видимой области карты
export const isPointInBounds = (
  lat: number,
  lng: number,
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
): boolean => {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
};

// Функция для создания хеша из массива объектов
export const createHash = (objects: unknown[]): string => {
  return objects
    .map((obj) => {
      if (typeof obj === "object" && obj !== null) {
        return Object.values(obj as Record<string, unknown>).join("-");
      }
      return String(obj);
    })
    .join("|");
};

// Функция для оптимизации маркеров по зуму
export const getOptimizedMarkerSettings = (zoom: number) => {
  const roundedZoom = Math.round(zoom);

  return {
    showNames: roundedZoom >= 12,
    showDetails: roundedZoom >= 14,
    enableClustering: roundedZoom < 15,
    markerSize:
      roundedZoom < 10 ? "small" : roundedZoom < 13 ? "medium" : "large",
    updateFrequency: roundedZoom > 16 ? 15000 : 30000, // Более частые обновления на высоком зуме
  };
};

// Функция для предзагрузки изображений маркеров
export const preloadMarkerImages = (imagePaths: string[]): Promise<void[]> => {
  const promises = imagePaths.map((path) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = path;
    });
  });

  return Promise.all(promises);
};

// Функция для оптимизации DOM операций
export const batchDOMUpdates = (updates: (() => void)[]): void => {
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
};

// Функция для проверки производительности устройства
export const getDevicePerformance = (): "low" | "medium" | "high" => {
  // Проверяем количество ядер процессора
  const cores = navigator.hardwareConcurrency || 1;

  // Проверяем память устройства (если доступно)
  const memory = (navigator as { deviceMemory?: number }).deviceMemory || 1;

  // Проверяем, работаем ли в WebView
  const isWebView =
    typeof (window as { flutter_inappwebview?: unknown })
      .flutter_inappwebview !== "undefined";

  if (isWebView && cores <= 2 && memory <= 2) {
    return "low";
  } else if (cores <= 4 && memory <= 4) {
    return "medium";
  } else {
    return "high";
  }
};

// Настройки производительности в зависимости от устройства
export const getPerformanceSettings = () => {
  const performance = getDevicePerformance();

  switch (performance) {
    case "low":
      return {
        markerUpdateInterval: 60000, // 1 минута
        debounceDelay: 1500,
        maxMarkersVisible: 50,
        enableAnimations: false,
        clusteringEnabled: true,
        minZoomForNames: 14,
      };
    case "medium":
      return {
        markerUpdateInterval: 30000, // 30 секунд
        debounceDelay: 1000,
        maxMarkersVisible: 100,
        enableAnimations: true,
        clusteringEnabled: true,
        minZoomForNames: 12,
      };
    case "high":
      return {
        markerUpdateInterval: 15000, // 15 секунд
        debounceDelay: 500,
        maxMarkersVisible: 200,
        enableAnimations: true,
        clusteringEnabled: false,
        minZoomForNames: 10,
      };
    default:
      return {
        markerUpdateInterval: 30000,
        debounceDelay: 1000,
        maxMarkersVisible: 100,
        enableAnimations: true,
        clusteringEnabled: true,
        minZoomForNames: 12,
      };
  }
};

// Функция для логирования производительности
export const logPerformance = (operation: string, startTime: number): void => {
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (duration > 100) {
    // Логируем только медленные операции
    console.warn(
      `🐌 Slow operation: ${operation} took ${duration.toFixed(2)}ms`
    );
  } else if (duration > 50) {
    console.log(`⚡ ${operation} took ${duration.toFixed(2)}ms`);
  }
};

// Хук для мониторинга производительности
export const usePerformanceMonitor = () => {
  const startTime = performance.now();

  return {
    measure: (operation: string) => {
      logPerformance(operation, startTime);
    },
    reset: () => {
      return performance.now();
    },
  };
};

// Дополнительные утилиты для оптимизации зума
export const createZoomOptimizer = () => {
  let lastZoomTime = 0;
  let zoomAnimationFrame: number | null = null;

  return {
    // Оптимизированное изменение зума с RAF
    smoothZoom: (
      currentZoom: number,
      targetZoom: number,
      onUpdate: (zoom: number) => void,
      duration = 300
    ) => {
      if (zoomAnimationFrame) {
        cancelAnimationFrame(zoomAnimationFrame);
      }

      const startTime = performance.now();
      const zoomDiff = targetZoom - currentZoom;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function для плавности
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const newZoom = currentZoom + zoomDiff * easeProgress;

        onUpdate(newZoom);

        if (progress < 1) {
          zoomAnimationFrame = requestAnimationFrame(animate);
        } else {
          zoomAnimationFrame = null;
        }
      };

      zoomAnimationFrame = requestAnimationFrame(animate);
    },

    // Дебаунс для зума с учетом производительности
    debouncedZoom: (callback: () => void, delay = 100) => {
      const now = performance.now();
      if (now - lastZoomTime > delay) {
        lastZoomTime = now;
        callback();
      }
    },

    // Очистка анимации
    cleanup: () => {
      if (zoomAnimationFrame) {
        cancelAnimationFrame(zoomAnimationFrame);
        zoomAnimationFrame = null;
      }
    },
  };
};

// Утилита для адаптивного зума в зависимости от контента
export const getOptimalZoom = (
  bounds: { north: number; south: number; east: number; west: number },
  containerWidth: number,
  containerHeight: number
): number => {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 21;

  function latRad(lat: number) {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx: number, worldPx: number, fraction: number) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const latFraction = (latRad(bounds.north) - latRad(bounds.south)) / Math.PI;
  const lngDiff = bounds.east - bounds.west;
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(containerHeight, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(containerWidth, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
};

// Утилита для проверки видимости маркера на текущем зуме
export const isMarkerVisible = (
  markerLat: number,
  markerLng: number,
  mapBounds: { north: number; south: number; east: number; west: number },
  zoom: number,
  minZoomForVisibility = 8
): boolean => {
  if (zoom < minZoomForVisibility) {
    return false;
  }

  return (
    markerLat <= mapBounds.north &&
    markerLat >= mapBounds.south &&
    markerLng <= mapBounds.east &&
    markerLng >= mapBounds.west
  );
};

// Утилита для группировки маркеров по зуму
export const groupMarkersByZoom = <
  T extends { latitude: number; longitude: number }
>(
  markers: T[],
  zoom: number,
  gridSize = 50
): T[][] => {
  if (zoom >= 15) {
    // На высоком зуме показываем все маркеры
    return markers.map((marker) => [marker]);
  }

  const groups: Map<string, T[]> = new Map();
  const scale = Math.pow(2, zoom);

  markers.forEach((marker) => {
    const x = Math.floor((marker.longitude * scale) / gridSize);
    const y = Math.floor((marker.latitude * scale) / gridSize);
    const key = `${x},${y}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(marker);
  });

  return Array.from(groups.values());
};

// Утилита для оптимизации обновлений маркеров
export const createMarkerUpdateOptimizer = () => {
  let updateTimeout: NodeJS.Timeout | null = null;
  const pendingUpdates: Set<string> = new Set();

  return {
    scheduleUpdate: (markerId: string, updateFn: () => void, delay = 16) => {
      pendingUpdates.add(markerId);

      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      updateTimeout = setTimeout(() => {
        const updates = Array.from(pendingUpdates);
        pendingUpdates.clear();

        // Батчим обновления для лучшей производительности
        requestAnimationFrame(() => {
          updates.forEach(() => updateFn());
        });

        updateTimeout = null;
      }, delay);
    },

    cleanup: () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
        updateTimeout = null;
      }
      pendingUpdates.clear();
    },
  };
};

const mapOptimizationUtils = {
  debounce,
  throttle,
  calculateDistance,
  isPointInBounds,
  createHash,
  getOptimizedMarkerSettings,
  preloadMarkerImages,
  batchDOMUpdates,
  getDevicePerformance,
  getPerformanceSettings,
  logPerformance,
  usePerformanceMonitor,
  createZoomOptimizer,
  getOptimalZoom,
  isMarkerVisible,
  groupMarkersByZoom,
  createMarkerUpdateOptimizer,
};

export default mapOptimizationUtils;
