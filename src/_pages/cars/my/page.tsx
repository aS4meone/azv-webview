"use client";
import { OwnedCarCard } from "@/entities/car-card";
import React, { useEffect, useState, useRef } from "react";
import { useUserStore } from "@/shared/stores/userStore";
import { MyCar } from "@/shared/models/types/my-auto";
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

const MyCarsPage = ({ onClose }: { onClose: () => void }) => {
  const { fetchUser, user, isLoading } = useUserStore();
  const { t } = useClientTranslations();
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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


  const ownedCars = user?.owned_cars || [];

  // Convert ICar to MyCar format
  const convertToMyCar = (car: any): MyCar => ({
    id: car.id,
    name: car.name || 'Неизвестная модель',
    plate_number: car.plate_number || 'Нет номера',
    photos: car.photos || [],
    available_minutes: car.available_minutes || 0,
    latitude: car.latitude || 0,
    longitude: car.longitude || 0,
  });

  const handleTooltipHover = (index: number | null) => {
    setOpenTooltipIndex(index);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F5F5F5]">
      {/* Content */}
      <div className="py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-[#666666]">{t('cars.loading')}</p>
          </div>
        ) : ownedCars.length > 0 ? (
          <div className="space-y-3">
            {ownedCars.map((car, index) => (
              <OwnedCarCard 
                onCarClick={onClose} 
                key={car.id} 
                car={convertToMyCar(car)} 
                index={index}
                isTooltipOpen={openTooltipIndex === index}
                onTooltipHover={handleTooltipHover}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">
                {t('cars.nothingFound')}
              </h3>
              <p className="text-[#666666]">
                {t('cars.noCarsYet')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCarsPage;
