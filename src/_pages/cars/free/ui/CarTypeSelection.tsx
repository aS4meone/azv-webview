"use client";
import React from "react";
import { CarBodyType } from "@/shared/models/types/car";
import { ICar } from "@/shared/models/types/car";

interface CarTypeSelectionProps {
  cars: ICar[];
  onTypeSelectAction: (bodyType: string) => void;
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

export const CarTypeSelection = ({ cars, onTypeSelectAction, onBackAction }: CarTypeSelectionProps) => {
  // Подсчитываем количество машин по типам кузова
  const getCarCounts = () => {
    const counts: Record<string, number> = {};
    
    cars.forEach(car => {
      if (car.engine_volume === 0.0) {
        // Электромобили
        counts[CarBodyType.ELECTRIC] = (counts[CarBodyType.ELECTRIC] || 0) + 1;
      } else {
        // Обычные машины по типу кузова
        const bodyType = car.body_type || 'UNKNOWN';
        counts[bodyType] = (counts[bodyType] || 0) + 1;
      }
    });
    
    return counts;
  };

  const carCounts = getCarCounts();

  // Создаем полный список всех типов кузова
  const allBodyTypes = Object.values(CarBodyType);
  
  const typeList = allBodyTypes.map(bodyType => ({
    bodyType,
    count: carCounts[bodyType] || 0,
    label: getBodyTypeLabel(bodyType)
  }));

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
          <h1 className="text-xl font-semibold text-gray-900">Тип кузова</h1>
        </div>
      </div>

      {/* Type List */}
      <div className="py-4">
        <div className="space-y-1">
          {typeList.map(({ bodyType, count, label }) => (
            <button
              key={bodyType}
              onClick={() => onTypeSelectAction(bodyType)}
              className={`w-full flex items-center justify-between py-4 px-4 rounded-lg transition-colors ${
                count > 0 
                  ? "bg-gray-50 hover:bg-gray-100" 
                  : "bg-gray-100 hover:bg-gray-200 opacity-60"
              }`}
            >
              <span className="text-lg font-medium text-gray-900">{label}</span>
              <div className="flex items-center">
                <span className={`text-sm mr-2 ${
                  count > 0 ? "text-gray-500" : "text-gray-400"
                }`}>
                  {count}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
