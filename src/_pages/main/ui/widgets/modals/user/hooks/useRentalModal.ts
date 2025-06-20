import { useState } from "react";
import { ResponseBottomModalContentProps } from "@/shared/ui/modal";
import { RentCarDto } from "@/shared/models/dto/rent.dto";
import { rentApi } from "@/shared/api/routes/rent";
import { ICar } from "@/shared/models/types/car";

type RentalType = "minutes" | "hours" | "days";

interface RentalData {
  carId: number;
  duration: number;
  rentalType: RentalType;
}

interface UseRentalModalProps {
  car: ICar;
  onClose: () => void;
  refreshUser: () => Promise<void>;
  redirectToCar: () => void;
}

export const useRentalModal = ({
  car,
  onClose,
  refreshUser,
  redirectToCar,
}: UseRentalModalProps) => {
  const [showRentalPage, setShowRentalPage] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalContentProps | null>(null);

  const handleRent = async (rentalData: RentalData) => {
    onClose();
    try {
      const data: RentCarDto = {
        carId: rentalData.carId,
        duration: rentalData.duration,
        rentalType: rentalData.rentalType,
      };

      const res = await rentApi.reserveCar(data);
      if (res.status === 200) {
        setResponseModal({
          type: "success",
          title: "Успешно забронированно",
          description: "Успешно забронированно",
          buttonText: "Отлично",
          onButtonClick: async () => {
            setResponseModal(null);
            await refreshUser();
          },
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };

      if (
        apiError.response.data.detail.includes("Пожалуйста, пополните счёт")
      ) {
        setResponseModal({
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Пополнить баланс",
          onButtonClick: () => {
            redirectToCar();
          },
        });
      } else {
        setResponseModal({
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Повторить попытку",
          onButtonClick: () => {},
        });
      }
    }
  };

  const handleDelivery = async (
    rentalData: RentalData,
    deliveryAddress: { lat: number; lng: number }
  ) => {
    if (!deliveryAddress) return;

    onClose();
    try {
      const data: RentCarDto = {
        carId: rentalData.carId,
        duration: rentalData.duration,
        rentalType: rentalData.rentalType,
      };

      const res = await rentApi.reserveDelivery(
        car.id,
        data,
        deliveryAddress.lng,
        deliveryAddress.lat
      );

      if (res.status === 200) {
        setResponseModal({
          type: "success",
          title: "Успешно забронированно",
          description: "Доставка успешно заказана",
          buttonText: "Отлично",
          onButtonClick: async () => {
            setResponseModal(null);
            await refreshUser();
          },
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };
      setResponseModal({
        type: "error",
        title: "Ошибка",
        description: apiError.response.data.detail,
        buttonText: "Попробовать снова",
        onButtonClick: () => {},
      });
    }
  };

  const handleOwnerRent = async () => {
    onClose();
    try {
      const data: RentCarDto = {
        carId: car.id,
        duration: 0,
        rentalType: "minutes",
      };

      const res = await rentApi.reserveCar(data);
      if (res.status === 200) {
        setResponseModal({
          type: "success",
          title: "Успешно забронированно",
          description: "Успешно забронированно",
          buttonText: "Отлично",
          onButtonClick: async () => {
            setResponseModal(null);
            await refreshUser();
          },
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };
      if (apiError.response.data.detail.startsWith("Для")) {
        setResponseModal({
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Пополнить",
          onButtonClick: () => {
            redirectToCar();
          },
        });
      } else {
        setResponseModal({
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Попробовать снова",
          onButtonClick: () => {
            setShowRentalPage(true);
          },
        });
      }
    }
  };

  return {
    showRentalPage,
    setShowRentalPage,
    isDelivery,
    setIsDelivery,
    responseModal,
    setResponseModal,
    handleRent,
    handleDelivery,
    handleOwnerRent,
  };
};
