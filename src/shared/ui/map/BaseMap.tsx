"use client";
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  MapCameraChangedEvent,
  MapCameraProps,
} from "@vis.gl/react-google-maps";
import { Button } from "@/shared/ui";
import { ArrowLocationIcon, MinusIcon, PlusIcon } from "@/shared/icons";
import { getMyLocation } from "@/shared/utils/flutterGeolocation";
import { logPerformance } from "@/shared/utils/mapOptimization";

// Константы для оптимизации зума
export const ZOOM_CONSTRAINTS = {
  MIN: 10,
  MAX: 18,
  DEFAULT: 15,
  USER_LOCATION: 16,
  CAR_FOCUS: 16,
  DELIVERY_MIN: 12,
  DELIVERY_MAX: 17,
  DELIVERY_FOCUS: 16,
} as const;

export interface BaseMapProps {
  // Основные настройки
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;

  // Функциональность
  showZoomControls?: boolean;
  showMyLocationButton?: boolean;
  enableMyLocationAutoCenter?: boolean;

  // Обработчики событий
  onCameraChange?: (event: MapCameraChangedEvent) => void;
  onMapReady?: () => void;
  onLocationFound?: (location: { lat: number; lng: number }) => void;

  // Контент карты
  children?: ReactNode;

  // Стили и ограничения
  restriction?: {
    latLngBounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    strictBounds?: boolean;
  };

  // Классы CSS
  className?: string;

  // Дополнительные настройки
  mapId?: string;
  gestureHandling?: "cooperative" | "greedy" | "none" | "auto";
  styles?: google.maps.MapTypeStyle[];

  // Контролируемое состояние камеры (опционально)
  cameraProps?: MapCameraProps;
  onCameraPropsChange?: Dispatch<SetStateAction<MapCameraProps>>;
}

