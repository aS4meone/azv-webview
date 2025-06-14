import { ICar, CarStatus } from "@/shared/models/types/car";
import { DeliveryData } from "@/shared/hooks/useCurrentDelivery";

/**
 * Преобразует данные доставки в объект ICar
 * @param deliveryData - данные доставки
 * @returns объект ICar
 */
export const createCarFromDeliveryData = (deliveryData: DeliveryData): ICar => {
  return {
    id: deliveryData.car_id,
    name: deliveryData.car_name,
    plate_number: deliveryData.plate_number,
    latitude: deliveryData.latitude,
    longitude: deliveryData.longitude,
    course: deliveryData.course,
    fuel_level: deliveryData.fuel_level,
    engine_volume: deliveryData.engine_volume,
    year: deliveryData.year,
    drive_type: deliveryData.drive_type,
    photos: deliveryData.photos,
    status: CarStatus.delivering,

    // Значения по умолчанию для полей, которых нет в DeliveryData
    price_per_minute: 0,
    price_per_hour: 0,
    price_per_day: 0,
    owner_id: 0,
    current_renter_id: null,
    open_price: 0,
    owned_car: false,
    rental_id: deliveryData.rental_id,
  };
};

/**
 * Получает координаты места доставки из данных доставки
 * @param deliveryData - данные доставки
 * @returns координаты доставки
 */
export const getDeliveryCoordinates = (deliveryData: DeliveryData) => {
  return {
    latitude: deliveryData.delivery_coordinates.latitude,
    longitude: deliveryData.delivery_coordinates.longitude,
  };
};

/**
 * Форматирует время заказа доставки
 * @param deliveryData - данные доставки
 * @returns отформатированное время
 */
export const formatDeliveryTime = (deliveryData: DeliveryData): string => {
  return new Date(deliveryData.reservation_time).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Проверяет, является ли доставка активной
 * @param deliveryData - данные доставки
 * @returns true если доставка активна
 */
export const isActiveDelivery = (deliveryData: DeliveryData): boolean => {
  return deliveryData.status === "delivering";
};
