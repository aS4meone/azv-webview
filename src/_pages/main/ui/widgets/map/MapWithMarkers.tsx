import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";
import { ICar, CarStatus } from "@/shared/models/types/car";
import { UserRole } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { useModal } from "@/shared/ui/modal";
import { useRemoveAllQueries } from "@/shared/utils/urlUtils";
import { MarkerClusterer, GridAlgorithm } from "@googlemaps/markerclusterer";
import { useMap } from "@vis.gl/react-google-maps";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  logPerformance,
  preloadMarkerImages,
} from "@/shared/utils/mapOptimization";
import { useDeliveryPoint } from "@/shared/contexts/DeliveryPointContext";

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
  const { deliveryPoint, isVisible } = useDeliveryPoint();

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

  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerLibraryLoadedRef = useRef(false);
  const processedCarIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackingModalShownRef = useRef<boolean>(false);

  // Функция для загрузки автомобилей в зависимости от роли
  const fetchVehiclesByRole = useCallback(() => {
    if (user?.role === UserRole.MECHANIC) {
      fetchAllMechanicVehicles();
      fetchCurrentDeliveryVehicle();
    } else {
      fetchAllVehicles();
    }
  }, [
    fetchAllVehicles,
    fetchAllMechanicVehicles,
    fetchCurrentDeliveryVehicle,
    user?.role,
  ]);

  // Fetch vehicles based on user role - первоначальная загрузка
  useEffect(() => {
    fetchVehiclesByRole();
  }, [fetchVehiclesByRole, user]);

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
      // Более частое обновление для отображения всех машин
      const updateInterval = 30000; // 30 секунд

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

  // Функция создания маркера
  const createAdvancedMarker = useCallback(
    (vehicle: ICar) => {
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
        return null;
      }

      const roundedZoom = Math.round(zoom);

      // Расчет размеров маркеров
      const baseWidth: number = 12;

      const aspectRatio = 29 / 12;
      const markerWidth = Math.max(6, Math.min(24, baseWidth));
      const markerHeight = markerWidth * aspectRatio;
      const textSize = Math.max(8, Math.min(16, roundedZoom - 2));
      const showNames = roundedZoom >= ZOOM_LEVELS.SHOW_NAMES;
      const showDetails = roundedZoom >= ZOOM_LEVELS.LARGE_MARKERS;

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

      return marker;
    },
    [user, showModal, hideModal, map, zoom]
  );

  // Функция создания маркера точки доставки
  const createDeliveryMarker = (coordinates: {
    latitude: number;
    longitude: number;
  }) => {
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
      return null;
    }

    const markerDiv = document.createElement("div");
    markerDiv.style.cssText = `
      width: 24px;
      height: 24px;
      background-color: #f59e0b;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      position: relative;
      animation: pulse 2s infinite;
    `;

    // Добавляем стили для пульсации
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
        }
      }
    `;
    document.head.appendChild(style);

    // Добавляем лейбл
    const labelDiv = document.createElement("div");
    labelDiv.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(255, 255, 255, 0.95);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #92400e;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      pointer-events: none;
    `;
    labelDiv.textContent = "Точка доставки";
    markerDiv.appendChild(labelDiv);

    return new window.google.maps.marker.AdvancedMarkerElement({
      position: { lat: coordinates.latitude, lng: coordinates.longitude },
      content: markerDiv,
      title: "Точка доставки",
      zIndex: 1000, // Поверх других маркеров
    });
  };

  // Эффект для управления маркерами - обновляем всегда
  useEffect(() => {
    if (!map || !user) {
      return;
    }

    // Получаем список машин без кэширования
    let vehicles: ICar[] = [];

    // Если у пользователя есть текущая аренда, показываем только эту машину
    if (user?.current_rental) {
      const rentalVehicle = user.current_rental.car_details;
      vehicles = [rentalVehicle];
    } else if (user?.role === UserRole.MECHANIC) {
      // Проверяем, есть ли активная слежка
      const trackingCarId = localStorage.getItem("tracking_car_id");

      if (trackingCarId && allMechanicVehicles.length > 0) {
        // Если есть активная слежка, показываем только отслеживаемую машину
        const trackingCar = allMechanicVehicles.find(
          (car) => car.id === parseInt(trackingCarId)
        );
        if (trackingCar) {
          vehicles = [trackingCar];
        } else {
          // Если машина не найдена, удаляем ID из localStorage и показываем все машины
          localStorage.removeItem("tracking_car_id");
          vehicles = allMechanicVehicles;
        }
      } else if (
        currentDeliveryVehicle &&
        currentDeliveryVehicle.id !== 0 &&
        currentDeliveryVehicle.status !== CarStatus.free
      ) {
        // Для механика: если есть current delivery и он не завершен, показываем только его
        vehicles = [currentDeliveryVehicle];
      } else {
        // Иначе показываем все машины механика
        vehicles = allMechanicVehicles;
      }
    } else {
      // Для обычных пользователей показываем все доступные машины
      vehicles = allVehicles;
    }

    if (!vehicles.length) {
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

        // Очищаем кластерер если он есть
        if (clustererRef.current) {
          clustererRef.current.clearMarkers();
        }

        // Создаем новые маркеры
        const newMarkers = vehicles
          .map((vehicle) => createAdvancedMarker(vehicle))
          .filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];

        markersRef.current = newMarkers;

        const currentZoomLevel = Math.round(zoom);

        // Логика кластеризации: показываем индивидуальные маркеры только на зуме 16+
        const shouldCluster = currentZoomLevel < 16;

        if (shouldCluster) {
          // Всегда пересоздаем кластеризатор для корректного переключения
          if (clustererRef.current) {
            clustererRef.current.clearMarkers();
            clustererRef.current = null;
          }

          clustererRef.current = new MarkerClusterer({
            map,
            markers: newMarkers,
            algorithm: new GridAlgorithm({
              maxZoom: 15, // Кластеризация до зума 15 включительно
              gridSize: 80, // Расстояние между маркерами для группировки (в пикселях)
            }),
            renderer: {
              render: ({ count, position }) => {
                // Динамический размер кластера в зависимости от количества
                const baseSize = 40;
                const maxSize = 80;
                const size = Math.min(maxSize, baseSize + Math.log(count) * 8);

                // Цвет кластера в зависимости от количества маркеров
                const bgColor = "#191919";
                const borderColor = "#333";

                const clusterDiv = document.createElement("div");
                clusterDiv.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    background: linear-gradient(135deg, ${bgColor}, ${borderColor});
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: ${count > 99 ? 10 : count > 9 ? 12 : 14}px;
                    border: 2px solid white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                  `;

                // Добавляем анимацию пульсации для больших кластеров
                if (count >= 50) {
                  clusterDiv.style.animation = "pulse 2s infinite";
                }

                clusterDiv.textContent =
                  count > 999 ? "999+" : count.toString();

                // Добавляем hover эффект
                clusterDiv.addEventListener("mouseenter", () => {
                  clusterDiv.style.transform = "scale(1.1)";
                  clusterDiv.style.boxShadow =
                    "0 6px 20px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)";
                });

                clusterDiv.addEventListener("mouseleave", () => {
                  clusterDiv.style.transform = "scale(1)";
                  clusterDiv.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)";
                });

                return new google.maps.marker.AdvancedMarkerElement({
                  position,
                  content: clusterDiv,
                  zIndex: 1000 + count, // Большие кластеры поверх маленьких
                });
              },
            },
          });
        } else {
          // Отключаем кластеризацию
          if (clustererRef.current) {
            clustererRef.current.clearMarkers();
            clustererRef.current = null;
          }

          // Показываем маркеры индивидуально
          newMarkers.forEach((marker) => {
            marker.map = map;
          });
        }

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
  ]);

  // Эффект для управления маркером точки доставки
  useEffect(() => {
    if (!map || !user || user.role !== UserRole.MECHANIC) {
      // Очищаем маркер если есть
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.map = null;
        deliveryMarkerRef.current = null;
      }
      return;
    }

    // Проверяем наличие координат доставки
    if (
      isVisible &&
      deliveryPoint &&
      deliveryPoint.latitude &&
      deliveryPoint.longitude
    ) {
      console.log("Creating delivery marker with coordinates:", deliveryPoint);
      // Создаем маркер точки доставки
      const deliveryMarker = createDeliveryMarker(deliveryPoint);
      if (deliveryMarker) {
        // Удаляем старый маркер если есть
        if (deliveryMarkerRef.current) {
          deliveryMarkerRef.current.map = null;
        }
        deliveryMarker.map = map;
        deliveryMarkerRef.current = deliveryMarker;

        // Центрируем карту на точке доставки
        map.setCenter({
          lat: deliveryPoint.latitude,
          lng: deliveryPoint.longitude,
        });
        map.setZoom(16);
      }
    } else {
      console.log("No delivery point or not visible");
      // Если нет координат или точка не должна быть видима, удаляем маркер
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.map = null;
        deliveryMarkerRef.current = null;
      }
    }
  }, [map, user, deliveryPoint, isVisible]);

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

      if (zoomUpdateTimeoutRef.current) {
        clearTimeout(zoomUpdateTimeoutRef.current);
      }

      trackingModalShownRef.current = false;
    };
  }, []);

  return null;
};