export const BaseMap = ({
  initialCenter = { lat: 43.222, lng: 76.8512 },
  initialZoom = ZOOM_CONSTRAINTS.DEFAULT,
  minZoom = ZOOM_CONSTRAINTS.MIN,
  maxZoom = ZOOM_CONSTRAINTS.MAX,
  showZoomControls = true,
  showMyLocationButton = true,
  enableMyLocationAutoCenter = false,
  onCameraChange,
  onMapReady,
  onLocationFound,
  children,
  restriction,
  className = "relative h-screen w-full",
  mapId = "e56617123a7fcf1ad2c3782d",
  gestureHandling = "greedy",
  cameraProps: externalCameraProps,
  onCameraPropsChange,
}: BaseMapProps) => {
  // Внутреннее состояние камеры (используется если не передано внешнее)
  const [internalCameraProps, setInternalCameraProps] =
    useState<MapCameraProps>({
      center: initialCenter,
      zoom: initialZoom,
    });

  // Выбираем какое состояние камеры использовать
  const cameraProps = externalCameraProps || internalCameraProps;
  const setCameraProps: Dispatch<SetStateAction<MapCameraProps>> =
    onCameraPropsChange || setInternalCameraProps;

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Refs для оптимизации
  const isLocationLoadingRef = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const lastCameraUpdateRef = useRef<MapCameraProps>(cameraProps);

  const centerToUser = useCallback(async () => {
    if (isLocationLoadingRef.current) return;

    isLocationLoadingRef.current = true;
    const startTime = performance.now();

    try {
      const location = await getMyLocation();
      if (location) {
        const newCenter = {
          lat: location.lat,
          lng: location.lng,
        };

        setUserLocation(newCenter);

        if (enableMyLocationAutoCenter) {
          // Плавное обновление камеры
          const newCameraProps = {
            center: newCenter,
            zoom: ZOOM_CONSTRAINTS.USER_LOCATION,
          };
          setCameraProps(newCameraProps);
          lastCameraUpdateRef.current = newCameraProps;
        }

        if (onLocationFound) {
          onLocationFound(newCenter);
        }

        logPerformance("Get user location", startTime);
      } else {
        console.error("Не удалось получить местоположение");
        alert(
          "Не удалось получить ваше местоположение. Проверьте разрешения на геолокацию."
        );
      }
    } catch (error) {
      console.error("Ошибка получения местоположения:", error);
      alert("Ошибка при получении местоположения");
    } finally {
      isLocationLoadingRef.current = false;
    }
  }, [enableMyLocationAutoCenter, onLocationFound, setCameraProps]);

  // Оптимизированные функции зума с ограничениями
  const zoomIn = useCallback(() => {
    setCameraProps((prev) => ({
      ...prev,
      zoom: Math.min((prev.zoom || initialZoom) + 1, maxZoom),
    }));
  }, [setCameraProps, initialZoom, maxZoom]);

  const zoomOut = useCallback(() => {
    setCameraProps((prev) => ({
      ...prev,
      zoom: Math.max((prev.zoom || initialZoom) - 1, minZoom),
    }));
  }, [setCameraProps, initialZoom, minZoom]);

  // Обработчик изменения камеры
  const handleCameraChanged = useCallback(
    (event: MapCameraChangedEvent) => {
      const { center, zoom, heading, tilt } = event.detail;
      const newCameraProps = { center, zoom, heading, tilt };

      setCameraProps(newCameraProps);
      lastCameraUpdateRef.current = newCameraProps;

      if (onCameraChange) {
        onCameraChange(event);
      }
    },
    [setCameraProps, onCameraChange]
  );

  // Мемоизированные настройки карты для максимальной производительности
  const mapSettings = useMemo(
    () => ({
      gestureHandling,
      disableDefaultUI: true,
      clickableIcons: false,
      keyboardShortcuts: false,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: false,
      scaleControl: false,
      rotateControl: false,
      minZoom,
      maxZoom,
      restriction: restriction || {
        latLngBounds: {
          north: 44.0, // Соответствует background полигону
          south: 42.0, // Соответствует background полигону
          east: 79.0, // Соответствует background полигону
          west: 75.0, // Соответствует background полигону
        },
        strictBounds: true, // Строгие ограничения - пользователь не может выйти за границы
      },
      controlSize: 32,
      scrollwheel: true,
      disableDoubleClickZoom: false,
      draggable: true,
      tilt: 0,
      heading: 0,
    }),
    [gestureHandling, minZoom, maxZoom, restriction]
  );

  // Эффект для вызова onMapReady
  useEffect(() => {
    if (onMapReady) {
      const timer = setTimeout(onMapReady, 100);
      return () => clearTimeout(timer);
    }
  }, [onMapReady]);

  // Check if API key is missing
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-red-50">
        <div className="text-center p-4">
          <div className="text-red-600 text-lg font-semibold mb-2">
            ⚠️ Google Maps API Key Missing
          </div>
          <div className="text-red-500 text-sm">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment
            variables
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className={`map-container ${className}`}
      data-map-container="true"
      data-testid="map-container"
    >
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        onLoad={() => console.log("Google Maps API loaded")}
        onError={(error) => console.error("Google Maps API error:", error)}
      >
        <Map
          {...cameraProps}
          mapId={mapId}
          onCameraChanged={handleCameraChanged}
          {...mapSettings}
        >
          {children}
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {/* Маркер пользователя (если есть) */}

      {/* Оптимизированные контролы карты */}
      {showZoomControls && (
        <div className="absolute right-4 top-1/2 flex flex-col gap-2 transform -translate-y-1/2 map-zoom-controls">
          <Button
            onClick={zoomIn}
            variant="icon"
            className="shadow-lg hover:shadow-xl transition-shadow duration-200 touch-manipulation"
            disabled={(cameraProps.zoom || 0) >= maxZoom}
          >
            <PlusIcon color="#191919" />
          </Button>
          <Button
            onClick={zoomOut}
            variant="icon"
            className="shadow-lg hover:shadow-xl transition-shadow duration-200 touch-manipulation"
            disabled={(cameraProps.zoom || 0) <= minZoom}
          >
            <MinusIcon />
          </Button>
          {showMyLocationButton && (
            <Button
              onClick={centerToUser}
              variant="icon"
              className="shadow-lg hover:shadow-xl transition-shadow duration-200 touch-manipulation"
              disabled={isLocationLoadingRef.current}
            >
              {isLocationLoadingRef.current ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
              ) : (
                <ArrowLocationIcon />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
