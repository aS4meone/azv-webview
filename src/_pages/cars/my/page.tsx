"use client";
import { CarCard } from "@/entities/car-card";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import React, { useEffect } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";

const MyCarsPage = ({ onClose }: { onClose: () => void }) => {
  const { fetchAllVehicles, allVehicles, isLoadingAll } = useVehiclesStore();

  useEffect(() => {
    fetchAllVehicles();
  }, [fetchAllVehicles]);

  return (
    <section>
      <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoadingAll ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            Загрузка...
          </div>
        ) : allVehicles.filter((car) => car.owned_car).length > 0 ? (
          allVehicles
            .filter((car) => car.owned_car)
            .map((car) => (
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

export default MyCarsPage;
