"use client";
import { CarCard } from "@/entities/car-card";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import React, { useEffect } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";

const FreeCarsPage = () => {
  const { fetchAllVehicles, allVehicles, isLoadingAll } = useVehiclesStore();

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  return (
    <article className="flex flex-col min-h-screen bg-white pt-10">
      <CustomAppBar title="Свободные автомобили" backHref={ROUTES.MAIN} />
      <section className="px-8 pt-5">
        <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
          {isLoadingAll ? (
            <div className="text-center py-4 text-[#191919] text-[16px]">
              Загрузка...
            </div>
          ) : allVehicles.length > 0 ? (
            allVehicles.map((car) => <CarCard key={car.id} car={car} />)
          ) : (
            <div className="text-center py-4 text-[#191919] text-[16px]">
              Ничего не найдено
            </div>
          )}
        </div>
      </section>
    </article>
  );
};

export default FreeCarsPage;
