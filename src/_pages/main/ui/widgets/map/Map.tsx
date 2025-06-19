"use client";
import React, { useCallback, useMemo, useState } from "react";
import { BaseMap, ZOOM_CONSTRAINTS } from "@/shared/ui/map";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { MapWithMarkers } from "./MapWithMarkers";
import { ServiceZonePolygon } from "./ServiceZonePolygon";
import { MapCameraProps } from "@vis.gl/react-google-maps";
import { ICar } from "@/shared/models/types/car";
import { UserRole } from "@/shared/models/types/user";

export const MapComponent = () => {
  const { user } = useUserStore();
  const { currentDeliveryVehicle } = useVehiclesStore();

  const initialCenter = useMemo(() => {
    // Приоритет 1: Если есть аренда у пользователя
    if (user?.current_rental?.car_details) {
      const rentalCar = user.current_rental.car_details;
      return {
        lat: rentalCar.latitude,
        lng: rentalCar.longitude,
      };
    }

    // Приоритет 2: Если механик с текущей доставкой
    if (
      user?.role === UserRole.MECHANIC &&
      currentDeliveryVehicle &&
      currentDeliveryVehicle.id !== 0 &&
      currentDeliveryVehicle.latitude &&
      currentDeliveryVehicle.longitude
    ) {
      return {
        lat: currentDeliveryVehicle.latitude,
        lng: currentDeliveryVehicle.longitude,
      };
    }

    // Приоритет 3: Стандартное местоположение
    return { lat: 43.222, lng: 76.8512 };
  }, [user?.current_rental?.car_details, user?.role, currentDeliveryVehicle]);

  const initialZoom = useMemo(() => {
    // Если есть машина для фокуса (аренда или доставка), используем CAR_FOCUS зум
    const hasFocusCar =
      user?.current_rental?.car_details ||
      (user?.role === UserRole.MECHANIC &&
        currentDeliveryVehicle &&
        currentDeliveryVehicle.id !== 0);

    return hasFocusCar ? ZOOM_CONSTRAINTS.CAR_FOCUS : ZOOM_CONSTRAINTS.DEFAULT;
  }, [user?.current_rental?.car_details, user?.role, currentDeliveryVehicle]);

  // Состояние камеры карты
  const [cameraProps, setCameraProps] = useState<MapCameraProps>({
    center: initialCenter,
    zoom: initialZoom,
  });

  // Функция для центрирования карты на машине
  const centerOnCar = useCallback((car: ICar) => {
    setCameraProps({
      center: {
        lat: car.latitude,
        lng: car.longitude,
      },
      zoom: ZOOM_CONSTRAINTS.CAR_FOCUS,
    });
  }, []);

  const handleCarFound = useCallback(
    (car: ICar) => {
      centerOnCar(car);
    },
    [centerOnCar]
  );

  // Мемоизируем компоненты карты для предотвращения ненужных ре-рендеров
  const MemoizedServiceZonePolygon = useMemo(() => <ServiceZonePolygon />, []);

  const MemoizedMapWithMarkers = useMemo(
    () => <MapWithMarkers onCarFound={handleCarFound} />,
    [handleCarFound]
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  return (
    <BaseMap
      cameraProps={cameraProps}
      onCameraPropsChange={setCameraProps}
      enableMyLocationAutoCenter={true}
      showZoomControls={true}
      showMyLocationButton={true}
      className="relative h-screen w-full map-container"
    >
      {/* Зона обслуживания - мемоизированный компонент */}
      {MemoizedServiceZonePolygon}

      {/* Маркеры автомобилей - мемоизированный компонент */}
      {MemoizedMapWithMarkers}
    </BaseMap>
  );
};
