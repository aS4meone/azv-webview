import { useState, useEffect } from "react";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { useUserStore } from "@/shared/stores/userStore";
import { UserRole } from "@/shared/models/types/user";

export interface DeliveryData {
  rental_id: number;
  car_id: number;
  car_name: string;
  plate_number: string;
  fuel_level: number;
  latitude: number;
  longitude: number;
  course: number;
  engine_volume: number;
  drive_type: number;
  photos: string[];
  year: number;
  delivery_coordinates: {
    latitude: number;
    longitude: number;
  };
  reservation_time: string;
  status: string;
}

export const useCurrentDelivery = () => {
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);

  const { user } = useUserStore();

  const fetchCurrentDelivery = async () => {
    // Проверяем, что пользователь - механик
    if (!user || user.role !== UserRole.MECHANIC) {
      setDeliveryData(null);
      setIsDeliveryMode(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await mechanicApi.getCurrentDelivery();

      if (response.status === 200 && response.data) {
        setDeliveryData(response.data);
        setIsDeliveryMode(true);
        console.log("Current delivery fetched:", response.data);
      } else {
        setDeliveryData(null);
        setIsDeliveryMode(false);
      }
    } catch (error) {
      console.log("No current delivery or error:", error);
      setDeliveryData(null);
      setIsDeliveryMode(false);
      setError("Failed to fetch delivery data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentDelivery();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshDelivery = () => {
    fetchCurrentDelivery();
  };

  return {
    deliveryData,
    isLoading,
    error,
    isDeliveryMode,
    refreshDelivery,
  };
};
