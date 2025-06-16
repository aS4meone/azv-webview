import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/shared/ui";
import { ArrowLeftIcon } from "@/shared/icons";
import { BaseMap, CenterMarker, ZOOM_CONSTRAINTS } from "@/shared/ui/map";
import { useMap } from "@vis.gl/react-google-maps";
import { getAddressFromCoordinates } from "@/shared/utils/googleMaps";
import {
  calculateDistance,
  logPerformance,
} from "@/shared/utils/mapOptimization";
import { MapCameraProps } from "@vis.gl/react-google-maps";

// Получаем настройки производительности для устройства

const MIN_DISTANCE_THRESHOLD = 0.0001; // Минимальное расстояние для обновления адреса

const CAMERA_DEBOUNCE_MS = 150;

interface DeliveryAddressScreenProps {
  onBack: () => void;
  onAddressSelected: (lat: number, lng: number, address: string) => void;
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
  onBack,
  onAddressSelected,
}: DeliveryAddressScreenProps) => {
  // Состояние камеры карты
  const [cameraProps, setCameraProps] = useState<MapCameraProps>({
    center: { lat: 43.222, lng: 76.8512 },
    zoom: ZOOM_CONSTRAINTS.DEFAULT,
  });

  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingAddressRef = useRef(false);

  const updateAddress = useCallback(async (lat: number, lng: number) => {
    if (isUpdatingAddressRef.current) return;

    isUpdatingAddressRef.current = true;
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const addressResult = await getAddressFromCoordinates(lat, lng);
      setAddress(addressResult);
      logPerformance("Address geocoding", startTime);
    } catch (error) {
      console.error("Error getting address:", error);
      setAddress("Ошибка определения адреса");
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

  const handleMyLocationFound = useCallback(
    (location: { lat: number; lng: number }) => {
      // Для геолокации обновляем адрес сразу без debounce
      updateAddress(location.lat, location.lng);
    },
    [updateAddress]
  );

  const handleConfirm = useCallback(() => {
    const center = cameraProps.center;
    if (center) {
      onAddressSelected(center.lat, center.lng, address);
    }
  }, [onAddressSelected, cameraProps.center, address]);

  // Получаем адрес для начальных координат при загрузке
  useEffect(() => {
    const center = cameraProps.center;
    if (center) {
      updateAddress(center.lat, center.lng);
    }
  }, [updateAddress]);

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
    <div className="bg-white h-full flex flex-col py-10">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="mr-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-lg font-semibold">Выберите адрес доставки</h1>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <BaseMap
          cameraProps={cameraProps}
          onCameraPropsChange={setCameraProps}
          minZoom={ZOOM_CONSTRAINTS.DELIVERY_MIN}
          maxZoom={ZOOM_CONSTRAINTS.DELIVERY_MAX}
          restriction={deliveryRestriction}
          className="w-full h-full"
          onLocationFound={handleMyLocationFound}
          showZoomControls={true}
          showMyLocationButton={true}
        >
          <MapWithCenterListener onCenterChange={handleCenterChange} />
        </BaseMap>

        {/* Center Marker (Fixed in center) */}
        <CenterMarker size="medium" color="#ef4444" />

        {/* Instructions */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-100">
          <p className="text-sm text-gray-600 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Перемещайте карту, чтобы выбрать адрес доставки
          </p>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          Zoom: {Math.round(cameraProps.zoom || 0)}
        </div>
      </div>

      {/* Address Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-red-500"
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
          <div className="bg-white rounded-lg p-3 min-h-[60px] flex items-center border border-gray-200">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
                <p className="text-sm text-gray-500">Определение адреса...</p>
              </div>
            ) : (
              <p className="text-sm text-gray-900">{address}</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          variant="secondary"
          disabled={
            isLoading || !address || address === "Ошибка определения адреса"
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
        >
          Подтвердить адрес
        </Button>
      </div>
    </div>
  );
};
