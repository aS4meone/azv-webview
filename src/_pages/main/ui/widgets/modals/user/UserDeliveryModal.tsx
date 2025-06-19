import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useEffect, useRef } from "react";
import { CarInfoHeader } from "../ui";
import { useModal, useResponseModal } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import { useUserStore } from "@/shared/stores/userStore";
import { RentalStatus } from "@/shared/models/types/current-rental";

interface UserDeliveryModalProps {
  car: ICar;
  onClose: () => void;
}

export const UserDeliveryModal = ({ car, onClose }: UserDeliveryModalProps) => {
  const { showModal } = useResponseModal();
  const { hideModal } = useModal();
  const { refreshUser, user } = useUserStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const rentalStatus = user?.current_rental?.rental_details.status;

  useEffect(() => {
    // Запускаем интервал каждые 10 секунд
    intervalRef.current = setInterval(() => {
      console.log("Polling delivery status...");
      refreshUser();
    }, 10000);

    // Очистка при размонтировании компонента
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refreshUser]);

  const handleCancelDelivery = async () => {
    try {
      const res = await rentApi.cancelDelivery();
      if (res.status === 200) {
        // Останавливаем polling при отмене
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        showModal({
          type: "success",
          description: "Доставка отменена",
          buttonText: "Понятно",
          onClose: async () => {
            await refreshUser();
            onClose();
          },
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка отмены доставки",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const getStatusInfo = () => {
    switch (rentalStatus) {
      case RentalStatus.DELIVERY_RESERVED:
        return {
          title: "Водитель найден",
          description: "Водитель принял ваш заказ и готовится к выезду",
          buttonText: "Отменить доставку",
        };
      case RentalStatus.DELIVERY_IN_PROGRESS:
        return {
          title: "Машина в пути",
          description: "Водитель уже выехал и направляется к вам",
          buttonText: "Отменить доставку",
        };
      case RentalStatus.DELIVERING:
        return {
          title: "Поиск водителя",
          description:
            "Мы ищем ближайшего свободного водителя для вашего заказа",
          buttonText: "Отменить доставку",
        };
      default:
        hideModal();
        return {
          title: "Доставка",
          description: "Проверяем наличие свободных водителей в вашем районе",
          buttonText: "Отменить доставку",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      {/* Status Bar */}
      <div className="bg-blue-500 text-white px-6 py-4 flex items-center space-x-3 rounded-[40px] -top-[70px] absolute left-4 right-4">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        <span className="text-lg font-medium">{statusInfo.title}</span>
      </div>

      {/* Content */}
      <div className="p-6 pt-4 space-y-6">
        {/* Status Description */}
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">{statusInfo.description}</p>
        </div>

        {/* Car Info */}
        <CarInfoHeader car={car} />

        {/* Cancel Button */}
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={handleCancelDelivery}
            className="w-full bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
          >
            {statusInfo.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
