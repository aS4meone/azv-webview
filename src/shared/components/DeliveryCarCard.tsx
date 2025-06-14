import React from "react";
import { DeliveryData } from "@/shared/hooks/useCurrentDelivery";
import {
  createCarFromDeliveryData,
  getDeliveryCoordinates,
  formatDeliveryTime,
  isActiveDelivery,
} from "@/shared/utils/deliveryUtils";
import { ICar } from "@/shared/models/types/car";

interface DeliveryCarCardProps {
  deliveryData: DeliveryData;
  onClick?: (car: ICar) => void;
}

export const DeliveryCarCard: React.FC<DeliveryCarCardProps> = ({
  deliveryData,
  onClick,
}) => {
  // Преобразуем данные доставки в объект ICar
  const car = createCarFromDeliveryData(deliveryData);

  // Получаем координаты доставки
  const deliveryCoordinates = getDeliveryCoordinates(deliveryData);

  // Форматируем время
  const formattedTime = formatDeliveryTime(deliveryData);

  // Проверяем активность доставки
  const isActive = isActiveDelivery(deliveryData);

  const handleClick = () => {
    if (onClick) {
      onClick(car);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-md border-l-4 ${
        isActive ? "border-blue-500" : "border-gray-300"
      }`}
      onClick={handleClick}
    >
      {/* Заголовок с информацией об автомобиле */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{car.name}</h3>
          <p className="text-sm text-gray-600">{car.plate_number}</p>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {isActive ? "Активная" : "Завершена"}
        </div>
      </div>

      {/* Информация о доставке */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Время заказа:</span>
          <span className="text-gray-900">{formattedTime}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Уровень топлива:</span>
          <span className="text-gray-900">
            {Math.round(car.fuel_level * 100)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Год выпуска:</span>
          <span className="text-gray-900">{car.year}</span>
        </div>
      </div>

      {/* Координаты доставки */}
      <div className="mt-3 p-2 bg-blue-50 rounded">
        <p className="text-xs text-blue-800 font-medium mb-1">
          Адрес доставки:
        </p>
        <p className="text-xs text-blue-700">
          {deliveryCoordinates.latitude.toFixed(6)},{" "}
          {deliveryCoordinates.longitude.toFixed(6)}
        </p>
      </div>

      {/* Текущее местоположение */}
      <div className="mt-2 p-2 bg-gray-50 rounded">
        <p className="text-xs text-gray-800 font-medium mb-1">
          Текущее местоположение:
        </p>
        <p className="text-xs text-gray-700">
          {car.latitude.toFixed(6)}, {car.longitude.toFixed(6)}
        </p>
      </div>
    </div>
  );
};
