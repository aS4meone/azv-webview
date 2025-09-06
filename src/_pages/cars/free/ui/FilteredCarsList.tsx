"use client";
import React from "react";
import { ICar, CarBodyType } from "@/shared/models/types/car";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";

interface FilteredCarsListProps {
  cars: ICar[];
  selectedBodyType: string;
  onCarClickAction: (car: ICar) => void;
  onBackAction: () => void;
}

const getBodyTypeLabel = (bodyType: string): string => {
  const labels: Record<string, string> = {
    [CarBodyType.SEDAN]: "Седан",
    [CarBodyType.SUV]: "Внедорожник", 
    [CarBodyType.CROSSOVER]: "Кроссовер",
    [CarBodyType.COUPE]: "Купе",
    [CarBodyType.HATCHBACK]: "Хэтчбек",
    [CarBodyType.CONVERTIBLE]: "Кабриолет",
    [CarBodyType.WAGON]: "Универсал",
    [CarBodyType.MINIBUS]: "Микроавтобус",
    [CarBodyType.ELECTRIC]: "Электромобиль",
  };
  return labels[bodyType] || bodyType;
};

const CarStatusBadge = ({ status }: { status: string }) => {
  const statuses: Record<string, string> = {
    "FREE": "Свободен",
    "IN_USE": "В аренде",
    "SERVICE": "В сервисе",
    "OWNER": "У Владелеца",
    "PENDING": "В ожидании",
    "FAILURE": "Неисправен",
    "RESERVED": "Зарезервирован",
    "DELIVERING": "В доставке",
    "TRACKING": "В пути",
  };

  const color: Record<string, string> = {
    "FREE": "#BAF2AF",
    "IN_USE": "#EF7C7C",
    "SERVICE": "#FFE494",
    "OWNER": "#AEC9F1",
    "PENDING": "#FFE494",
    "FAILURE": "#EF7C7C",
    "RESERVED": "#EF7C7C",
    "DELIVERING": "#FFE494",
    "TRACKING": "#EF7C7C",
  };

  return (
    <div
      className="px-2 py-1 rounded-[20px]"
      style={{ backgroundColor: color[status] || "#E5E5E5" }}
    >
      <p className="text-[#191919] text-[10px]">{statuses[status] || status}</p>
    </div>
  );
};

const CarCard = ({ car, onCarClickAction }: { car: ICar; onCarClickAction: (car: ICar) => void }) => {
  const router = useRouter();
  
  const handleClick = () => {
    // Навигация к главной странице с параметрами машины
    router.push(
      `${ROUTES.MAIN}?carId=${car.id}&lat=${car.latitude}&lng=${car.longitude}`
    );
    // Закрываем экран фильтрации
    onCarClickAction(car);
  };

  const getImageUrl = (photoPath: string) => {
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    return `https://api.azvmotors.kz${photoPath}`;
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <div className="flex gap-4">
        {/* Car Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {car.photos && car.photos.length > 0 ? (
            <img
              src={getImageUrl(car.photos[0])}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Car Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">{car.name}</h3>
            <CarStatusBadge status={car.status} />
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{car.plate_number}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{car.year} год</span>
            <span>{car.engine_volume === 0 ? 'Электро' : `${car.engine_volume}л`}</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export const FilteredCarsList = ({ cars, selectedBodyType, onCarClickAction, onBackAction }: FilteredCarsListProps) => {
  const bodyTypeLabel = getBodyTypeLabel(selectedBodyType);

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="py-4 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={onBackAction}
            className="mr-3 p-2 -ml-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{bodyTypeLabel}</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">{cars.length} автомобилей</p>
      </div>

      {/* Cars List */}
      <div className="py-4">
        <div className="space-y-3">
          {cars.length > 0 ? (
            cars.map((car) => (
              <CarCard key={car.id} car={car} onCarClickAction={onCarClickAction} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Нет доступных автомобилей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
