"use client";
import React, { useCallback, useMemo } from "react";
import { BaseMap, ZOOM_CONSTRAINTS } from "@/shared/ui/map";
import { useUserStore } from "@/shared/stores/userStore";
import { MapWithMarkers } from "./MapWithMarkers";
import { ServiceZonePolygon } from "./ServiceZonePolygon";

export const MapComponent = () => {
  const { user } = useUserStore();

  const handleCarFound = useCallback(() => {
    // Этот коллбек будет вызываться через MapWithMarkers
    // для центрирования карты на найденном автомобиле
  }, []);

  // Автоматическое центрирование на автомобиль из активной аренды
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  return (
    <BaseMap
      initialCenter={initialCenter}
      initialZoom={initialZoom}
      enableMyLocationAutoCenter={true}
      showZoomControls={true}
      showMyLocationButton={true}
      className="relative h-screen w-full map-container"
    >
      {/* Зона обслуживания - рендерим только если зум больше 10 для производительности */}
      <ServiceZonePolygon />

      {/* Маркеры автомобилей */}
      <MapWithMarkers onCarFound={handleCarFound} />
    </BaseMap>
  );
};
