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
    name: car.name,
    plate_number: car.plate_number,
    photos: car.photos || [],
    available_minutes: car.available_minutes || 0,
    latitude: car.latitude || 0,
    longitude: car.longitude || 0,
  });

  const handleTooltipHover = (index: number | null) => {
    setOpenTooltipIndex(index);
  };

  return (
    <section ref={containerRef}>
       
        
        <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoading ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t('cars.loading')}
          </div>
        ) : ownedCars.length > 0 ? (
          ownedCars.map((car, index) => (
            <OwnedCarCard 
              onCarClick={onClose} 
              key={car.id} 
              car={convertToMyCar(car)} 
              index={index}
              isTooltipOpen={openTooltipIndex === index}
              onTooltipHover={handleTooltipHover}
            />
          ))
        ) : (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t('cars.nothingFound')}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyCarsPage;
