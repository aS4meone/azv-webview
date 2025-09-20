"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import { MyCarsResponse, MyCar } from "@/shared/models/types/my-auto";
import { myAutoApi } from "@/shared/api/routes/my-auto";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { MyAutoDetailPage } from "./index";
import { OwnedCarCard } from "@/entities/car-card";
import { useUserStore } from "@/shared/stores/userStore";

export const MyAutoPage = () => {
  const t = useTranslations();
  const { user } = useUserStore();
  const [cars, setCars] = useState<MyCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<MyCar | null>(null);
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get cars from user store (owned_cars) and add photos
      if (user?.owned_cars) {
        const carsWithPhotos = user.owned_cars.map((car: any) => ({
          id: car.id,
          name: car.name,
          plate_number: car.plate_number,
          photos: car.photos || [],
          available_minutes: car.available_minutes || 0,
          latitude: car.latitude || 0,
          longitude: car.longitude || 0,
        }));
        setCars(carsWithPhotos);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError(t("myAuto.errorTitle"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== User Effect Debug ===');
    console.log('user:', user);
    console.log('user?.id:', user?.id);
    console.log('========================');
    
    if (user) {
      fetchCars();
    }
  }, [user]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openTooltipIndex !== null && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenTooltipIndex(null);
      }
    };

    if (openTooltipIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openTooltipIndex]);

  const handleCarSelect = (car: MyCar) => {
    console.log('=== Car Selection Debug ===');
    console.log('Selected car:', car);
    console.log('User object:', user);
    console.log('User ID:', user?.id, 'type:', typeof user?.id);
    console.log('===========================');
    setSelectedCar(car);
  };

  const handleBack = () => {
    setSelectedCar(null);
  };

  const handleTooltipHover = (index: number | null) => {
    setOpenTooltipIndex(index);
  };

  if (selectedCar) {
    // Wait for user to be loaded before showing detail page
    if (!user) {
      return (
        <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("myAuto.loadingUser")}</p>
          </div>
        </div>
      );
    }
    
    return (
      <CustomPushScreen
        direction="right"
        isOpen={true}
        onClose={handleBack}
      >
        <MyAutoDetailPage 
          car={selectedCar} 
          onBackAction={handleBack} 
          userId={user.id} 
        />
      </CustomPushScreen>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E5E5E5]">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-[#2D2D2D]">
              {t("myAuto.title")}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-[#666666]">{t("myAuto.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">
                {t("myAuto.errorTitle")}
              </h3>
              <p className="text-[#666666] mb-4">
                {t("myAuto.errorDescription")}
              </p>
              <Button onClick={fetchCars} variant="primary">
                {t("myAuto.retry")}
              </Button>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">
                {t("myAuto.noCars")}
              </h3>
              <p className="text-[#666666]">
                {t("myAuto.noCarsDescription")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {cars.map((car, index) => (
              <div 
                key={car.id} 
                onClick={() => handleCarSelect(car)}
                className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Car Photo - Full Width */}
                {car.photos && car.photos.length > 0 && (
                  <div className="w-full h-48 image-container">
                    <img
                      src={`https://api.azvmotors.kz${car.photos[0]}`}
                      alt={car.name}
                      className="car-card-full-width"
                    />
                  </div>
                )}
                
                {/* Car Info */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#2D2D2D] mb-1">
                      {car.name}
                    </h3>
                    <p className="text-sm text-[#666666] mb-2">
                      {car.plate_number}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#888888]">{t("myAuto.availableMinutes")}</span>
                      <span className={`text-sm font-medium ${
                        car.available_minutes >= 21600 ? 'text-[#2E7D32]' : 'text-[#D32F2F]'
                      }`}>
                        {car.available_minutes.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Available Minutes Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white text-xs font-bold ${
                        car.available_minutes >= 21600 ? 'bg-[#2E7D32]' : 'bg-[#D32F2F]'
                      }`}
                    >
                      <span className="text-sm">{car.available_minutes}</span>
                      <span className="text-[10px]">{t("myAuto.timeUnits.minutes")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
