import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/shared/ui";
import { BaseMap, CenterMarker, ZOOM_CONSTRAINTS } from "@/shared/ui/map";
import { useMap } from "@vis.gl/react-google-maps";
import { getAddressFromCoordinates } from "@/shared/utils/googleMaps";
import {
  calculateDistance,
  logPerformance,
} from "@/shared/utils/mapOptimization";
import { MapCameraProps } from "@vis.gl/react-google-maps";
import { ServiceZonePolygon } from "../../map/ServiceZonePolygon";
import { checkDeliveryAvailability } from "@/shared/utils/polygon";
import { ICar } from "@/shared/models/types/car";
import { IUser } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";

// Получаем настройки производительности для устройства

const MIN_DISTANCE_THRESHOLD = 0.0001; // Минимальное расстояние для обновления адреса

const CAMERA_DEBOUNCE_MS = 150;

interface DeliveryAddressScreenProps {
  onBack: () => void;
  onAddressSelected: (lat: number, lng: number, address: string) => void;
  car?: ICar;
}

const MapWithCenterListener = ({
  onCenterChange,
}: {
  onCenterChange: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const cameraTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!map) return;

    const centerChangedListener = map.addListener("center_changed", () => {
      const center = map.getCenter();
      if (center) {
        const newCenter = { lat: center.lat(), lng: center.lng() };

        // Проверяем, достаточно ли изменилось положение
        if (lastCenterRef.current) {
          const distance = calculateDistance(
            newCenter.lat,
            newCenter.lng,
            lastCenterRef.current.lat,
            lastCenterRef.current.lng
          );

          if (distance < MIN_DISTANCE_THRESHOLD) {
            return;
          }
        }

        // Дебаунс для предотвращения избыточных вызовов
        if (cameraTimeoutRef.current) {
          clearTimeout(cameraTimeoutRef.current);
        }

        cameraTimeoutRef.current = setTimeout(() => {
          lastCenterRef.current = newCenter;
          onCenterChange(newCenter.lat, newCenter.lng);
        }, CAMERA_DEBOUNCE_MS);
      }
    });

    return () => {
      google.maps.event.removeListener(centerChangedListener);
      if (cameraTimeoutRef.current) {
        clearTimeout(cameraTimeoutRef.current);
      }
    };
  }, [map, onCenterChange]);

  return null;
};

