"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon, XIcon } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import { BaseMap } from "@/shared/ui/map";
import { RouteMap } from "./RouteMap";
import { RouteData } from "@/shared/models/types/my-auto";

interface FullScreenMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: RouteData;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  durationOver24h: boolean;
}

export const FullScreenMapModal = ({
  isOpen,
  onClose,
  routeData,
  startLat,
  startLng,
  endLat,
  endLng,
  durationOver24h,
}: FullScreenMapModalProps) => {
  const t = useTranslations();
  const [selectedDay, setSelectedDay] = useState(0);

  if (!isOpen) return null;

  const shouldShowCalendar = durationOver24h || routeData.daily_routes.length > 1;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm border-b border-[#E5E5E5]">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="icon"
                onClick={onClose}
                className="mr-3"
              >
                <ArrowLeftIcon />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-[#2D2D2D]">
                  {t("myAuto.tripDetails.route.title")}
                </h1>
                <p className="text-sm text-[#666666]">
                  {shouldShowCalendar ? "Выберите день для просмотра маршрута" : "Маршрут поездки"}
                </p>
              </div>
            </div>
            <Button
              variant="icon"
              onClick={onClose}
              className="text-[#888888] hover:text-[#666666]"
            >
              <XIcon />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute top-16 bottom-0 left-0 right-0">
        <BaseMap
          initialCenter={{
            lat: startLat,
            lng: startLng
          }}
          initialZoom={15}
          className="w-full h-full"
          showZoomControls={true}
          showMyLocationButton={true}
        >
          <RouteMap
            routeData={routeData}
            startLat={startLat}
            startLng={startLng}
            endLat={endLat}
            endLng={endLng}
            selectedDay={selectedDay}
          />
        </BaseMap>
      </div>

      {/* Calendar for multiple days - Always at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-[#E5E5E5]">
        {shouldShowCalendar ? (
          <div className="px-4 py-4">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-3">
              Выберите день
            </h3>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {routeData.daily_routes.map((dayRoute, index) => (
                <button
                  key={dayRoute.date}
                  onClick={() => setSelectedDay(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    index === selectedDay
                      ? "bg-black text-white"
                      : "bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">
                      {new Date(dayRoute.date).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </div>
                    <div className="text-xs opacity-75">
                      {new Date(dayRoute.date).toLocaleDateString("ru-RU", {
                        weekday: "short",
                      })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Day info */}
            <div className="mt-3 text-sm text-[#666666]">
              <p>
                <span className="font-medium">Дата:</span>{" "}
                {new Date(routeData.daily_routes[selectedDay].date).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>
                <span className="font-medium">Точек маршрута:</span>{" "}
                {routeData.daily_routes[selectedDay].coordinates.filter(coord => 
                  coord.lat !== 0.0 && coord.lon !== 0.0
                ).length}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4">
            <div className="text-center text-[#666666]">
              <p className="text-sm">
                <span className="font-medium">Маршрут за один день</span>
              </p>
              <p className="text-xs mt-1">
                {routeData.daily_routes[0]?.coordinates.filter(coord => 
                  coord.lat !== 0.0 && coord.lon !== 0.0
                ).length || 0} точек маршрута
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
