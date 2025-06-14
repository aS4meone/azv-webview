"use client";
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { POLYGON_COORDS } from "@/shared/constants/polygon";

export const ServiceZonePolygon = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Красная зона внутри (сама зона обслуживания)
    const serviceZone = new google.maps.Polygon({
      paths: POLYGON_COORDS,
      strokeWeight: 3,
      strokeColor: "#1D77FF", // Зеленый цвет границы
      strokeOpacity: 1,
      fillColor: "white", // Красный цвет заливки
      fillOpacity: 0.3,
    });

    // Добавляем полигон на карту
    serviceZone.setMap(map);

    // Очистка при размонтировании
    return () => {
      serviceZone.setMap(null);
    };
  }, [map]);

  return null;
};
