"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import { MyCar, Trip, TripDetailsResponse } from "@/shared/models/types/my-auto";
import { myAutoApi } from "@/shared/api/routes/my-auto";
import { BaseMap } from "@/shared/ui/map";
import { RouteMap, FullScreenMapModal } from "../components";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";

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
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentPhotoSet, setCurrentPhotoSet] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  // Handle Escape key to close image viewer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showImageViewer) {
        closeImageViewer();
      }
    };

    if (showImageViewer) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showImageViewer]);

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

  // Filter out selfie photos from mechanic_after
  const filterSelfiePhotos = (photos: string[]) => {
    return photos.filter(photo => !photo.includes('/selfie/'));
  };

  const openImageViewer = (photos: string[], index: number = 0) => {
    console.log('Opening image viewer with photos:', photos);
    setCurrentPhotoSet(photos);
    setCurrentPhotoIndex(index);
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    console.log('Closing image viewer - showImageViewer was:', showImageViewer);
    setShowImageViewer(false);
    setCurrentPhotoIndex(0);
    setCurrentPhotoSet([]);
    console.log('Image viewer closed');
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoad = (index: number) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setImageLoading((prev) => ({ ...prev, [index]: true }));
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % currentPhotoSet.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + currentPhotoSet.length) % currentPhotoSet.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentPhotoSet.length > 1) {
      nextPhoto();
    }
    if (isRightSwipe && currentPhotoSet.length > 1) {
      prevPhoto();
    }
  };


  const PhotoSection = ({ title, photos }: { title: string; photos: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (photos.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">{title}</h3>
          <p className="text-[#666666]">{t("myAuto.tripDetails.photos.noPhotos")}</p>
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
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-[#2D2D2D]">{title}</h3>
          <button
            onClick={() => openImageViewer(photos, currentIndex)}
            className="bg-black hover:bg-black/90 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <div className="h-80 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
            <img
              src={fullPhotoUrl}
              alt={`${title} ${currentIndex + 1}`}
              className="h-full w-auto object-contain"
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
                      index === currentIndex ? 'bg-black' : 'bg-[#E5E5E5]'
                    }`}
                  />
                ))}
              </div>
              
              {/* Photo counter */}
              <div className="text-center mt-2 text-sm text-[#666666]">
                {currentIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  console.log('TripDetailPage render - showImageViewer:', showImageViewer);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 bg-red-500 text-white p-2 z-50">
          showImageViewer: {showImageViewer.toString()}
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E5E5E5]">
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
              <h1 className="text-xl font-semibold text-[#2D2D2D]">
                {t("myAuto.tripDetails.title")}
              </h1>
              <p className="text-sm text-[#666666]">
                {car.name} • {car.plate_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-[#666666]">Загрузка деталей поездки...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-[#666666] mb-4">
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
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4">
              <h2 className="text-lg font-medium text-[#2D2D2D] mb-4">
                Информация о поездке
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#666666]">{t("myAuto.tripDetails.duration")}:</span>
                  <span className="font-medium text-[#2D2D2D]">{formatDuration(tripDetails.duration_minutes)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#666666]">{t("myAuto.tripDetails.earnings")}:</span>
                  <span className="font-bold text-black text-2xl">
                    {tripDetails.earnings.toLocaleString()} ₸
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#666666]">{t("myAuto.tripDetails.rentalType")}:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tripDetails.rental_type === 'minutes' ? 'bg-[#E3F2FD] text-[#1565C0]' :
                    tripDetails.rental_type === 'hours' ? 'bg-[#E8F5E8] text-[#2E7D32]' :
                    'bg-[#F3E5F5] text-[#7B1FA2]'
                  }`}>
                    {formatRentalType(tripDetails.rental_type)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#666666]">{t("myAuto.tripDetails.startTime")}:</span>
                  <span className="font-medium text-[#2D2D2D]">{formatDate(tripDetails.start_time)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#666666]">{t("myAuto.tripDetails.endTime")}:</span>
                  <span className="font-medium text-[#2D2D2D]">{formatDate(tripDetails.end_time)}</span>
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
              photos={filterSelfiePhotos(tripDetails.photos.mechanic_after.photos)}
            />

            {/* Route Map Info */}
            {tripDetails.route_map && (
              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4">
                <h3 className="text-lg font-medium text-[#2D2D2D] mb-3">
                  {t("myAuto.tripDetails.route.title")}
                </h3>
                {tripDetails.route_map.route_data ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666666] font-medium">Длительность:</span>
                      <span className="text-[#2D2D2D]">
                        {tripDetails.route_map.duration_over_24h ? "Более 24 часов" : "Менее 24 часов"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666666] font-medium">Дней маршрута:</span>
                      <span className="text-[#2D2D2D]">
                        {tripDetails.route_map.route_data.daily_routes.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666666] font-medium">Всего точек:</span>
                      <span className="text-[#2D2D2D]">
                        {tripDetails.route_map.route_data.total_coordinates}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#666666] text-center py-4">{t("myAuto.tripDetails.route.noRoute")}</p>
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
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-black hover:bg-black/90 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
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

      {/* Full Screen Image Viewer Modal */}
      {showImageViewer && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black z-[9999]"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeImageViewer();
            }
          }}
        >
          {/* Photo Counter - Top Right */}
          {currentPhotoSet.length > 1 && (
            <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">
                {currentPhotoIndex + 1} / {currentPhotoSet.length}
              </span>
            </div>
          )}

          {/* Close Button - Top Left */}
          <button
            onClick={closeImageViewer}
            className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Viewer */}
          <div 
            className="h-full w-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageErrors[currentPhotoIndex] ? (
              <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center">
                <svg className="w-16 h-16 text-white/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-white text-sm font-medium">Фото недоступно</p>
              </div>
            ) : (
              <>
                {imageLoading[currentPhotoIndex] && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
                <img
                  src={currentPhotoSet[currentPhotoIndex]?.startsWith('http') 
                    ? currentPhotoSet[currentPhotoIndex] 
                    : `https://api.azvmotors.kz/${currentPhotoSet[currentPhotoIndex]}`}
                  alt={`Фото ${currentPhotoIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                  onError={() => handleImageError(currentPhotoIndex)}
                  onLoad={() => handleImageLoad(currentPhotoIndex)}
                  onLoadStart={() => handleImageLoadStart(currentPhotoIndex)}
                  draggable={false}
                />
              </>
            )}
          </div>

          {/* Navigation arrows */}
          {currentPhotoSet.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Bottom progress bar */}
          {currentPhotoSet.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent">
              <div className="p-4 pb-8">
                <div className="w-full bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-white rounded-full h-1 transition-all duration-300"
                    style={{ width: `${((currentPhotoIndex + 1) / currentPhotoSet.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Instruction Text */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
            <p className="text-white/70 text-sm text-center">
              Приближайте пальцами
            </p>
          </div>
        </div>
      )}
    </div>
  );
};