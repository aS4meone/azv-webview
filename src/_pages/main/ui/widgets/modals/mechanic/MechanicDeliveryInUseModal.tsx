"use client";

import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";import { CarInfoHeader, CarControlsSlider } from "../ui";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";

import {
  useResponseModal,
  VehicleActionSuccessModal,
  VehicleActionType,
  ResponseBottomModalProps,
} from "@/shared/ui/modal";
import { vehicleActionsApi } from "@/shared/api/routes/vehicles";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { IUser } from "@/shared/models/types/user";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import { baseConfig } from "@/shared/contexts/PhotoUploadContext";
import { CarStatus, ICar } from "@/shared/models/types/car";
import { mechanicActionsApi, mechanicApi } from "@/shared/api/routes/mechanic";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { openIn2GIS } from "@/shared/utils/urlUtils";

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
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { fetchCurrentDeliveryVehicle, forceClearCacheAndRefresh } =
    useVehiclesStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [actionType, setActionType] = useState<VehicleActionType | null>(null);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const car: ICar = notRentedCar || ({} as ICar);

  const handleClose = async () => {
    try {
      // Обновляем данные о текущей доставке (может вернуть 404, что нормально)
      try {
        await fetchCurrentDeliveryVehicle();
      } catch {
        console.log("No current delivery after completion - this is expected");
      }

      // Обновляем данные пользователя
      await refreshUser();

      // Принудительно очищаем кэш и обновляем все данные механика
      await forceClearCacheAndRefresh();

      // Отправляем событие для принудительной очистки кэша карты
      window.dispatchEvent(new CustomEvent("deliveryCompleted"));

      // Дополнительное обновление с задержкой для гарантии
      setTimeout(async () => {
        try {
          await forceClearCacheAndRefresh();
        } catch (error) {
          console.warn(
            "Failed to refresh data after delay in handleClose:",
            error
          );
        }
      }, 500);
    } catch (error) {
      console.warn("Failed to refresh data on modal close:", error);
      // Продолжаем закрытие даже если обновление не удалось
    }

    setResponseModal(null);
    onClose();
  };

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

          // Дополнительно обновляем данные после завершения доставки
          try {
            await refreshUser();
            await forceClearCacheAndRefresh();

            // Отправляем событие для принудительной очистки кэша карты
            window.dispatchEvent(new CustomEvent("deliveryCompleted"));

            // Небольшая задержка для обновления карты
            setTimeout(async () => {
              try {
                await forceClearCacheAndRefresh();
              } catch (error) {
                console.warn("Failed to refresh data after delay:", error);
              }
            }, 1000);
          } catch (error) {
            console.warn(
              "Failed to refresh data after delivery completion:",
              error
            );
          }

          setResponseModal({
            type: "success",
            isOpen: true,
            description: t("mechanic.delivery.successfullyCompleted"),
            buttonText: t("mechanic.common.excellent"),
            onButtonClick: handleClose,
            onClose: handleClose,
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error?.response?.data?.detail || t("mechanic.delivery.completionError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
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
          : t("mechanic.delivery.pauseError");

      showModal({
        type: "error",
        description:
          errorMessage || t("mechanic.delivery.pauseError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
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
          : t("mechanic.delivery.resumeError");

      showModal({
        type: "error",
        description: errorMessage || t("mechanic.delivery.resumeError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
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
          : t("mechanic.common.lockError");

      showModal({
        type: "error",
        description:
          errorMessage || t("mechanic.common.lockError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
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
          : t("mechanic.common.unlockError");

      showModal({
        type: "error",
        description:
          errorMessage || t("mechanic.common.unlockError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      
      <div className="p-6 pt-4 space-y-6">
        <CarInfoHeader car={car} />
      </div>

      <CustomResponseModal
        isOpen={responseModal?.isOpen || false}
        onClose={responseModal?.onClose || (() => { })}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
        onButtonClick={responseModal?.onButtonClick || (() => { })}
      />

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
            {t("mechanic.delivery.pauseDelivery")}
          </Button>
          <Button
            variant="outline"
            className="text-[14px]"
            onClick={handleResumeDelivery}
          >
            {t("mechanic.delivery.resumeDelivery")}
          </Button>
        </div>

        {/* Car Controls Slider */}
        <CarControlsSlider onLock={handleUnlock} onUnlock={handleLock} />

        <Button onClick={() => setShowUploadPhoto(true)} variant="secondary">
          {t("mechanic.delivery.completeDelivery")}
        </Button>

        {/* Кнопка для просмотра в 2GIS */}
        {notRentedCar.delivery_coordinates && (
          <>
            <Button
              variant="outline"
              onClick={() =>
                openIn2GIS(
                  notRentedCar.latitude,
                  notRentedCar.longitude
                )
              }
              className="flex items-center justify-center gap-2"
            >
              <FaCar className="w-4 h-4" />
              {t("mechanic.vehicle.carPoint")}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                openIn2GIS(
                  notRentedCar.delivery_coordinates!.latitude,
                  notRentedCar.delivery_coordinates!.longitude
                )
              }
              className="flex items-center justify-center gap-2"
            >
              <FaMapMarkerAlt className="w-4 h-4" />
              {t("mechanic.vehicle.deliveryPoint")}
            </Button>
          </>


        )}
      </div>
    </div>
  );
};
