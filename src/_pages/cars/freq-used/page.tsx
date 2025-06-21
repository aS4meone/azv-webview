"use client";
import { CarCard } from "@/entities/car-card";

import React, { useEffect } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";

const FreeCarsPage = ({ onClose }: { onClose: () => void }) => {
  const {
    fetchFrequentlyUsedVehicles,
    frequentlyUsedVehicles,
    isLoadingFrequent,
  } = useVehiclesStore();

  useEffect(() => {
    fetchFrequentlyUsedVehicles();
  }, [fetchFrequentlyUsedVehicles]);

  return (
    <section>
      <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoadingFrequent ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            Загрузка...
          </div>
        ) : frequentlyUsedVehicles.length > 0 ? (
          frequentlyUsedVehicles.map((car) => (
            <CarCard onCarClick={onClose} key={car.id} car={car} />
          ))
        ) : (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            Ничего не найдено
          </div>
        )}
      </div>
    </section>
  );
};

export default FreeCarsPage;