export const DeliveryAddressScreen = ({
  onAddressSelected,
  car,
}: DeliveryAddressScreenProps) => {
  const { user } = useUserStore();
  // Состояние камеры карты
  const [cameraProps, setCameraProps] = useState<MapCameraProps>({
    center: { lat: 43.222, lng: 76.8512 },
    zoom: ZOOM_CONSTRAINTS.DEFAULT,
  });

  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{
    isAvailable: boolean;
    message: string;
  }>({ isAvailable: true, message: "" });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingAddressRef = useRef(false);

  // Проверяем, является ли пользователь владельцем машины
  const isOwner = useMemo(() => {
    if (!user || !car) return false;
    return user.owned_cars.some(ownedCar => ownedCar.id === car.id);
  }, [user, car]);

  // Стоимость доставки с учетом скидки для владельцев
  const deliveryCost = isOwner ? 5000 : 10000;

  const updateAddress = useCallback(async (lat: number, lng: number) => {
    if (isUpdatingAddressRef.current) return;

    isUpdatingAddressRef.current = true;
    setIsLoading(true);
    const startTime = performance.now();

    try {
      // Проверяем доступность доставки
      const deliveryCheck = checkDeliveryAvailability(lat, lng);
      setDeliveryStatus(deliveryCheck);

      const addressResult = await getAddressFromCoordinates(lat, lng);
      setAddress(addressResult);
      logPerformance("Address geocoding", startTime);
    } catch (error) {
      console.error("Error getting address:", error);
      setAddress("Ошибка определения адреса");
      setDeliveryStatus({
        isAvailable: false,
        message: "Ошибка проверки зоны доставки",
      });
    } finally {
      setIsLoading(false);
      isUpdatingAddressRef.current = false;
    }
  }, []);

  const debouncedUpdateAddress = useCallback(
    (lat: number, lng: number) => {
      // Отменяем предыдущий таймер если он существует
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Устанавливаем новый таймер с адаптивной задержкой
      debounceTimeoutRef.current = setTimeout(() => {
        updateAddress(lat, lng);
      });
    },
    [updateAddress]
  );

  const handleCenterChange = useCallback(
    (lat: number, lng: number) => {
      setCameraProps((prev) => ({
        ...prev,
        center: { lat, lng },
      }));
      debouncedUpdateAddress(lat, lng);
    },
    [debouncedUpdateAddress]
  );

  const goToMyLocation = useCallback(() => {
    setIsGettingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Обновляем камеру карты
          setCameraProps((prev) => ({
            ...prev,
            center: { lat: latitude, lng: longitude },
            zoom: 16, // Приближаем для точности
          }));

          // Обновляем адрес
          updateAddress(latitude, longitude);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);

          // Показываем сообщение об ошибке
          alert(
            "Не удалось получить вашу локацию. Проверьте разрешения для доступа к геолокации."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setIsGettingLocation(false);
      alert("Геолокация не поддерживается вашим браузером");
    }
  }, [updateAddress]);

  const handleConfirm = useCallback(() => {
    const center = cameraProps.center;
    if (center && deliveryStatus.isAvailable) {
      onAddressSelected(center.lat, center.lng, address);
    }
  }, [
    onAddressSelected,
    cameraProps.center,
    address,
    deliveryStatus.isAvailable,
  ]);

  // Получаем адрес для начальных координат при загрузке
  useEffect(() => {
    const center = cameraProps.center;
    if (center) {
      updateAddress(center.lat, center.lng);
    }
  }, [updateAddress, cameraProps.center]);

  // Мемоизированные ограничения для карты доставки
  const deliveryRestriction = useMemo(
    () => ({
      latLngBounds: {
        north: 45.0,
        south: 41.0,
        east: 80.0,
        west: 73.0,
      },
      strictBounds: true,
    }),
    []
  );

  return (
    <div className="bg-white h-full flex flex-col relative">
      <div className="flex-1 relative">
        <BaseMap
          cameraProps={cameraProps}
          onCameraPropsChange={setCameraProps}
          minZoom={ZOOM_CONSTRAINTS.DELIVERY_MIN}
          maxZoom={ZOOM_CONSTRAINTS.DELIVERY_MAX}
          restriction={deliveryRestriction}
          className="w-full h-full"
          showZoomControls={true}
          showMyLocationButton={false}
        >
          <MapWithCenterListener onCenterChange={handleCenterChange} />
          <ServiceZonePolygon />
        </BaseMap>

        {/* Center Marker (Fixed in center) */}
        <CenterMarker size="medium" color="#ef4444" />

        {/* My Location Button */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={goToMyLocation}
            disabled={isGettingLocation}
            className="bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow disabled:opacity-50"
            title="Перейти к моей локации"
          >
            {isGettingLocation ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
            ) : (
              <svg
                className="w-6 h-6 text-[#191919]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Address Info */}
      <div className="p-4 ">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-[#191919]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Адрес доставки:
          </h3>
          <div
            className={`bg-white rounded-lg p-3 min-h-[70px] flex items-center border ${
              !deliveryStatus.isAvailable && !isLoading
                ? "border-red-300 bg-red-50"
                : "border-gray-200"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
                <p className="text-sm text-gray-500">Определение адреса...</p>
              </div>
            ) : (
              <div className="w-full">
                <p className="text-sm text-gray-900 mb-1">{address}</p>
                {!deliveryStatus.isAvailable && (
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-xs text-red-600">
                      {deliveryStatus.message}
                    </p>
                  </div>
                )}
                {deliveryStatus.isAvailable && deliveryStatus.message && (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-xs text-green-600">
                      {deliveryStatus.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delivery Cost Info */}
        <div className={`mb-4 rounded-lg p-3 ${
          isOwner 
            ? "bg-green-50 border border-green-200" 
            : "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className={`w-5 h-5 mr-2 ${
                  isOwner ? "text-green-600" : "text-blue-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${
                  isOwner ? "text-green-800" : "text-blue-800"
                }`}>
                  Стоимость доставки
                </span>
                {isOwner && (
                  <span className="text-xs text-green-600">
                    Скидка для владельца
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-lg font-bold ${
                isOwner ? "text-green-900" : "text-blue-900"
              }`}>
                {deliveryCost.toLocaleString()} ₸
              </span>
              {isOwner && (
                <span className="text-xs text-green-600 line-through">
                  10 000 ₸
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          variant="secondary"
          disabled={
            isLoading ||
            !address ||
            address === "Ошибка определения адреса" ||
            !deliveryStatus.isAvailable
          }
          className={` ${
            !deliveryStatus.isAvailable
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : ""
          }`}
        >
          {!deliveryStatus.isAvailable
            ? "Доставка недоступна"
            : "Подтвердить адрес"}
        </Button>
      </div>
    </div>
  );
};
