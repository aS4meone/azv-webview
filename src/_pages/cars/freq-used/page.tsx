"use client";
import { CarCard } from "@/entities/car-card";

import React, { useEffect } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

const FreeCarsPage = ({ onClose }: { onClose: () => void }) => {
  const {
    fetchFrequentlyUsedVehicles,
    frequentlyUsedVehicles,
    isLoadingFrequent,
  } = useVehiclesStore();
  const { t } = useClientTranslations();

  useEffect(() => {
    fetchFrequentlyUsedVehicles();
  }, [fetchFrequentlyUsedVehicles]);

  return (
    <section>
      <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoadingFrequent ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t('cars.loading')}
          </div>
        ) : frequentlyUsedVehicles.length > 0 ? (
          frequentlyUsedVehicles.map((car) => (
            <CarCard onCarClick={onClose} key={car.id} car={car} />
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

export default FreeCarsPage;
