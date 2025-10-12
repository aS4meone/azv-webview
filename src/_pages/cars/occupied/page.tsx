"use client";
import React, { useEffect } from "react";
import { OccupiedCarsList } from "./ui/OccupiedCarsList";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { CarStatus } from "@/shared/models/types/car";

const OccupiedCarsPage = ({ onClose }: { onClose: () => void }) => {
  const { fetchAllVehicles, allVehicles, isLoadingAll } = useVehiclesStore();

  useEffect(() => {
    fetchAllVehicles();
  }, [fetchAllVehicles]);

  // Фильтруем все занятые машины (не со статусом free)
  const occupiedCars = allVehicles.filter(car => car.status !== CarStatus.free);

  if (isLoadingAll) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center py-4 text-[#191919] text-[16px]">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full">
      <OccupiedCarsList
        cars={occupiedCars}
        onCarClick={onClose}
        onBackAction={onClose}
      />
    </div>
  );
};

export default OccupiedCarsPage;
