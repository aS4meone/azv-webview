"use client";
import React, { useCallback, useMemo, useState } from "react";
import { BaseMap, ZOOM_CONSTRAINTS } from "@/shared/ui/map";
import { useUserStore } from "@/shared/stores/userStore";
import { MapWithMarkers } from "./MapWithMarkers";
import { ServiceZonePolygon } from "./ServiceZonePolygon";
import { MapCameraProps } from "@vis.gl/react-google-maps";
import { ICar } from "@/shared/models/types/car";

export const MapComponent = () => {
  const { user } = useUserStore();

  const initialCenter = useMemo(() => {
    if (user?.current_rental?.car_details) {
      const rentalCar = user.current_rental.car_details;
      return {
        lat: rentalCar.latitude,
        lng: rentalCar.longitude,
      };
    }
    return { lat: 43.222, lng: 76.8512 };
  }, [user?.current_rental?.car_details]);

  const initialZoom = useMemo(() => {
    return user?.current_rental?.car_details
      ? ZOOM_CONSTRAINTS.CAR_FOCUS
      : ZOOM_CONSTRAINTS.DEFAULT;
  }, [user?.current_rental?.car_details]);

  // Состояние камеры карты
  const [cameraProps, setCameraProps] = useState<MapCameraProps>({
    center: initialCenter,
    zoom: initialZoom,
  });

  // Функция для центрирования карты на машине
  const centerOnCar = useCallback((car: ICar) => {
    console.log("Centering map on car:", car.latitude, car.longitude);
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
