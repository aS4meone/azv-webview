"use client";
import { CarCard } from "@/entities/car-card";

import React, { useEffect } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

const MyCarsPage = ({ onClose }: { onClose: () => void }) => {
  const { fetchPendingVehicles, pendingVehicles, isLoadingPending } =
    useVehiclesStore();
  const { t } = useClientTranslations();

  useEffect(() => {
    fetchPendingVehicles();
  }, [fetchPendingVehicles]);

  return (
    <section>
      <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoadingPending ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t("mechanic.loading")}
          </div>
        ) : pendingVehicles.length > 0 ? (
          pendingVehicles.map((car) => (
            <CarCard onCarClick={onClose} key={car.id} car={car} />
          ))
        ) : (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t("mechanic.noResults")}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyCarsPage;
