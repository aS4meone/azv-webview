import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";
import { ICar, CarStatus } from "@/shared/models/types/car";
import { UserRole } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { useModal } from "@/shared/ui/modal";
import { useRemoveAllQueries } from "@/shared/utils/urlUtils";
import { useMap } from "@vis.gl/react-google-maps";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  logPerformance,
  preloadMarkerImages,
} from "@/shared/utils/mapOptimization";

const ZOOM_LEVELS = {
  CLUSTER_ONLY: 8,
  SMALL_MARKERS: 10,
  MEDIUM_MARKERS: 13,
  LARGE_MARKERS: 16,
  SHOW_NAMES: 14,
  MAX_MARKERS_LOW_ZOOM: 50,
  MAX_MARKERS_HIGH_ZOOM: 200,
} as const;

const PERFORMANCE_CONFIG = {
  MAX_VISIBLE_MARKERS: 150, // Максимум маркеров для отображения
  VIEWPORT_PADDING: 0.2, // 20% отступ от видимой области
  UPDATE_DEBOUNCE: 100, // Дебаунс обновлений в мс
  BATCH_SIZE: 20, // Размер пакета для обработки маркеров
} as const;

// Конфигурация кэширования
const CACHE_CONFIG = {
  TTL_WITH_RENTAL: 5000 as number, // 5 секунд при активной аренде
  TTL_WITHOUT_RENTAL: 30000 as number, // 30 секунд без аренды
  TTL_MECHANIC_TRACKING: 10000 as number, // 10 секунд при отслеживании
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hasCurrentRental: boolean;
}

preloadMarkerImages(["/images/carmarker.png"]).catch(console.error);

