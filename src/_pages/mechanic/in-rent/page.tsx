"use client";
import { CarCard } from "@/entities/car-card";

import React, { useEffect } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

const MyCarsPage = ({ onClose }: { onClose: () => void }) => {
  const { fetchInUseVehicles, inUseVehicles, isLoadingInUse } =
    useVehiclesStore();
  const { t } = useClientTranslations();

  useEffect(() => {
    fetchInUseVehicles();
  }, [fetchInUseVehicles]);

  return (
    <section>
      <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoadingInUse ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t("search.loading", "Загрузка...")}
          </div>
        ) : inUseVehicles.length > 0 ? (
          inUseVehicles.map((car) => (
            <CarCard onCarClick={onClose} key={car.id} car={car} />
          ))
        ) : (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t("search.noResults", "Ничего не найдено")}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyCarsPage;
