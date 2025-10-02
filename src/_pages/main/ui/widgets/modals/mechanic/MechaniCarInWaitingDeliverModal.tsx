"use client";

import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { IUser } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import {
  baseConfigStep1,
  baseConfigStep2,
  DELIVERY_UPLOAD,
  usePhotoUpload,
} from "@/shared/contexts/PhotoUploadContext";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { MechanicWaitingTimer } from "../../timers/MechanicTimer";
import { ICar } from "@/shared/models/types/car";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";

interface MechaniCarInWaitingDeliverModalProps {
  user: IUser;
  notHaveCar: ICar;
  onClose: () => void;
}

export const MechaniCarInWaitingDeliverModal = ({
  user,
  notHaveCar,
  onClose,
}: MechaniCarInWaitingDeliverModalProps) => {
  const t = useTranslations();
  const [showUploadPhotoStep1, setShowUploadPhotoStep1] = useState(false);
  const [showUploadPhotoStep2, setShowUploadPhotoStep2] = useState(false);
  const [showPhotoUploadButton, setShowPhotoUploadButton] = useState(false);
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { setUploadRequired } = usePhotoUpload();
  const { fetchCurrentDeliveryVehicle, forceRefreshMechanicData } =
    useVehiclesStore();
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const car = notHaveCar;

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    try {
      await refreshUser();
      try {
        await fetchCurrentDeliveryVehicle();
      } catch {
        console.log("No current delivery - this is expected");
      }
      await forceRefreshMechanicData();
    } catch (error) {
      console.warn("Failed to refresh data on modal close:", error);
    }
  };

  async function handleStartDelivery() {
    try {
      console.log("Starting delivery process...");
      // Сначала проверяем машину
      const checkRes = await mechanicApi.reserveCheckCar(notHaveCar.id);
      console.log("Car check result:", checkRes);
      
      // Затем пытаемся запустить доставку
      const res = await mechanicApi.startDeliveryCar();
      if (res.status === 200) {
        // Если успешно - закрываем модал
        handleClose();
      }
    } catch (error) {
      console.error("Error in handleStartDelivery:", error);
      // Если ошибка - показываем кнопку загрузки фото
      if (error.response?.data?.detail?.includes("загрузите фото")) {
        setShowPhotoUploadButton(true);
        console.log("Showing photo upload button");
      } else {
        showModal({
          type: "error",
          description: error.response?.data?.detail || "Ошибка при запуске доставки",
          buttonText: t("modal.error.tryAgain"),
          onClose: () => {},
        });
      }
    }
  }

  const handleStartPhotoUpload = async () => {
    try {
      console.log("Starting photo upload process...");
      
      // Закрываем все модальные окна и показываем первый этап загрузки фото
      setResponseModal(null);
      setShowPhotoUploadButton(false);
      setShowUploadPhotoStep1(true);
      console.log("Upload photo step 1 should be visible now");
    } catch (error) {
      console.error("Error in handleStartPhotoUpload:", error);
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при запуске загрузки фото",
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleUploadStep1 = async (files: {
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
      const res = await mechanicApi.uploadBeforeDelivery(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhotoStep1(false);
        
        // Показываем успех и переходим ко второму этапу
        setResponseModal({
          type: "success",
          isOpen: true,
          title: "Фото загружены",
          description: "Селфи и фото кузова загружены. Теперь сфотографируйте салон.",
          buttonText: "Продолжить",
          onButtonClick: () => {
            setResponseModal(null);
            setShowUploadPhotoStep2(true);
          },
          onClose: () => {
            setResponseModal(null);
            setShowUploadPhotoStep2(true);
          },
        });
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error.response?.data?.detail || t("mechanic.delivery.photoUploadError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleUploadStep2 = async (files: {
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
      // Загружаем фото салона
      const res = await mechanicApi.uploadBeforeDeliveryInterior(formData);
      if (res.status === 200) {
        // После загрузки фото салона запускаем доставку
        const startRes = await mechanicApi.startDeliveryCar();
        if (startRes.status === 200) {
          setIsLoading(false);
          setShowUploadPhotoStep2(false);
          
          // Показываем успех и закрываем модал
          setResponseModal({
            type: "success",
            isOpen: true,
            title: "Доставка запущена",
            description: "Все фото загружены. Доставка успешно запущена.",
            buttonText: "Отлично",
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
          error.response?.data?.detail || t("mechanic.delivery.photoUploadError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      

      <CustomResponseModal
        isOpen={responseModal?.isOpen || false}
        onClose={responseModal?.onClose || (() => {})}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
        onButtonClick={responseModal?.onButtonClick || (() => {})}
      />
      
      <UploadPhoto
        config={baseConfigStep1}
        onPhotoUpload={handleUploadStep1}
        isLoading={isLoading}
        isOpen={showUploadPhotoStep1}
        onClose={() => setShowUploadPhotoStep1(false)}
      />
      
      <UploadPhoto
        config={baseConfigStep2}
        onPhotoUpload={handleUploadStep2}
        isLoading={isLoading}
        isOpen={showUploadPhotoStep2}
        onClose={() => setShowUploadPhotoStep2(false)}
      />

      {/* Таймер ожидания */}
      <div className="absolute -top-16 right-4 left-4 z-10">
        <MechanicWaitingTimer
          user={user}
          deCar={notHaveCar}
          deReservationTime={notHaveCar.reservation_time}
        />
      </div>

      {/* Car Image Carousel */}
      <CarImageCarousel car={car} rounded={true} />

      {/* Content */}
      <div className="p-6 pt-4 space-y-6">
        {/* Car Title and Plate */}
        <CarInfoHeader car={car} />

        {/* Car Specs */}
        <CarSpecs car={car} />

        <div>
          <h4 className="text-[20px] font-semibold text-[#191919]">
            {t("mechanic.delivery.preparationTitle")}
          </h4>
          <h4 className="text-[18px] text-[#191919]">
            {t("mechanic.delivery.preparationDescription")}
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!showPhotoUploadButton ? (
            <Button onClick={handleStartDelivery} variant="secondary">
              {t("mechanic.delivery.startDelivery")}
            </Button>
          ) : (
            <Button onClick={handleStartPhotoUpload} variant="secondary">
              Загрузить фото кузова и селфи
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
