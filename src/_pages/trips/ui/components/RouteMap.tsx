"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { RouteData } from "@/shared/models/types/history";

interface RouteMapProps {
  routeData: RouteData;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  selectedDay?: number;
}

export const RouteMap = ({ routeData, startLat, startLng, endLat, endLng, selectedDay: externalSelectedDay }: RouteMapProps) => {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [internalSelectedDay, setInternalSelectedDay] = useState(0);
  
  const selectedDay = externalSelectedDay !== undefined ? externalSelectedDay : internalSelectedDay;

  useEffect(() => {
    if (!map || !routeData.daily_routes.length) return;

    // Очищаем предыдущие полилинии и маркеры
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    markersRef.current.forEach(marker => marker.setMap(null));
    polylinesRef.current = [];
    markersRef.current = [];

    // Создаем полилинии для каждого дня
    routeData.daily_routes.forEach((dayRoute, dayIndex) => {
      // Фильтруем координаты, исключая те где lat и lon равны 0.0
      const validCoordinates = dayRoute.coordinates.filter(coord => 
        coord.lat !== 0.0 && coord.lon !== 0.0
      );

      if (validCoordinates.length < 2) return;

      // Создаем путь из валидных координат
      const path = validCoordinates.map(coord => ({
        lat: coord.lat,
        lng: coord.lon
      }));

      // Создаем полилинию
      const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: dayIndex === selectedDay ? "#967642" : "#cccaca",
        strokeOpacity: dayIndex === selectedDay ? 1.0 : 0.6,
        strokeWeight: dayIndex === selectedDay ? 4 : 2,
      });

      polyline.setMap(map);
      polylinesRef.current.push(polyline);

      // Добавляем маркеры для начала и конца дня
      if (validCoordinates.length > 0) {
        const startCoord = validCoordinates[0];
        const endCoord = validCoordinates[validCoordinates.length - 1];

        // Маркер точки А (начало)
        const startMarker = new google.maps.Marker({
          position: { lat: startCoord.lat, lng: startCoord.lon },
          map: map,
          title: `Точка А - Начало ${dayRoute.date}`,
          label: {
            text: "А",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: "bold",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: dayIndex === selectedDay ? "#967642" : "#cccaca",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
        });

        // Маркер точки Б (конец) - если не тот же что и начало
        if (startCoord.lat !== endCoord.lat || startCoord.lon !== endCoord.lon) {
          const endMarker = new google.maps.Marker({
            position: { lat: endCoord.lat, lng: endCoord.lon },
            map: map,
            title: `Точка Б - Конец ${dayRoute.date}`,
            label: {
              text: "Б",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "bold",
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: dayIndex === selectedDay ? "#2E7D32" : "#cccaca",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            },
          });
          markersRef.current.push(endMarker);
        }

        markersRef.current.push(startMarker);
      }
    });

    // Фокусируем карту на выбранном дне
    const selectedDayRoute = routeData.daily_routes[selectedDay];
    if (selectedDayRoute) {
      const validCoordinates = selectedDayRoute.coordinates.filter(coord => 
        coord.lat !== 0.0 && coord.lon !== 0.0
      );
      
      if (validCoordinates.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        validCoordinates.forEach(coord => {
          bounds.extend({ lat: coord.lat, lng: coord.lon });
        });
        
        // Добавляем отступы для лучшего отображения
        const padding = {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        };
        
        map.fitBounds(bounds, padding);
      } else {
        // Если нет валидных координат, центрируем на Алматы
        map.setCenter({ lat: 43.222, lng: 76.8512 });
        map.setZoom(13);
      }
    }

    return () => {
      polylinesRef.current.forEach(polyline => polyline.setMap(null));
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [map, routeData, selectedDay]);

  if (!routeData.daily_routes.length) {
    return null;
  }

  // Проверяем, есть ли хотя бы один день с валидными координатами
  const hasValidRoutes = routeData.daily_routes.some(dayRoute => 
    dayRoute.coordinates.some(coord => coord.lat !== 0.0 && coord.lon !== 0.0)
  );

  if (!hasValidRoutes) {
    return (
      <div className="text-center py-8">
        <p className="text-[#666666]">Нет данных о маршруте для отображения</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Селектор дней - только если нет внешнего selectedDay */}
      {externalSelectedDay === undefined && routeData.daily_routes.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {routeData.daily_routes.map((dayRoute, index) => (
            <button
              key={dayRoute.date}
              onClick={() => setInternalSelectedDay(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                index === selectedDay
                  ? "bg-[#967642] text-white"
                  : "bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]"
              }`}
            >
              {new Date(dayRoute.date).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
              })}
            </button>
          ))}
        </div>
      )}

      {/* Информация о выбранном дне */}
      <div className="text-sm text-[#666666]">
        <p>Дата: {new Date(routeData.daily_routes[selectedDay].date).toLocaleDateString("ru-RU")}</p>
        <p>Точек маршрута: {
          routeData.daily_routes[selectedDay].coordinates.filter(coord => 
            coord.lat !== 0.0 && coord.lon !== 0.0
          ).length
        }</p>
      </div>

      {/* Легенда маркеров */}
      <div className="flex justify-center space-x-4 text-xs text-[#666666]">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-[#967642]"></div>
          <span>Точка А (начало)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-[#2E7D32]"></div>
          <span>Точка Б (конец)</span>
        </div>
      </div>
    </div>
  );
};
