import { POLYGON_COORDS } from "@/shared/constants/polygon";

/**
 * Проверяет, находится ли точка внутри полигона зоны обслуживания
 * Использует алгоритм Ray Casting для определения пересечений
 */
export function isPointInServiceZone(lat: number, lng: number): boolean {
  const polygon = POLYGON_COORDS;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    if (
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Проверяет, находится ли точка в зоне обслуживания с дополнительной информацией
 */
export function checkDeliveryAvailability(
  lat: number,
  lng: number
): {
  isAvailable: boolean;
  message: string;
} {
  const isInZone = isPointInServiceZone(lat, lng);

  if (isInZone) {
    return {
      isAvailable: true,
      message: "Доставка доступна в этом районе",
    };
  } else {
    return {
      isAvailable: false,
      message:
        "К сожалению, доставка в этот район недоступна. Выберите адрес в зоне обслуживания (синяя область на карте)",
    };
  }
}
