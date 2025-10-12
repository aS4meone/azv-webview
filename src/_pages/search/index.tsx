"use client";
import { CarCard } from "@/entities/car-card";
import { vehicleApi } from "@/shared/api/routes/vehicles";
import SearchIcon from "@/shared/icons/ui/SearchIcon";
import { ICar } from "@/shared/models/types/car";
import { Input } from "@/shared/ui";
import React, { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { useUserStore } from "@/shared/stores/userStore";
import { UserRole } from "@/shared/models/types/user";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

const SearchPage = ({ onClose }: { onClose: () => void }) => {
  const { user } = useUserStore();
  const { t } = useClientTranslations();
  const [search, setSearch] = useState("");
  const [cars, setCars] = useState<ICar[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(
    async (query: string, isInitial: boolean = false) => {
      if (!query.trim() && !isInitial) {
        setCars([]);
        return;
      }

      try {
        setIsLoading(true);
        
        // Используем реальный API для поиска
        if (user!.role === UserRole.MECHANIC) {
          const response = await mechanicApi.searchVehicles(query);
          setCars(response.vehicles || []);
        } else {
          const response = await vehicleApi.searchVehicles(query);
          setCars(response.vehicles || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setCars([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Создаем дебаунсированную версию поиска
  const debouncedSearch = useCallback(
    (query: string) => {
      const debouncedFn = debounce(() => handleSearch(query), 500);
      debouncedFn();
    },
    [handleSearch]
  );

  useEffect(() => {
    handleSearch(search, true);
  }, [handleSearch, search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  return (
    <section>
      <div className="relative">
        <Input
          className="pl-10"
          placeholder={t("search.placeholder", "Поиск...")}
          value={search}
          onChange={handleInputChange}
        />
        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2" />
      </div>
      <div className="flex flex-col gap-4 pt-4 overflow-scroll h-[calc(100vh-100px)] pb-[200px]">
        {isLoading ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t("search.loading", "Загрузка...")}
          </div>
        ) : cars.length > 0 ? (
          cars.map((car) => (
            <CarCard onCarClick={onClose} key={car.id} car={car} />
          ))
        ) : search ? (
          <div className="text-center py-4 text-[#191919] text-[16px]">
            {t("search.noResults", "Ничего не найдено")}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SearchPage;
