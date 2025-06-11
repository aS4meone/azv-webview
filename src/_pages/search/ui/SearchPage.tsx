"use client";
import { CarCard } from "@/entities/car-card";
import { vehicleApi } from "@/shared/api/routes/vehicles";
import { ROUTES } from "@/shared/constants/routes";
import SearchIcon from "@/shared/icons/ui/SearchIcon";
import { ICar } from "@/shared/models/types/car";
import { Input } from "@/shared/ui";
import { CustomAppBar } from "@/widgets/appbars";
import React, { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { useUserStore } from "@/shared/stores/userStore";
import { UserRole } from "@/shared/models/types/user";
import { mechanicApi } from "@/shared/api/routes/mechanic";

const SearchPage = () => {
  const { user } = useUserStore();
  const [search, setSearch] = useState("");
  const [cars, setCars] = useState<ICar[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleSearch(search, true);
  }, []);

  const handleSearch = async (query: string, isInitial: boolean = false) => {
    if (!query.trim() && !isInitial) {
      setCars([]);
      return;
    }

    try {
      if (user.role === UserRole.MECHANIC) {
        setIsLoading(true);
        const response = await mechanicApi.searchVehicles(query);

        setCars(response.vehicles || []);
      } else {
        setIsLoading(true);

        const response = await vehicleApi.searchVehicles(query);

        setCars(response.vehicles || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Создаем дебаунсированную версию поиска
  const debouncedSearch = useCallback(
    debounce((query: string) => handleSearch(query), 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  return (
    <article className="flex flex-col min-h-screen bg-white pt-10">
      <CustomAppBar title="Поиск автомобилей" backHref={ROUTES.MAIN} />
      <section className="px-8 pt-5">
        <div className="relative">
          <Input
            className="pl-10"
            placeholder="Поиск..."
            value={search}
            onChange={handleInputChange}
          />
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2" />
        </div>
        <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)]">
          {isLoading ? (
            <div className="text-center py-4 text-[#191919] text-[16px]">
              Загрузка...
            </div>
          ) : cars.length > 0 ? (
            cars.map((car) => <CarCard key={car.id} car={car} />)
          ) : search ? (
            <div className="text-center py-4 text-[#191919] text-[16px]">
              Ничего не найдено
            </div>
          ) : null}
        </div>
      </section>
    </article>
  );
};

export default SearchPage;