export const MapWithMarkers = ({
  onCarFound,
}: {
  onCarFound?: (car: ICar) => void;
}) => {
  const { showModal, hideModal } = useModal();

  const {
    fetchAllVehicles,
    allVehicles,
    fetchAllMechanicVehicles,
    allMechanicVehicles,
    fetchCurrentDeliveryVehicle,
    currentDeliveryVehicle,
  } = useVehiclesStore();
  const { user } = useUserStore();

  const map = useMap();
  const searchParams = useSearchParams();
  const carId = Number(searchParams?.get("carId")) || 0;
  const removeAllQueries = useRemoveAllQueries();

  // Оптимизированное состояние зума с дебаунсом
  const [zoom, setZoom] = useState(15);
  const zoomUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastZoomRef = useRef(15);
  const deliveryMarkerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!map) return;

    const updateZoom = () => {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined) {
        const roundedZoom = Math.round(currentZoom);

        // Обновляем зум только если изменение значительное (>= 1 уровень)
        if (Math.abs(roundedZoom - lastZoomRef.current) >= 1) {
          // Очищаем предыдущий timeout
          if (zoomUpdateTimeoutRef.current) {
            clearTimeout(zoomUpdateTimeoutRef.current);
          }

          // Устанавливаем дебаунс для обновления зума
          zoomUpdateTimeoutRef.current = setTimeout(() => {
            setZoom(roundedZoom);
            lastZoomRef.current = roundedZoom;
          }, 200); // 200мс дебаунс
        }
      }
    };

    // Получаем начальный зум
    updateZoom();

    // Слушаем изменения зума
    const zoomListener = map.addListener("zoom_changed", updateZoom);

    return () => {
      google.maps.event.removeListener(zoomListener);
      if (zoomUpdateTimeoutRef.current) {
        clearTimeout(zoomUpdateTimeoutRef.current);
      }
    };
  }, [map]);

  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerLibraryLoadedRef = useRef(false);
  const processedCarIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackingModalShownRef = useRef<boolean>(false);

  // Кэширование данных
  const vehiclesCacheRef = useRef<CacheEntry<ICar[]> | null>(null);
  const mechanicVehiclesCacheRef = useRef<CacheEntry<ICar[]> | null>(null);
  const deliveryVehicleCacheRef = useRef<CacheEntry<ICar | null> | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // Оптимизация производительности
  const markerPoolRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const visibleMarkersRef = useRef<Set<number>>(new Set());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Функции для работы с кэшем
  const isCacheValid = useCallback(
    <T,>(
      cacheEntry: CacheEntry<T> | null,
      hasCurrentRental: boolean
    ): boolean => {
      if (!cacheEntry) return false;

      const now = Date.now();
      const age = now - cacheEntry.timestamp;

      // Если статус current rental изменился, кэш недействителен
      if (cacheEntry.hasCurrentRental !== hasCurrentRental) {
        return false;
      }

      // Определяем TTL в зависимости от состояния
      let ttl = CACHE_CONFIG.TTL_WITHOUT_RENTAL;

      if (hasCurrentRental) {
        ttl = CACHE_CONFIG.TTL_WITH_RENTAL;
      } else if (
        user?.role === UserRole.MECHANIC &&
        localStorage.getItem("tracking_car_id")
      ) {
        ttl = CACHE_CONFIG.TTL_MECHANIC_TRACKING;
      }

      return age < ttl;
    },
    [user?.role]
  );

  const clearAllCaches = useCallback(() => {
    vehiclesCacheRef.current = null;
    mechanicVehiclesCacheRef.current = null;
    deliveryVehicleCacheRef.current = null;
  }, []);

  const updateCache = useCallback(
    <T,>(
      cacheRef: React.MutableRefObject<CacheEntry<T> | null>,
      data: T,
      hasCurrentRental: boolean
    ) => {
      cacheRef.current = {
        data,
        timestamp: Date.now(),
        hasCurrentRental,
      };
    },
    []
  );

  // Функция для проверки видимости маркера в viewport
  const isVehicleInViewport = useCallback(
    (vehicle: ICar, bounds: google.maps.LatLngBounds): boolean => {
      if (!bounds) return true;

      const vehicleLatLng = new google.maps.LatLng(
        vehicle.latitude,
        vehicle.longitude
      );
      return bounds.contains(vehicleLatLng);
    },
    []
  );

  // Получение расширенного viewport с отступами
  const getExtendedViewport =
    useCallback((): google.maps.LatLngBounds | null => {
      if (!map) return null;

      const bounds = map.getBounds();
      if (!bounds) return null;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const latSpan = ne.lat() - sw.lat();
      const lngSpan = ne.lng() - sw.lng();

      const latPadding = latSpan * PERFORMANCE_CONFIG.VIEWPORT_PADDING;
      const lngPadding = lngSpan * PERFORMANCE_CONFIG.VIEWPORT_PADDING;

      return new google.maps.LatLngBounds(
        new google.maps.LatLng(sw.lat() - latPadding, sw.lng() - lngPadding),
        new google.maps.LatLng(ne.lat() + latPadding, ne.lng() + lngPadding)
      );
    }, [map]);

  // Фильтрация маркеров по видимости и приоритету
  const getVisibleVehicles = useCallback(
    (vehicles: ICar[]): ICar[] => {
      if (!map || vehicles.length <= PERFORMANCE_CONFIG.MAX_VISIBLE_MARKERS) {
        return vehicles;
      }

      const extendedBounds = getExtendedViewport();
      if (!extendedBounds)
        return vehicles.slice(0, PERFORMANCE_CONFIG.MAX_VISIBLE_MARKERS);

      // Сначала показываем машины в видимой области
      const visibleVehicles = vehicles.filter((vehicle) =>
        isVehicleInViewport(vehicle, extendedBounds)
      );

      // Если видимых машин больше лимита, приоритизируем
      if (visibleVehicles.length > PERFORMANCE_CONFIG.MAX_VISIBLE_MARKERS) {
        // Сортируем по приоритету (например, по статусу)
        const prioritized = visibleVehicles.sort((a, b) => {
          // Приоритет: текущая аренда > доставка > в пути > свободные
          const getPriority = (car: ICar) => {
            if (user?.current_rental?.car_details?.id === car.id) return 4;
            if (car.status === CarStatus.delivering) return 3;
            if (car.status === CarStatus.inUse) return 2;
            return 1;
          };
          return getPriority(b) - getPriority(a);
        });

        return prioritized.slice(0, PERFORMANCE_CONFIG.MAX_VISIBLE_MARKERS);
      }

      return visibleVehicles;
    },
    [map, user, getExtendedViewport, isVehicleInViewport]
  );

  // Получение маркера из пула или создание нового
  const getMarkerFromPool =
    useCallback((): google.maps.marker.AdvancedMarkerElement | null => {
      if (markerPoolRef.current.length > 0) {
        return markerPoolRef.current.pop() || null;
      }
      return null;
    }, []);

  // Возврат маркера в пул
  const returnMarkerToPool = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement) => {
      if (marker.map) {
        marker.map = null;
      }
      // Очищаем обработчики событий
      google.maps.event.clearInstanceListeners(marker);
      markerPoolRef.current.push(marker);
    },
    []
  );

  // Оптимизированная функция для загрузки автомобилей в зависимости от роли
  const fetchVehiclesByRole = useCallback(async () => {
    const hasCurrentRental = Boolean(user?.current_rental);
    const now = Date.now();

    // Предотвращаем множественные одновременные запросы
    if (isFetchingRef.current) {
      return;
    }

    // Проверяем кэш
    if (user?.role === UserRole.MECHANIC) {
      const mechanicCacheValid = isCacheValid(
        mechanicVehiclesCacheRef.current,
        hasCurrentRental
      );
      const deliveryCacheValid = isCacheValid(
        deliveryVehicleCacheRef.current,
        hasCurrentRental
      );

      // Принудительно обновляем данные если есть активная доставка
      const hasActiveDelivery =
        currentDeliveryVehicle &&
        currentDeliveryVehicle.id !== 0 &&
        currentDeliveryVehicle.status !== CarStatus.free;

      if (mechanicCacheValid && deliveryCacheValid && !hasActiveDelivery) {
        return;
      }
    } else {
      const vehiclesCacheValid = isCacheValid(
        vehiclesCacheRef.current,
        hasCurrentRental
      );
      if (vehiclesCacheValid) {
        return;
      }
    }

    // Если есть current rental, сбрасываем весь кэш
    if (hasCurrentRental) {
      clearAllCaches();
    }

    try {
      isFetchingRef.current = true;
      lastFetchTimeRef.current = now;

      if (user?.role === UserRole.MECHANIC) {
        // Загружаем все машины механика
        await fetchAllMechanicVehicles();

        // Пытаемся загрузить текущую доставку, но не падаем при 404
        try {
          await fetchCurrentDeliveryVehicle();
        } catch (error: unknown) {
          // 404 означает, что нет текущей доставки - это нормально
          if (
            error &&
            typeof error === "object" &&
            "response" in error &&
            error.response &&
            typeof error.response === "object" &&
            "status" in error.response &&
            error.response.status === 404
          ) {
            console.log("No current delivery found - this is normal");
          } else {
            console.warn("Failed to fetch current delivery vehicle:", error);
          }
        }

        updateCache(
          mechanicVehiclesCacheRef,
          allMechanicVehicles,
          hasCurrentRental
        );
        updateCache(
          deliveryVehicleCacheRef,
          currentDeliveryVehicle,
          hasCurrentRental
        );
      } else {
        await fetchAllVehicles();
        updateCache(vehiclesCacheRef, allVehicles, hasCurrentRental);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [
    user?.role,
    user?.current_rental,
    fetchAllVehicles,
    fetchAllMechanicVehicles,
    fetchCurrentDeliveryVehicle,
    allVehicles,
    allMechanicVehicles,
    currentDeliveryVehicle,
    isCacheValid,
    clearAllCaches,
    updateCache,
  ]);

  // Fetch vehicles based on user role - первоначальная загрузка
  useEffect(() => {
    fetchVehiclesByRole();
  }, [fetchVehiclesByRole, user]);

  // Принудительное обновление при изменении currentDeliveryVehicle для механика
  useEffect(() => {
    if (user?.role === UserRole.MECHANIC && currentDeliveryVehicle) {
      // Если есть активная доставка, принудительно обновляем данные
      if (
        currentDeliveryVehicle.id !== 0 &&
        currentDeliveryVehicle.status !== CarStatus.free
      ) {
        fetchVehiclesByRole();
      }
    }
  }, [currentDeliveryVehicle, user?.role, fetchVehiclesByRole]);

  // Автоматическое центрирование на current delivery vehicle для механика
  useEffect(() => {
    if (
      map &&
      user?.role === UserRole.MECHANIC &&
      currentDeliveryVehicle &&
      currentDeliveryVehicle.id !== 0 &&
      currentDeliveryVehicle.latitude &&
      currentDeliveryVehicle.longitude &&
      currentDeliveryVehicle.status !== CarStatus.free
    ) {
      // Центрируем карту на текущей доставке
      map.setCenter({
        lat: currentDeliveryVehicle.latitude,
        lng: currentDeliveryVehicle.longitude,
      });
      map.setZoom(16); // Устанавливаем удобный зум для просмотра машины
    }
  }, [map, user, currentDeliveryVehicle]);

  // Автоматическое центрирование на машину из текущей аренды
  useEffect(() => {
    if (
      map &&
      user?.current_rental &&
      user.current_rental.car_details &&
      user.current_rental.car_details.latitude &&
      user.current_rental.car_details.longitude
    ) {
      // Центрируем карту на арендованной машине
      map.setCenter({
        lat: user.current_rental.car_details.latitude,
        lng: user.current_rental.car_details.longitude,
      });
      map.setZoom(16); // Устанавливаем удобный зум для просмотра машины
    }
  }, [map, user?.current_rental]);

  // Интервал для обновления списка автомобилей с адаптивной частотой
  useEffect(() => {
    if (user) {
      // Адаптивный интервал в зависимости от состояния
      const hasCurrentRental = Boolean(user?.current_rental);
      const isTracking =
        user?.role === UserRole.MECHANIC &&
        localStorage.getItem("tracking_car_id");

      let updateInterval = CACHE_CONFIG.TTL_WITHOUT_RENTAL;
      if (hasCurrentRental) {
        updateInterval = CACHE_CONFIG.TTL_WITH_RENTAL;
      } else if (isTracking) {
        updateInterval = CACHE_CONFIG.TTL_MECHANIC_TRACKING;
      }

      intervalRef.current = setInterval(() => {
        fetchVehiclesByRole();
      }, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, user?.current_rental, fetchVehiclesByRole]);

  useEffect(() => {
    if (carId && user && processedCarIdRef.current !== carId) {
      let vehiclesList: ICar[] = [];

      if (user.role === UserRole.MECHANIC) {
        // Для механика проверяем сначала current delivery, потом все машины
        if (currentDeliveryVehicle && currentDeliveryVehicle.id !== 0) {
          vehiclesList = [currentDeliveryVehicle];
        } else {
          vehiclesList = allMechanicVehicles;
        }
      } else {
        vehiclesList = allVehicles;
      }

      if (vehiclesList.length > 0) {
        const needCar = vehiclesList.find((car) => car.id === carId);

        if (needCar) {
          processedCarIdRef.current = carId;

          if (onCarFound) {
            onCarFound(needCar);
          }

          const content = handleCarInteraction({
            user,
            notRentedCar: needCar,
            hideModal: () => {
              hideModal();
              removeAllQueries();
              processedCarIdRef.current = null;
            },
          });

          if (content) {
            showModal({
              children: content,
            });
          }

          setTimeout(() => {
            removeAllQueries();
          }, 100);
        }
      }
    }
  }, [
    carId,
    user,
    allVehicles,
    allMechanicVehicles,
    currentDeliveryVehicle,
    onCarFound,
    showModal,
    hideModal,
    removeAllQueries,
  ]);

  // Оптимизированная функция создания маркера
  const createAdvancedMarker = useCallback(
    (
      vehicle: ICar,
      existingMarker?: google.maps.marker.AdvancedMarkerElement | null
    ) => {
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
        return null;
      }

      const roundedZoom = Math.round(zoom);

      // Расчет размеров маркеров с оптимизацией для производительности
      const baseWidth: number =
        roundedZoom < ZOOM_LEVELS.MEDIUM_MARKERS ? 6 : 8;
      const aspectRatio = 29 / 12;
      const markerWidth = Math.max(4, Math.min(20, baseWidth)); // Уменьшенные размеры для производительности
      const markerHeight = markerWidth * aspectRatio;
      const textSize = Math.max(8, Math.min(14, roundedZoom - 2)); // Уменьшенный размер шрифта
      const showNames = roundedZoom >= ZOOM_LEVELS.SHOW_NAMES;
      const showDetails = roundedZoom >= ZOOM_LEVELS.LARGE_MARKERS;

      // Попробуем переиспользовать существующий маркер
      const reuseMarker = existingMarker || getMarkerFromPool();

      // Create marker content
      const markerDiv = document.createElement("div");
      markerDiv.style.cssText = `
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          // transform: rotate(${vehicle.course}deg);
          will-change: transform;
          transition: transform 0.2s ease;
          background-color: transparent;
          min-width: ${markerWidth + 15}px;
          min-height: ${markerHeight + 15}px;
        `;

      // Add vehicle name if zoom is sufficient
      if (showNames) {
        const nameDiv = document.createElement("div");
        nameDiv.className = "marker-name";

        // Определяем цвет фона в зависимости от роли пользователя и статуса автомобиля
        let backgroundColor = "rgba(255, 255, 255, 0.95)";
        let borderColor = "#e5e7eb";
        let textColor = "#374151";

        if (user?.role === UserRole.MECHANIC) {
          switch (vehicle.status) {
            case CarStatus.pending:
              backgroundColor = "rgba(255, 228, 148, 0.95)"; // Желтый
              borderColor = "#f59e0b";
              textColor = "#92400e";
              break;
            case CarStatus.delivering:
              backgroundColor = "rgba(255, 228, 148, 0.95)"; // Зеленый
              borderColor = "#f59e0b";
              textColor = "#92400e";
              break;
            case CarStatus.inUse:
              backgroundColor = "rgba(34, 197, 94, 0.95)"; // Красный
              // borderColor = "#dc2626";
              // textColor = "#991b1b";
              borderColor = "#16a34a";
              textColor = "#15803d";
              break;
            case CarStatus.free:
              backgroundColor = "rgba(239, 124, 124, 0.95)"; // Красный
              borderColor = "#dc2626";
              textColor = "#991b1b";
              break;
            default:
              // Оставляем стандартные цвета для других статусов
              break;
          }
        }

        nameDiv.style.cssText = `
            position: absolute;
            top: -${markerHeight + 8}px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${backgroundColor};
            border: 1px solid ${borderColor};
            border-radius: 6px;
            padding: 3px 8px;
            font-size: ${textSize}px;
            font-weight: 600;
            color: ${textColor};
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(4px);
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            z-index: 10;
            pointer-events: none;
          `;
        nameDiv.textContent = vehicle.name;
        markerDiv.appendChild(nameDiv);
      }

      // Add car icon with status-based coloring for mechanic
      const iconImg = document.createElement("img");
      iconImg.src = "/images/carmarker.png";
      iconImg.alt = "Car marker";
      iconImg.loading = "lazy";

      // Определяем цвет маркера в зависимости от роли пользователя и статуса машины
      let filter = "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))";

      if (user?.role === UserRole.MECHANIC) {
        switch (vehicle.status) {
          case CarStatus.free:
            // Свободные - красные
            filter =
              "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) hue-rotate(0deg) saturate(1.5) brightness(1) contrast(1.2)";
            break;
          case CarStatus.inUse:
            // В аренде - зеленые
            filter =
              "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) hue-rotate(120deg) saturate(1.3) brightness(1.1)";
            break;
          case CarStatus.pending:
          case CarStatus.delivering:
            // Доставка/проверка - желтые
            filter =
              "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) hue-rotate(60deg) saturate(1.4) brightness(1.2)";
            break;
          default:
            // Стандартный цвет для других статусов
            break;
        }
      }

      iconImg.style.cssText = `
          width: ${markerWidth}px;
          height: ${markerHeight}px;
          filter: ${filter};
          transition: all 0.2s ease;
        `;

      // Добавляем hover эффект только для больших зумов
      if (showDetails) {
        iconImg.addEventListener("mouseenter", () => {
          iconImg.style.transform = "scale(1.1)";
          iconImg.style.filter = "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))";
        });

        iconImg.addEventListener("mouseleave", () => {
          iconImg.style.transform = "scale(1)";
          iconImg.style.filter = "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))";
        });
      }

      markerDiv.appendChild(iconImg);

      // Создаем или переиспользуем маркер
      let finalMarker: google.maps.marker.AdvancedMarkerElement;

      if (reuseMarker) {
        // Переиспользуем существующий маркер
        finalMarker = reuseMarker;
        finalMarker.position = {
          lat: vehicle.latitude,
          lng: vehicle.longitude,
        };
        finalMarker.content = markerDiv;
        finalMarker.title = vehicle.name;
      } else {
        // Создаем новый маркер
        finalMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: vehicle.latitude, lng: vehicle.longitude },
          content: markerDiv,
          title: vehicle.name,
        });
      }

      // Очищаем старые обработчики и добавляем новые
      google.maps.event.clearInstanceListeners(finalMarker);

      // Add click handler
      finalMarker.addListener("click", async () => {
        if (user === null) {
          return;
        }

        // Автоматический зум до 16 уровня и центрирование на машине
        if (map) {
          map.setZoom(16);
          map.setCenter({ lat: vehicle.latitude, lng: vehicle.longitude });
        }

        const content = handleCarInteraction({
          user,
          notRentedCar: vehicle,
          hideModal: () => {
            hideModal();
          },
        });

        if (content === null) {
          return;
        }

        showModal({
          children: content,
        });
      });

      return finalMarker;
    },
    [user, showModal, hideModal, map, zoom, getMarkerFromPool]
  );

  // Функция для получения кэшированных или актуальных данных
  const getCachedOrFreshData = useCallback(() => {
    const hasCurrentRental = Boolean(user?.current_rental);

    if (user?.role === UserRole.MECHANIC) {
      // Проверяем кэш для механика
      const mechanicCacheValid = isCacheValid(
        mechanicVehiclesCacheRef.current,
        hasCurrentRental
      );
      const deliveryCacheValid = isCacheValid(
        deliveryVehicleCacheRef.current,
        hasCurrentRental
      );

      return {
        allMechanicVehicles: mechanicCacheValid
          ? mechanicVehiclesCacheRef.current!.data
          : allMechanicVehicles,
        currentDeliveryVehicle: deliveryCacheValid
          ? deliveryVehicleCacheRef.current!.data
          : currentDeliveryVehicle,
      };
    } else {
      // Проверяем кэш для обычного пользователя
      const vehiclesCacheValid = isCacheValid(
        vehiclesCacheRef.current,
        hasCurrentRental
      );

      return {
        allVehicles: vehiclesCacheValid
          ? vehiclesCacheRef.current!.data
          : allVehicles,
      };
    }
  }, [
    user,
    allVehicles,
    allMechanicVehicles,
    currentDeliveryVehicle,
    isCacheValid,
  ]);

  // Эффект для управления маркерами - обновляем всегда
  useEffect(() => {
    if (!map || !user) {
      return;
    }

    // Получаем список машин с учетом кэширования
    let vehicles: ICar[] = [];
    const cachedData = getCachedOrFreshData();

    // Если у пользователя есть текущая аренда, показываем только эту машину
    if (user?.current_rental) {
      const rentalVehicle = user.current_rental.car_details;
      vehicles = [rentalVehicle];
    } else if (user?.role === UserRole.MECHANIC) {
      // Используем кэшированные данные для механика
      const {
        allMechanicVehicles: mechanicVehicles,
        currentDeliveryVehicle: deliveryVehicle,
      } = cachedData as {
        allMechanicVehicles: ICar[];
        currentDeliveryVehicle: ICar | null;
      };

      // Проверяем, есть ли активная слежка
      const trackingCarId = localStorage.getItem("tracking_car_id");

      if (trackingCarId && mechanicVehicles && mechanicVehicles.length > 0) {
        // Если есть активная слежка, показываем только отслеживаемую машину
        const trackingCar = mechanicVehicles.find(
          (car) => car.id === parseInt(trackingCarId)
        );
        if (trackingCar) {
          vehicles = [trackingCar];
        } else {
          // Если машина не найдена, удаляем ID из localStorage и показываем все машины
          localStorage.removeItem("tracking_car_id");
          vehicles = mechanicVehicles || [];
        }
      } else if (
        deliveryVehicle &&
        deliveryVehicle.id !== 0 &&
        deliveryVehicle.status !== CarStatus.free &&
        deliveryVehicle.status !== CarStatus.deliveryInProgress
      ) {
        // Для механика: если есть current delivery и он активен, показываем только его
        vehicles = [deliveryVehicle];
      } else {
        // Иначе показываем все машины механика
        vehicles = mechanicVehicles || [];
      }
    } else {
      // Для обычных пользователей используем кэшированные данные
      const { allVehicles: cachedVehicles } = cachedData as {
        allVehicles: ICar[];
      };
      vehicles = cachedVehicles || [];
    }

    if (!vehicles || !vehicles.length) {
      return;
    }

    // Дебаунсинг обновления маркеров
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(async () => {
        const startTime = performance.now();

        try {
          if (
            !window.google?.maps?.marker?.AdvancedMarkerElement &&
            !markerLibraryLoadedRef.current
          ) {
            markerLibraryLoadedRef.current = true;
            await window.google.maps.importLibrary("marker");
          }

          // Фильтруем только видимые машины для производительности
          const visibleVehicles = getVisibleVehicles(vehicles);

          // Возвращаем старые маркеры в пул
          markersRef.current.forEach((marker) => {
            returnMarkerToPool(marker);
          });

          if (deliveryMarkerRef.current) {
            deliveryMarkerRef.current.map = null;
            deliveryMarkerRef.current = null;
          }

          // Пакетная обработка создания маркеров
          const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

          const processBatch = (startIndex: number) => {
            const endIndex = Math.min(
              startIndex + PERFORMANCE_CONFIG.BATCH_SIZE,
              visibleVehicles.length
            );

            for (let i = startIndex; i < endIndex; i++) {
              const vehicle = visibleVehicles[i];
              const marker = createAdvancedMarker(vehicle);
              if (marker) {
                newMarkers.push(marker);
              }
            }

            // Показываем маркеры из текущего пакета
            for (
              let i = newMarkers.length - (endIndex - startIndex);
              i < newMarkers.length;
              i++
            ) {
              if (newMarkers[i]) {
                newMarkers[i].map = map;
              }
            }

            // Обрабатываем следующий пакет
            if (endIndex < visibleVehicles.length) {
              requestAnimationFrame(() => processBatch(endIndex));
            } else {
              // Завершаем обновление
              markersRef.current = newMarkers;
              visibleMarkersRef.current = new Set(
                visibleVehicles.map((v) => v.id)
              );

              // Логируем производительность
              logPerformance(
                `Optimized markers update (${newMarkers.length}/${vehicles.length} markers)`,
                startTime
              );
            }
          };

          // Начинаем пакетную обработку
          processBatch(0);
        } catch (error) {
          console.error("Error updating markers:", error);
        }
      });
    }, PERFORMANCE_CONFIG.UPDATE_DEBOUNCE);
  }, [
    map,
    zoom,
    allVehicles,
    allMechanicVehicles,
    currentDeliveryVehicle,
    user,
    showModal,
    hideModal,
    createAdvancedMarker,
    getCachedOrFreshData,
    getVisibleVehicles,
    returnMarkerToPool,
  ]);

  // Эффект для управления маркером точки доставки
  useEffect(() => {
    if (!map || !user) {
      // Очищаем маркер если есть
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.map = null;
        deliveryMarkerRef.current = null;
      }
      return;
    }

    // Показываем точку доставки только если она установлена вручную через контекст
  }, [map, user]);

  // Эффект для сброса кэша при изменении статуса current rental или current delivery vehicle
  useEffect(() => {
    const hasCurrentRental = Boolean(user?.current_rental);

    // Проверяем все кэши на совместимость с текущим статусом аренды
    if (
      vehiclesCacheRef.current &&
      vehiclesCacheRef.current.hasCurrentRental !== hasCurrentRental
    ) {
      vehiclesCacheRef.current = null;
    }
    if (
      mechanicVehiclesCacheRef.current &&
      mechanicVehiclesCacheRef.current.hasCurrentRental !== hasCurrentRental
    ) {
      mechanicVehiclesCacheRef.current = null;
    }
    if (
      deliveryVehicleCacheRef.current &&
      deliveryVehicleCacheRef.current.hasCurrentRental !== hasCurrentRental
    ) {
      deliveryVehicleCacheRef.current = null;
    }

    // Принудительно сбрасываем кэш при изменении currentDeliveryVehicle для механика
    if (user?.role === UserRole.MECHANIC && currentDeliveryVehicle) {
      // Если есть активная доставка, сбрасываем кэш всех машин механика
      if (
        currentDeliveryVehicle.id !== 0 &&
        currentDeliveryVehicle.status !== CarStatus.free
      ) {
        mechanicVehiclesCacheRef.current = null;
        // Также сбрасываем кэш доставки для принудительного обновления
        deliveryVehicleCacheRef.current = null;
      }
    }
  }, [user?.current_rental, currentDeliveryVehicle, user?.role]);

  // Слушатель события для принудительной очистки кэша после завершения доставки
  useEffect(() => {
    const handleDeliveryCompleted = () => {
      console.log("Delivery completed event received, clearing cache");
      clearAllCaches();
      // Принудительно обновляем данные
      setTimeout(() => {
        fetchVehiclesByRole();
      }, 100);
    };

    // Добавляем слушатель события
    window.addEventListener("deliveryCompleted", handleDeliveryCompleted);

    return () => {
      window.removeEventListener("deliveryCompleted", handleDeliveryCompleted);
    };
  }, [clearAllCaches, fetchVehiclesByRole]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.map = null;
        deliveryMarkerRef.current = null;
      }

      // Возвращаем все маркеры в пул
      markersRef.current.forEach((marker) => {
        returnMarkerToPool(marker);
      });
      markersRef.current = [];

      // Очищаем пул маркеров
      markerPoolRef.current.forEach((marker) => {
        if (marker.map) {
          marker.map = null;
        }
        google.maps.event.clearInstanceListeners(marker);
      });
      markerPoolRef.current = [];

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (zoomUpdateTimeoutRef.current) {
        clearTimeout(zoomUpdateTimeoutRef.current);
      }

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      trackingModalShownRef.current = false;
      visibleMarkersRef.current.clear();

      // Очищаем все кэши при размонтировании
      clearAllCaches();
    };
  }, [clearAllCaches, returnMarkerToPool]);

  return null;
};
