"use client";
import { CarCard } from "@/entities/car-card";
import React, { useEffect } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";

const CarsPage = ({ onClose }: { onClose: () => void }) => {
  const { deliveryVehicles, fetchDeliveryVehicles, isLoadingDelivery } =
    useVehiclesStore();

  useEffect(() => {
    fetchDeliveryVehicles();
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoadingDelivery ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            Загрузка...
          </div>
        ) : deliveryVehicles.length > 0 ? (
          deliveryVehicles.map((car, index) => (
            <CarCard onCarClick={onClose} key={index} car={car} />
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

export default CarsPage;
