"use client";
import { CarCard } from "@/entities/car-card";
import React, { useEffect } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { webviewDebugger } from "@/shared/utils/webview-debug";

const FreeCarsPage = ({ onClose }: { onClose: () => void }) => {
  const { fetchAllVehicles, allVehicles, isLoadingAll } = useVehiclesStore();

  useEffect(() => {
    webviewDebugger.logRequest("FreeCarsPage", "fetchAllVehicles");
    fetchAllVehicles();
  }, [fetchAllVehicles]);

  return (
    <section>
      <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoadingAll ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            Загрузка...
          </div>
        ) : allVehicles.length > 0 ? (
          allVehicles.map((car) => (
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
