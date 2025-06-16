"use client";
import {
  POLYGON_COORDS,
  BACKGROUND_POLYGON_COORDS,
} from "@/shared/constants/polygon";
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";

export const ServiceZonePolygon = () => {
  const map = useMap();
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const currentZoomRef = useRef<number>(10);
  const isInitializedRef = useRef<boolean>(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSignificantZoomRef = useRef<number>(10);

  useEffect(() => {
    if (!map) return;

    // Функция для очистки существующих полигонов (локальная версия)
    const clearPolygonsLocal = () => {
      polygonsRef.current.forEach((polygon) => polygon.setMap(null));
      polygonsRef.current = [];
    };

    // Функция для обновления полигонов в зависимости от зума (локальная версия)
    const updatePolygonsByZoomLocal = (zoom: number) => {
      const roundedZoom = Math.round(zoom);

      // Проверяем, пересек ли зум критический порог (10)
      const crossedThreshold =
        (lastSignificantZoomRef.current < 10 && roundedZoom >= 10) ||
        (lastSignificantZoomRef.current >= 10 && roundedZoom < 10);

      // Проверяем значительное изменение зума (больше 1 уровня)
      const significantZoomChange =
        Math.abs(lastSignificantZoomRef.current - roundedZoom) >= 2;

      if (
        !crossedThreshold &&
        !significantZoomChange &&
        isInitializedRef.current
      ) {
        return;
      }

      currentZoomRef.current = roundedZoom;
      lastSignificantZoomRef.current = roundedZoom;

      // Очищаем существующие полигоны
      clearPolygonsLocal();

      const newPolygons: google.maps.Polygon[] = [];

      if (roundedZoom >= 10) {
        // При зуме >= 10: показываем background полигон с дыркой + основной полигон
        const backgroundPolygon = new google.maps.Polygon({
          paths: [
            BACKGROUND_POLYGON_COORDS,
            POLYGON_COORDS, // Это создает дырку в background полигоне
          ],
          strokeWeight: 2,
          strokeColor: "#FF0000",
          strokeOpacity: 0.5,
          fillColor: "#FF0000",
          fillOpacity: 0.15,
        });

        const serviceZone = new google.maps.Polygon({
          paths: POLYGON_COORDS,
          strokeWeight: 2,
          strokeColor: "#1D77FF",
          strokeOpacity: 1,
          fillColor: "transparent",
          fillOpacity: 0,
        });

        backgroundPolygon.setMap(map);
        serviceZone.setMap(map);
        newPolygons.push(backgroundPolygon, serviceZone);
      } else {
        // При зуме < 10: показываем только основной полигон с заливкой
        const serviceZone = new google.maps.Polygon({
          paths: POLYGON_COORDS,
          strokeWeight: 2,
          strokeColor: "#1D77FF",
          strokeOpacity: 1,
          fillColor: "#1D77FF",
          fillOpacity: 0.1,
        });

        serviceZone.setMap(map);
        newPolygons.push(serviceZone);
      }

      polygonsRef.current = newPolygons;
      isInitializedRef.current = true;
    };

    // Определяем стиль для карты
    const redStyle = [
      {
        featureType: "all",
        elementType: "all",
        stylers: [
          { saturation: "32" },
          { lightness: "-3" },
          { visibility: "on" },
          { weight: "1.18" },
        ],
      },
      {
        featureType: "administrative",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "landscape",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "landscape.man_made",
        elementType: "all",
        stylers: [{ saturation: "-70" }, { lightness: "14" }],
      },
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ];

    // Создаём новый тип карты
    const styledMapType = new google.maps.StyledMapType(redStyle, {
      name: "Red Map",
    });
    map.mapTypes.set("red_map", styledMapType);
    map.setMapTypeId("red_map");

    // Получаем начальный зум
    const initialZoom = map.getZoom() || 10;
    updatePolygonsByZoomLocal(initialZoom);

    // Добавляем слушатель изменения зума с улучшенным дебаунсом
    const zoomChangedListener = map.addListener("zoom_changed", () => {
      // Очищаем предыдущий timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Дебаунс с проверкой на значительные изменения
      updateTimeoutRef.current = setTimeout(() => {
        const newZoom = map.getZoom() || 10;
        updatePolygonsByZoomLocal(newZoom);
      }, 250); // Увеличиваем дебаунс до 250мс для лучшей производительности
    });

    return () => {
      // Очищаем полигоны и слушатели при размонтировании
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      clearPolygonsLocal();
      google.maps.event.removeListener(zoomChangedListener);
      isInitializedRef.current = false;
      lastSignificantZoomRef.current = 10;
    };
  }, [map]); // Только map в зависимостях!

  return null;
};
