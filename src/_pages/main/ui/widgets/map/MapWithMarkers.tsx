import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";
import { ICar, CarStatus } from "@/shared/models/types/car";
import { UserRole } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { useModal } from "@/shared/ui/modal";
import { useRemoveAllQueries } from "@/shared/utils/urlUtils";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useMap } from "@vis.gl/react-google-maps";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentDelivery } from "@/shared/hooks/useCurrentDelivery";
import { createCarFromDeliveryData } from "@/shared/utils/deliveryUtils";
import {
  getPerformanceSettings,
  createHash,
  logPerformance,
  preloadMarkerImages,
} from "@/shared/utils/mapOptimization";

// Получаем настройки производительности для устройства
const PERFORMANCE_SETTINGS = getPerformanceSettings();

// Константы для оптимизации зума
const ZOOM_LEVELS = {
  CLUSTER_ONLY: 8,
  SMALL_MARKERS: 10,
  MEDIUM_MARKERS: 13,
  LARGE_MARKERS: 16,
  SHOW_NAMES: 12,
  MAX_MARKERS_LOW_ZOOM: 50,
  MAX_MARKERS_HIGH_ZOOM: 200,
} as const;

// Предзагружаем изображения маркеров
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
    fetchPendingVehicles,
    fetchDeliveryVehicles,
    deliveryVehicles,
    pendingVehicles,
    fetchInUseVehicles,
    inUseVehicles,
  } = useVehiclesStore();
  const { user } = useUserStore();

  // Хук для получения текущей доставки механика
  const { deliveryData, isDeliveryMode } = useCurrentDelivery();

  const map = useMap();
  const searchParams = useSearchParams();
  const carId = Number(searchParams?.get("carId")) || 0;
  const removeAllQueries = useRemoveAllQueries();

  // Получаем текущий зум от карты
  const [zoom, setZoom] = useState(15);

  useEffect(() => {
    if (!map) return;

    const updateZoom = () => {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined) {
        setZoom(currentZoom);
      }
    };

    // Получаем начальный зум
    updateZoom();

    // Слушаем изменения зума
    const zoomListener = map.addListener("zoom_changed", updateZoom);

    return () => {
      google.maps.event.removeListener(zoomListener);
    };
  }, [map]);

  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const deliveryMarkerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const markerLibraryLoadedRef = useRef(false);
  const processedCarIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs для оптимизации зума
  const lastVehiclesHashRef = useRef<string>("");
  const lastZoomLevelRef = useRef<number>(Math.round(zoom));
  const markersMapRef = useRef<
    Map<number, google.maps.marker.AdvancedMarkerElement>
  >(new Map());
  const isUpdatingMarkersRef = useRef(false);

  // Функция для загрузки автомобилей в зависимости от роли
  const fetchVehiclesByRole = useCallback(() => {
    if (user?.role === UserRole.MECHANIC) {
      fetchPendingVehicles();
      fetchDeliveryVehicles();
      fetchInUseVehicles();
    } else {
      fetchAllVehicles();
    }
  }, [
    fetchAllVehicles,
    fetchPendingVehicles,
    fetchDeliveryVehicles,
    fetchInUseVehicles,
    user?.role,
  ]);

  // Fetch vehicles based on user role - первоначальная загрузка
  useEffect(() => {
    fetchVehiclesByRole();
  }, [fetchVehiclesByRole]);

  // Интервал для обновления списка автомобилей с адаптивной частотой
  useEffect(() => {
    if (user) {
      // Адаптивная частота обновления в зависимости от зума
      const updateInterval =
        zoom > ZOOM_LEVELS.LARGE_MARKERS
          ? PERFORMANCE_SETTINGS.markerUpdateInterval / 2 // Чаще обновляем на высоком зуме
          : PERFORMANCE_SETTINGS.markerUpdateInterval;

      intervalRef.current = setInterval(() => {
        if (!isUpdatingMarkersRef.current) {
          fetchVehiclesByRole();
        }
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
  }, [user, fetchVehiclesByRole, zoom]);

  // Handle car selection from URL parameters - only once per carId
  useEffect(() => {
    if (carId && user && processedCarIdRef.current !== carId) {
      let vehiclesList: ICar[] = [];

      if (user.role === UserRole.MECHANIC) {
        if (isDeliveryMode && deliveryData) {
          vehiclesList = [createCarFromDeliveryData(deliveryData)];
        } else {
          vehiclesList = [
            ...pendingVehicles,
            ...deliveryVehicles,
            ...inUseVehicles,
          ];
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
            deliveryData,
            isDeliveryMode,
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
    pendingVehicles,
    deliveryVehicles,
    isDeliveryMode,
    inUseVehicles,
    deliveryData,
  ]);

  // Мемоизированный список уникальных машин с фильтрацией по зуму
  const uniqueVehicles = useMemo(() => {
    let vehicles: ICar[] = [];

    // Если у пользователя есть аренда, показываем только его машину
    if (user?.current_rental?.car_details) {
      vehicles = [user.current_rental.car_details];
    } else if (user?.role === UserRole.MECHANIC) {
      // Если у механика есть текущая доставка, показываем только автомобиль доставки
      if (isDeliveryMode && deliveryData) {
        vehicles = [createCarFromDeliveryData(deliveryData)];
      } else {
        vehicles = [...pendingVehicles, ...deliveryVehicles];
      }
    } else {
      vehicles = [...allVehicles];
    }

    // Ограничиваем количество маркеров в зависимости от зума для производительности
    const maxMarkers =
      zoom < ZOOM_LEVELS.MEDIUM_MARKERS
        ? ZOOM_LEVELS.MAX_MARKERS_LOW_ZOOM
        : ZOOM_LEVELS.MAX_MARKERS_HIGH_ZOOM;

    return vehicles.slice(0, maxMarkers);
  }, [
    allVehicles,
    pendingVehicles,
    deliveryVehicles,
    user?.current_rental,
    user?.role,
    isDeliveryMode,
    deliveryData,
    zoom,
  ]);

  // Хеш для определения изменений в списке автомобилей
  const vehiclesHash = useMemo(() => {
    return createHash(
      uniqueVehicles.map((v) => ({
        id: v.id,
        lat: v.latitude,
        lng: v.longitude,
        course: v.course,
      }))
    );
  }, [uniqueVehicles]);

  // Оптимизированный расчет размеров маркеров с учетом зума
  const markerSizes = useMemo(() => {
    const roundedZoom = Math.round(zoom);

    // Более плавная градация размеров
    let baseWidth: number;
    if (roundedZoom < ZOOM_LEVELS.SMALL_MARKERS) {
      baseWidth = 6;
    } else if (roundedZoom < ZOOM_LEVELS.MEDIUM_MARKERS) {
      baseWidth = 8 + (roundedZoom - ZOOM_LEVELS.SMALL_MARKERS) * 1.5;
    } else if (roundedZoom < ZOOM_LEVELS.LARGE_MARKERS) {
      baseWidth = 12 + (roundedZoom - ZOOM_LEVELS.MEDIUM_MARKERS) * 2;
    } else {
      baseWidth = 18 + (roundedZoom - ZOOM_LEVELS.LARGE_MARKERS) * 1;
    }

    const aspectRatio = 29 / 12;
    const width = Math.max(6, Math.min(24, baseWidth));
    const height = width * aspectRatio;

    const textSize = Math.max(8, Math.min(16, roundedZoom - 2));

    return {
      width,
      height,
      textSize,
      showNames: roundedZoom >= ZOOM_LEVELS.SHOW_NAMES,
      showDetails: roundedZoom >= ZOOM_LEVELS.LARGE_MARKERS,
    };
  }, [zoom]);

  // Optimized marker creation function с улучшенным кешированием
  const createAdvancedMarker = useCallback(
    (vehicle: ICar) => {
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
        return null;
      }

      // Проверяем, есть ли уже маркер для этого автомобиля
      const existingMarker = markersMapRef.current.get(vehicle.id);
      if (existingMarker) {
        // Обновляем позицию существующего маркера
        existingMarker.position = {
          lat: vehicle.latitude,
          lng: vehicle.longitude,
        };

        // Обновляем содержимое маркера если изменился зум
        const currentZoomLevel = Math.round(zoom);
        if (currentZoomLevel !== lastZoomLevelRef.current) {
          const content = existingMarker.content as HTMLElement;
          if (content) {
            // Обновляем размеры и стили
            const img = content.querySelector("img");
            if (img) {
              img.style.width = `${markerSizes.width}px`;
              img.style.height = `${markerSizes.height}px`;
            }

            // Обновляем название маркера и его стили
            const nameDiv = content.querySelector(
              ".marker-name"
            ) as HTMLElement;
            if (nameDiv) {
              nameDiv.style.display = markerSizes.showNames ? "block" : "none";

              // Обновляем цвета в зависимости от роли пользователя и статуса автомобиля
              if (markerSizes.showNames) {
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
                      backgroundColor = "rgba(34, 197, 94, 0.95)"; // Зеленый
                      borderColor = "#16a34a";
                      textColor = "#15803d";
                      break;
                    case CarStatus.inUse:
                      backgroundColor = "rgba(239, 124, 124, 0.95)"; // Красный
                      borderColor = "#dc2626";
                      textColor = "#991b1b";
                      break;
                    default:
                      // Оставляем стандартные цвета для других статусов
                      break;
                  }
                }

                nameDiv.style.backgroundColor = backgroundColor;
                nameDiv.style.borderColor = borderColor;
                nameDiv.style.color = textColor;
              }
            }

            content.style.transform = `rotate(${vehicle.course}deg)`;
          }
        }

        return existingMarker;
      }

      const {
        width: markerWidth,
        height: markerHeight,
        textSize,
        showNames,
        showDetails,
      } = markerSizes;

      // Create marker content
      const markerDiv = document.createElement("div");
      markerDiv.style.cssText = `
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transform: rotate(${vehicle.course}deg);
            will-change: transform;
            transition: transform 0.2s ease;
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
              backgroundColor = "rgba(34, 197, 94, 0.95)"; // Зеленый
              borderColor = "#16a34a";
              textColor = "#15803d";
              break;
            case CarStatus.inUse:
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
              background-color: ${backgroundColor};
              border: 1px solid ${borderColor};
              border-radius: 6px;
              padding: 3px 8px;
              font-size: ${textSize}px;
              font-weight: 600;
              color: ${textColor};
              white-space: nowrap;
              margin-bottom: 4px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              backdrop-filter: blur(4px);
              max-width: 120px;
              overflow: hidden;
              text-overflow: ellipsis;
            `;
        nameDiv.textContent = vehicle.name;
        markerDiv.appendChild(nameDiv);
      }

      // Add car icon
      const iconImg = document.createElement("img");
      iconImg.src = "/images/carmarker.png";
      iconImg.alt = "Car marker";
      iconImg.loading = "lazy";
      iconImg.style.cssText = `
            width: ${markerWidth}px;
            height: ${markerHeight}px;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
            transition: all 0.2s ease;
          `;

      // Добавляем hover эффект для больших зумов
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

      // Create marker
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: vehicle.latitude, lng: vehicle.longitude },
        content: markerDiv,
        title: vehicle.name,
      });

      // Add click handler
      marker.addListener("click", () => {
        if (user === null) {
          return;
        }
        const content = handleCarInteraction({
          user,
          notRentedCar: vehicle,
          hideModal: () => {
            hideModal();
          },
          deliveryData,
          isDeliveryMode,
        });

        if (content === null) {
          return;
        }

        showModal({
          children: content,
        });
      });

      // Сохраняем маркер в кеше
      markersMapRef.current.set(vehicle.id, marker);

      return marker;
    },
    [
      markerSizes,
      showModal,
      hideModal,
      user,
      deliveryData,
      isDeliveryMode,
      zoom,
    ]
  );

  // Функция для создания маркера точки доставки
  const createDeliveryMarker = useCallback(() => {
    if (!window.google?.maps?.marker?.AdvancedMarkerElement || !deliveryData) {
      return null;
    }

    const { textSize, showNames } = markerSizes;

    // Create delivery marker content
    const markerDiv = document.createElement("div");
    markerDiv.style.cssText = `
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          animation: pulse 2s infinite;
        `;

    // Add delivery label if zoom is sufficient
    if (showNames) {
      const labelDiv = document.createElement("div");
      labelDiv.style.cssText = `
            background-color: rgba(34, 197, 94, 0.95);
            border: 1px solid #16a34a;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: ${textSize}px;
            font-weight: 700;
            color: white;
            white-space: nowrap;
            margin-bottom: 6px;
            box-shadow: 0 2px 6px rgba(34, 197, 94, 0.3);
            backdrop-filter: blur(4px);
          `;
      labelDiv.textContent = "Точка доставки";
      markerDiv.appendChild(labelDiv);
    }

    // Add delivery icon (pin icon)
    const iconDiv = document.createElement("div");
    const iconSize = Math.max(20, Math.min(32, zoom * 1.5));
    iconDiv.style.cssText = `
          width: ${iconSize}px;
          height: ${iconSize}px;
          background-color: #22c55e;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(34, 197, 94, 0.4);
          position: relative;
          transition: all 0.3s ease;
        `;

    // Add inner dot
    const innerDot = document.createElement("div");
    const dotSize = iconSize * 0.3;
    innerDot.style.cssText = `
          width: ${dotSize}px;
          height: ${dotSize}px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `;
    iconDiv.appendChild(innerDot);
    markerDiv.appendChild(iconDiv);

    // Create delivery marker
    const deliveryMarker = new window.google.maps.marker.AdvancedMarkerElement({
      position: {
        lat: deliveryData.delivery_coordinates.latitude,
        lng: deliveryData.delivery_coordinates.longitude,
      },
      content: markerDiv,
      title: "Точка доставки",
    });

    return deliveryMarker;
  }, [deliveryData, markerSizes, zoom]);

  // Optimized effect to manage markers with zoom-aware updates
  useEffect(() => {
    if (!map || !uniqueVehicles.length) {
      return;
    }

    const currentZoomLevel = Math.round(zoom);
    const zoomChanged =
      Math.abs(currentZoomLevel - lastZoomLevelRef.current) >= 1;
    const vehiclesChanged = vehiclesHash !== lastVehiclesHashRef.current;

    // Обновляем только при значительных изменениях
    if (!zoomChanged && !vehiclesChanged && clustererRef.current) {
      return;
    }

    const initializeMarkers = async () => {
      if (isUpdatingMarkersRef.current) return;
      isUpdatingMarkersRef.current = true;

      const startTime = performance.now();
      try {
        if (
          !window.google?.maps?.marker?.AdvancedMarkerElement &&
          !markerLibraryLoadedRef.current
        ) {
          markerLibraryLoadedRef.current = true;
          await window.google.maps.importLibrary("marker");
        }

        // Очищаем маркеры только при изменении списка автомобилей
        if (vehiclesChanged) {
          const currentVehicleIds = new Set(uniqueVehicles.map((v) => v.id));
          for (const [id, marker] of markersMapRef.current.entries()) {
            if (!currentVehicleIds.has(id)) {
              marker.map = null;
              markersMapRef.current.delete(id);
            }
          }

          if (deliveryMarkerRef.current) {
            deliveryMarkerRef.current.map = null;
            deliveryMarkerRef.current = null;
          }
        }

        // Create or update markers
        const newMarkers = uniqueVehicles
          .map((vehicle) => createAdvancedMarker(vehicle))
          .filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];

        markersRef.current = newMarkers;

        // Create delivery marker if there's an active delivery
        if (
          isDeliveryMode &&
          deliveryData &&
          user?.role === UserRole.MECHANIC
        ) {
          const deliveryMarker = createDeliveryMarker();
          if (deliveryMarker) {
            deliveryMarker.map = map;
            deliveryMarkerRef.current = deliveryMarker;
          }
        }

        // Управление кластеризацией в зависимости от зума
        const shouldCluster =
          zoom < ZOOM_LEVELS.MEDIUM_MARKERS &&
          PERFORMANCE_SETTINGS.clusteringEnabled &&
          newMarkers.length > 10;

        if (shouldCluster && !clustererRef.current) {
          clustererRef.current = new MarkerClusterer({
            map,
            markers: newMarkers,
            algorithmOptions: {
              maxZoom: ZOOM_LEVELS.MEDIUM_MARKERS - 1,
            },
            renderer: {
              render: ({ count, position }) => {
                const size = Math.max(35, Math.min(55, count * 1.5 + 25));
                const clusterDiv = document.createElement("div");
                clusterDiv.style.cssText = `
                      width: ${size}px;
                      height: ${size}px;
                      background: linear-gradient(135deg, #191919, #333);
                      color: white;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: ${count > 99 ? 11 : count > 9 ? 13 : 15}px;
                      border: 3px solid white;
                      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
                      cursor: pointer;
                      transition: all 0.2s ease;
                    `;
                clusterDiv.textContent =
                  count > 999 ? "999+" : count.toString();

                return new google.maps.marker.AdvancedMarkerElement({
                  position,
                  content: clusterDiv,
                });
              },
            },
          });
        } else if (!shouldCluster && clustererRef.current) {
          clustererRef.current.clearMarkers();
          clustererRef.current = null;
          // Показываем все маркеры индивидуально
          newMarkers.forEach((marker) => {
            marker.map = map;
          });
        } else if (clustererRef.current) {
          clustererRef.current.clearMarkers();
          clustererRef.current.addMarkers(newMarkers);
        } else {
          // Показываем маркеры без кластеризации
          newMarkers.forEach((marker) => {
            marker.map = map;
          });
        }

        // Обновляем refs
        lastVehiclesHashRef.current = vehiclesHash;
        lastZoomLevelRef.current = currentZoomLevel;

        // Логируем производительность
        logPerformance(
          `Markers update (${newMarkers.length} markers, zoom: ${currentZoomLevel})`,
          startTime
        );
      } catch (error) {
        console.error("Error updating markers:", error);
      } finally {
        isUpdatingMarkersRef.current = false;
      }
    };

    initializeMarkers();
  }, [
    map,
    vehiclesHash,
    zoom,
    createAdvancedMarker,
    isDeliveryMode,
    deliveryData,
    createDeliveryMarker,
    user?.role,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }

      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.map = null;
        deliveryMarkerRef.current = null;
      }

      for (const marker of markersMapRef.current.values()) {
        if (marker.map) {
          marker.map = null;
        }
      }
      markersMapRef.current.clear();

      markersRef.current.forEach((marker) => {
        if (marker.map) {
          marker.map = null;
        }
      });
      markersRef.current = [];

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return null;
};
