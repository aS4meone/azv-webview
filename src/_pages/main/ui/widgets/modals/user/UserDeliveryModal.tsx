import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { CarInfoHeader } from "../ui";
import { ResponseBottomModalProps } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import { useUserStore } from "@/shared/stores/userStore";
import { RentalStatus } from "@/shared/models/types/current-rental";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface UserDeliveryModalProps {
  car: ICar;
  onClose: () => void;
}

export const UserDeliveryModal = ({ car, onClose }: UserDeliveryModalProps) => {
  const { refreshUser, user } = useUserStore();
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const rentalStatus = user?.current_rental?.rental_details.status;

  // Логирование изменений статуса

  const handleModalClose = useCallback(async () => {
    console.log("[UserDeliveryModal] handleModalClose called");
    // Останавливаем polling при закрытии
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await refreshUser();
    onClose();
    setResponseModal(null);
  }, [refreshUser, onClose]);

  useEffect(() => {
    if (rentalStatus === RentalStatus.RESERVED) {
      handleModalClose();
    }
  }, [rentalStatus, handleModalClose]);

  // Функция для закрытия модала

  useEffect(() => {
    // Запускаем интервал каждые 10 секунд только для обновления данных
    // Не контролируем закрытие модала - это делает MainPage
    intervalRef.current = setInterval(() => {
      refreshUser();
    }, 10000);

    // Очистка при размонтировании компонента
    return () => {
      console.log("[UserDeliveryModal] Cleaning up interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refreshUser]);

  const handleResponseModalClose = async () => {
    await refreshUser();
    setResponseModal(null);
    onClose();
  };

  const handleCancelDelivery = async () => {
    console.log("[UserDeliveryModal] Cancel delivery requested");
    try {
      const res = await rentApi.cancelDelivery();
      if (res.status === 200) {
        // Останавливаем polling при отмене
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        setResponseModal({
          isOpen: true,
          type: "success",
          description: "Доставка отменена",
          buttonText: "Понятно",
          onClose: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
          onButtonClick: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
        });
      }
    } catch (error) {
      setResponseModal({
        isOpen: true,
        type: "error",
        description: error.response?.data?.detail || "Ошибка отмены доставки",
        buttonText: "Попробовать снова",
        onClose: handleResponseModalClose,
        onButtonClick: handleResponseModalClose,
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
        return {
          title: "Доставка",
          description: "Проверяем наличие свободных водителей в вашем районе",
          buttonText: "Отменить доставку",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="rounded-t-[24px] w-full mb-0 relative bg-transparent flex flex-col gap-4">
      <CustomResponseModal
        onButtonClick={responseModal?.onButtonClick || handleResponseModalClose}
        isOpen={!!responseModal}
        onClose={handleResponseModalClose}
        type={responseModal?.type || "success"}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
      />

      <div className="px-4">
        <div className="bg-blue-500 text-white px-6 py-4 flex items-center space-x-3 rounded-[40px] w-[100%]">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-lg font-medium">{statusInfo.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-4 space-y-6 bg-white overflow-hidden rounded-t-[24px]">
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
