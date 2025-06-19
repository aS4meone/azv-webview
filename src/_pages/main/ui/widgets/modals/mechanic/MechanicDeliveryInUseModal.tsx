import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { CarInfoHeader, CarControlsSlider } from "../ui";

import {
  useResponseModal,
  VehicleActionSuccessModal,
  VehicleActionType,
} from "@/shared/ui/modal";
import { vehicleActionsApi } from "@/shared/api/routes/vehicles";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { IUser } from "@/shared/models/types/user";
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import { baseConfig } from "@/shared/contexts/PhotoUploadContext";
import { CarStatus, ICar } from "@/shared/models/types/car";
import { mechanicActionsApi, mechanicApi } from "@/shared/api/routes/mechanic";

interface MechanicDeliveryInUseModalProps {
  user: IUser;
  onClose: () => void;
  notRentedCar: ICar;
}

export const MechanicDeliveryInUseModal = ({
  user,
  onClose,
  notRentedCar,
}: MechanicDeliveryInUseModalProps) => {
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { fetchAllMechanicVehicles, fetchCurrentDeliveryVehicle } =
    useVehiclesStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [actionType, setActionType] = useState<VehicleActionType | null>(null);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);

  const car: ICar = notRentedCar || ({} as ICar);

  const handleUploadAfterDelivery = async (files: {
    [key: string]: File[];
  }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }

    try {
      const res = await mechanicApi.uploadAfterDelivery(formData);
      if (res.status === 200) {
        // Сразу завершаем доставку после загрузки фото
        const completeRes = await mechanicApi.completeDelivery();
        if (completeRes.status === 200) {
          setIsLoading(false);
          setShowUploadPhoto(false);
          onClose();

          showModal({
            type: "success",
            description: "Доставка успешно завершена",
            buttonText: "Отлично",
            onClose: async () => {
              await refreshUser();
              await fetchAllMechanicVehicles();
              await fetchCurrentDeliveryVehicle();
            },
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error?.response?.data?.detail || "Ошибка при завершении доставки",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const showSuccessModal = (actionType: VehicleActionType) => {
    setIsSuccessOpen(true);
    setActionType(actionType);
  };

  useEffect(() => {
    if (isSuccessOpen) {
      setTimeout(() => {
        setIsSuccessOpen(false);
      }, 1000);
    }
  }, [isSuccessOpen]);

  // Vehicle action handlers
  const handlePauseDelivery = async () => {
    try {
      if (user.current_rental?.car_details.status === CarStatus.inUse) {
        await vehicleActionsApi.takeKey();
      } else {
        await mechanicActionsApi.takeKey();
      }
      showSuccessModal("takeKey");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Ошибка при попытке приостановить доставку";

      showModal({
        type: "error",
        description:
          errorMessage || "Ошибка при попытке приостановить доставку",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleResumeDelivery = async () => {
    try {
      if (user.current_rental?.car_details.status === CarStatus.inUse) {
        await vehicleActionsApi.giveKey();
      } else {
        await mechanicActionsApi.giveKey();
      }
      showSuccessModal("giveKey");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Ошибка при попытке возобновить доставку";

      showModal({
        type: "error",
        description: errorMessage || "Ошибка при попытке возобновить доставку",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleLock = async () => {
    try {
      if (user.current_rental?.car_details.status === CarStatus.inUse) {
        await vehicleActionsApi.closeVehicle();
      } else {
        await mechanicActionsApi.closeVehicle();
      }
      showSuccessModal("lock");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Ошибка при попытке заблокировать автомобиль";

      showModal({
        type: "error",
        description:
          errorMessage || "Ошибка при попытке заблокировать автомобиль",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleUnlock = async () => {
    try {
      if (user.current_rental?.car_details.status === CarStatus.inUse) {
        await vehicleActionsApi.openVehicle();
      } else {
        await mechanicActionsApi.openVehicle();
      }
      showSuccessModal("unlock");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Ошибка при попытке разблокировать автомобиль";

      showModal({
        type: "error",
        description:
          errorMessage || "Ошибка при попытке разблокировать автомобиль",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <div className="p-6 pt-4 space-y-6">
        <CarInfoHeader car={car} />
      </div>

      <VehicleActionSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
        }}
        actionType={actionType!}
      />

      <UploadPhoto
        config={baseConfig}
        isLoading={isLoading}
        onPhotoUpload={handleUploadAfterDelivery}
        isOpen={showUploadPhoto}
        withCloseButton
        onClose={() => setShowUploadPhoto(false)}
      />

      <div className="p-6 pt-4 space-y-6">
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            className="text-[14px]"
            onClick={handlePauseDelivery}
          >
            Пауза
          </Button>
          <Button
            variant="outline"
            className="text-[14px]"
            onClick={handleResumeDelivery}
          >
            Начать поездку
          </Button>
        </div>

        {/* Car Controls Slider */}
        <CarControlsSlider onLock={handleUnlock} onUnlock={handleLock} />

        <Button onClick={() => setShowUploadPhoto(true)} variant="secondary">
          Завершить доставку
        </Button>
      </div>
    </div>
  );
};
