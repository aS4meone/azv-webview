"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import { MyCar, Trip, TripDetailsResponse } from "@/shared/models/types/my-auto";
import { myAutoApi } from "@/shared/api/routes/my-auto";
import { BaseMap } from "@/shared/ui/map";
import { RouteMap, FullScreenMapModal } from "../components";

interface TripDetailPageProps {
  car: MyCar;
  trip: Trip;
  onBackAction: () => void;
}

export const TripDetailPage = ({ car, trip, onBackAction }: TripDetailPageProps) => {
  const t = useTranslations();
  const [tripDetails, setTripDetails] = useState<TripDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await myAutoApi.getTripDetails(car.id, trip.id);
      const data: TripDetailsResponse = response.data;
      setTripDetails(data);
    } catch (err) {
      console.error("Error fetching trip details:", err);
      setError("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [car.id, trip.id]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}${t("myAuto.timeUnits.hours")} ${remainingMinutes}${t("myAuto.timeUnits.minutes")}`;
    }
    return `${minutes}${t("myAuto.timeUnits.minutes")}`;
  };

  const formatRentalType = (type: string) => {
    return t(`myAuto.rentalTypes.${type as "minutes" | "hours" | "days"}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const PhotoSection = ({ title, photos }: { title: string; photos: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (photos.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{t("myAuto.tripDetails.photos.noPhotos")}</p>
        </div>
      );
    }

    const nextPhoto = () => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const fullPhotoUrl = photos[currentIndex].startsWith('http') 
      ? photos[currentIndex] 
      : `https://api.azvmotors.kz/${photos[currentIndex]}`;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
        <div className="relative">
          <div className="h-64 w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={fullPhotoUrl}
              alt={`${title} ${currentIndex + 1}`}
              className="h-full w-auto mx-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder.jpg";
              }}
            />
          </div>
          
          {photos.length > 1 && (
            <>
              {/* Navigation buttons */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Dots indicator */}
              <div className="flex justify-center mt-3 space-x-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {/* Photo counter */}
              <div className="text-center mt-2 text-sm text-gray-600">
                {currentIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="icon"
              onClick={onBackAction}
              className="mr-3"
            >
              <ArrowLeftIcon />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {t("myAuto.tripDetails.title")}
              </h1>
              <p className="text-sm text-gray-600">
                {car.name} • {car.plate_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка деталей поездки...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-gray-600 mb-4">
                Не удалось загрузить детали поездки. Попробуйте еще раз.
              </p>
              <Button onClick={fetchTripDetails} variant="primary">
                Попробовать снова
              </Button>
            </div>
          </div>
        ) : tripDetails ? (
          <>
            {/* Trip Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Информация о поездке
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("myAuto.tripDetails.duration")}:</span>
                  <span className="font-medium">{formatDuration(tripDetails.duration_minutes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("myAuto.tripDetails.earnings")}:</span>
                  <span className="font-medium text-green-600">
                    {tripDetails.earnings.toLocaleString()} ₸
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("myAuto.tripDetails.rentalType")}:</span>
                  <span className="font-medium">{formatRentalType(tripDetails.rental_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("myAuto.tripDetails.startTime")}:</span>
                  <span className="font-medium">{formatDate(tripDetails.start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("myAuto.tripDetails.endTime")}:</span>
                  <span className="font-medium">{formatDate(tripDetails.end_time)}</span>
                </div>
              </div>
            </div>

            {/* Photos */}
            <PhotoSection
              title={t("myAuto.tripDetails.photos.clientBefore")}
              photos={tripDetails.photos.client_before.photos}
            />
            <PhotoSection
              title={t("myAuto.tripDetails.photos.clientAfter")}
              photos={tripDetails.photos.client_after.photos}
            />
            <PhotoSection
              title={t("myAuto.tripDetails.photos.mechanicAfter")}
              photos={tripDetails.photos.mechanic_after.photos}
            />

            {/* Route Map Info */}
            {tripDetails.route_map && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t("myAuto.tripDetails.route.title")}
                </h3>
                {tripDetails.route_map.route_data ? (
                  <div className="text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Длительность:</span>{" "}
                      {tripDetails.route_map.duration_over_24h ? "Более 24 часов" : "Менее 24 часов"}
                    </p>
                    <p>
                      <span className="font-medium">Дней маршрута:</span>{" "}
                      {tripDetails.route_map.route_data.daily_routes.length}
                    </p>
                    <p>
                      <span className="font-medium">Всего точек:</span>{" "}
                      {tripDetails.route_map.route_data.total_coordinates}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">{t("myAuto.tripDetails.route.noRoute")}</p>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Fixed Map Button */}
      {tripDetails?.route_map?.route_data && (
        <button
          onClick={() => setIsMapModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Full Screen Map Modal */}
      {tripDetails?.route_map?.route_data && (
        <FullScreenMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          routeData={tripDetails.route_map.route_data}
          startLat={tripDetails.route_map.start_latitude}
          startLng={tripDetails.route_map.start_longitude}
          endLat={tripDetails.route_map.end_latitude}
          endLng={tripDetails.route_map.end_longitude}
          durationOver24h={tripDetails.route_map.duration_over_24h}
        />
      )}
    </div>
  );
};