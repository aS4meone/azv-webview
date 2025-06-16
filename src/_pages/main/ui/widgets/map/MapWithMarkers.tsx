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
import {
  getPerformanceSettings,
  createHash,
  logPerformance,
  preloadMarkerImages,
} from "@/shared/utils/mapOptimization";

// Получаем настройки производительности для устройства
const PERFORMANCE_SETTINGS = getPerformanceSettings();

const ZOOM_LEVELS = {
  CLUSTER_ONLY: 8,
  SMALL_MARKERS: 10,
  MEDIUM_MARKERS: 13,
  LARGE_MARKERS: 16,
  SHOW_NAMES: 12,
  MAX_MARKERS_LOW_ZOOM: 50,
  MAX_MARKERS_HIGH_ZOOM: 200,
} as const;

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
  } = useVehiclesStore();
  const { user } = useUserStore();

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

  // Функция для загрузки автомобилей в зависимости от роли
  const fetchVehiclesByRole = useCallback(() => {
    if (user?.role === UserRole.MECHANIC) {
      fetchAllMechanicVehicles();
    } else {
      fetchAllVehicles();
    }
  }, [fetchAllVehicles, fetchAllMechanicVehicles, user?.role]);

  // Fetch vehicles based on user role - первоначальная загрузка
  useEffect(() => {
    fetchVehiclesByRole();
  }, [fetchVehiclesByRole]);

  // Интервал для обновления списка автомобилей с адаптивной частотой
  useEffect(() => {
    if (user) {
      // Более частое обновление для отображения всех машин
      const updateInterval = 30000; // 3 секунды для всех случаев

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
  }, [user, fetchVehiclesByRole]);

  // Handle car selection from URL parameters - only once per carId
  useEffect(() => {
    if (carId && user && processedCarIdRef.current !== carId) {
      let vehiclesList: ICar[] = [];

      if (user.role === UserRole.MECHANIC) {
        vehiclesList = allMechanicVehicles;
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
    onCarFound,
    showModal,
    hideModal,
    removeAllQueries,
  ]);

  // Мемоизированный список уникальных машин с фильтрацией по зуму
  const uniqueVehicles = useMemo(() => {
    let vehicles: ICar[] = [];

    // Если у пользователя есть текущая аренда, показываем только эту машину
    if (user?.current_rental) {
      const rentalVehicle = user.current_rental.car_details;

      // Ищем машину в зависимости от роли пользователя
      if (user.role === UserRole.MECHANIC) {
        vehicles = [rentalVehicle];
      } else {
        vehicles = [rentalVehicle];
      }
    } else {
      // Показываем все машины в зависимости от роли пользователя
      if (user?.role === UserRole.MECHANIC) {
        vehicles = allMechanicVehicles;
      } else {
        vehicles = allVehicles;
      }
    }

    return vehicles;
  }, [allVehicles, allMechanicVehicles, user?.role, user?.current_rental]);

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

  // Marker creation function без кэширования
  const createAdvancedMarker = useCallback(
    (vehicle: ICar) => {
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
        return null;
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
      marker.addListener("click", async () => {
        if (user === null) {
          return;
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

      return marker;
    },
    [markerSizes, showModal, hideModal, user, zoom]
  );

  // Optimized effect to manage markers with zoom-aware updates
  useEffect(() => {
    if (!map || !uniqueVehicles.length) {
      return;
    }

    const currentZoomLevel = Math.round(zoom);
    const zoomChanged =
      Math.abs(currentZoomLevel - lastZoomLevelRef.current) >= 1;
    const vehiclesChanged = vehiclesHash !== lastVehiclesHashRef.current;

    // Обновляем при любых изменениях
    if (!zoomChanged && !vehiclesChanged) {
      return;
    }

    const initializeMarkers = async () => {
      const startTime = performance.now();
      try {
        if (
          !window.google?.maps?.marker?.AdvancedMarkerElement &&
          !markerLibraryLoadedRef.current
        ) {
          markerLibraryLoadedRef.current = true;
          await window.google.maps.importLibrary("marker");
        }

        // Очищаем все старые маркеры
        markersRef.current.forEach((marker) => {
          if (marker.map) {
            marker.map = null;
          }
        });

        if (deliveryMarkerRef.current) {
          deliveryMarkerRef.current.map = null;
          deliveryMarkerRef.current = null;
        }

        // Create or update markers
        const newMarkers = uniqueVehicles
          .map((vehicle) => createAdvancedMarker(vehicle))
          .filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];

        markersRef.current = newMarkers;

        // Улучшенная кластеризация для большого количества машин
        const shouldCluster =
          zoom < ZOOM_LEVELS.MEDIUM_MARKERS &&
          PERFORMANCE_SETTINGS.clusteringEnabled &&
          newMarkers.length > 20; // Снижаем порог для кластеризации

        if (shouldCluster && !clustererRef.current) {
          clustererRef.current = new MarkerClusterer({
            map,
            markers: newMarkers,
            algorithmOptions: {
              maxZoom: ZOOM_LEVELS.MEDIUM_MARKERS - 1,
            },
            renderer: {
              render: ({ count, position }) => {
                const size = Math.max(40, Math.min(60, count * 1.2 + 30));
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
      }
    };

    initializeMarkers();
  }, [map, vehiclesHash, zoom, createAdvancedMarker, user?.role]);

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
