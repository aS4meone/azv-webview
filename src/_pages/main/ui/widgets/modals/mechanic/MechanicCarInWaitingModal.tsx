"use client";

import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { IUser } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import {
  usePhotoUpload,
} from "@/shared/contexts/PhotoUploadContext";
import { mechanicApi, mechanicActionsApi } from "@/shared/api/routes/mechanic";
import { MechanicWaitingTimer } from "../../timers/MechanicTimer";
import { CarStatus } from "@/shared/models/types/car";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import { baseConfigStep1, baseConfigStep2 } from "@/shared/contexts/PhotoUploadContext";
import Loader from "@/shared/ui/loader";

interface MechanicCarInWaitingModalProps {
  user: IUser;
  onClose: () => void;
}

export const MechanicCarInWaitingModal = ({
  user,
  onClose,
}: MechanicCarInWaitingModalProps) => {
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { setUploadRequired } = usePhotoUpload();
  const [showDataScreen, setShowDataScreen] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadPhotoStep1, setShowUploadPhotoStep1] = useState(false);
  const [showUploadPhotoStep2, setShowUploadPhotoStep2] = useState(false);
  const car = user.current_rental!.car_details;

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    await refreshUser();
  };

  async function handleStartInspection() {
    // Проверяем статус загрузки фотографий из auth/user/me
    const hasSelfie = car.photo_before_selfie_uploaded || false;
    const hasCarPhotos = car.photo_before_car_uploaded || false;
    const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
    
    // Если селфи или фото кузова не загружены - показываем модал для их загрузки
    if (!hasSelfie || !hasCarPhotos) {
      setShowUploadPhotoStep1(true);
      return;
    }
    
    // Если селфи и фото кузова загружены, но фото салона не загружено - показываем модал для загрузки салона
    if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
      setShowUploadPhotoStep2(true);
      return;
    }
    
    // Если все фото загружены, отправляем запрос на начало осмотра
    if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
      try {
        const res = await mechanicApi.startCheckCar(car.id);
        if (res.status === 200) {
          setUploadRequired(true);
          setResponseModal({
            type: "success",
            isOpen: true,
            title: t("mechanic.inspection.successfullyStarted"),
            description: t("mechanic.inspection.uploadPhotosBeforeStart"),
            buttonText: t("mechanic.common.excellent"),
            onButtonClick: async () => {
              await refreshUser();
              handleClose();
            },
            onClose: handleClose,
          });
        }
      } catch (error) {
        showModal({
          type: "error",
          description: error.response.data.detail,
          buttonText: t("modal.error.tryAgain"),
          onClose: () => { },
        });
      }
    }
  }

  // Загрузка фото ДО осмотра - Шаг 1 (селфи + кузов)
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
      const res = await mechanicApi.uploadBeforeCheckCar(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhotoStep1(false);
        
        // Обновляем данные пользователя чтобы получить обновленные флаги
        await refreshUser();
        
        // Автоматически переходим к загрузке фото салона
        setShowUploadPhotoStep2(true);
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error.response?.data?.detail || "Ошибка загрузки фотографий",
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  // Загрузка фото ДО осмотра - Шаг 2 (салон)
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
      const res = await mechanicApi.uploadBeforeCheckCarInterior(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhotoStep2(false);
        
        // Обновляем данные пользователя чтобы получить обновленные флаги
        await refreshUser();
        
        // Закрываем модальное окно после успешной загрузки всех фотографий
        console.log("✅ All photos uploaded successfully, closing modal");
        handleClose();
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error.response?.data?.detail || "Ошибка загрузки фотографий",
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleCancelInspection = async () => {
    try {
      const res = await mechanicApi.cancelCheckCar();
      if (res.status === 200) {
        setResponseModal({
          type: "success",
          isOpen: true,
          description: t("mechanic.inspection.successfullyCancelled"),
          buttonText: t("mechanic.common.excellent"),
          onButtonClick: handleClose,
          onClose: handleClose,
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response.data.detail,
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
      });
    }
  };

  const handleViewData = () => {
    setShowDataScreen(true);
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <CustomResponseModal
        isOpen={responseModal?.isOpen || false}
        onClose={responseModal?.onClose || (() => { })}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
        onButtonClick={responseModal?.onButtonClick || (() => { })}
      />

      {/* Таймер ожидания */}
      <div className="absolute -top-16 right-4 left-4 z-10">
        <MechanicWaitingTimer user={user} />
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
            {t("mechanic.inspection.preparationTitle")}
          </h4>
          <h4 className="text-[18px] text-[#191919]">
            {t("mechanic.inspection.preparationDescription")}
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {car.status === CarStatus.service && (
            <Button variant="outline" onClick={handleViewData}>
              {t("mechanic.inspection.viewData")}
            </Button>
          )}

          <Button variant="outline" onClick={handleCancelInspection}>
            {t("mechanic.inspection.cancelInspection")}
          </Button>
          <Button onClick={handleStartInspection} variant="secondary">
            {(() => {
              const hasSelfie = car.photo_before_selfie_uploaded || false;
              const hasCarPhotos = car.photo_before_car_uploaded || false;
              const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
              
              if (!hasSelfie || !hasCarPhotos) {
                return "Загрузить селфи и фото кузова";
              } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
                return "Загрузить фото салона";
              } else if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
                return t("mechanic.inspection.startInspection");
              } else {
                return "Загрузить селфи и фото кузова";
              }
            })()}
          </Button>
        </div>
      </div>

      {showDataScreen && (
        <DescriptionScreen car={car} onClose={() => setShowDataScreen(false)} />
      )}

      {/* Модальное окно загрузки фотографий - Шаг 1 (селфи + кузов) */}
      <UploadPhoto
        config={baseConfigStep1}
        onPhotoUpload={handleUploadStep1}
        isOpen={showUploadPhotoStep1}
        onClose={() => setShowUploadPhotoStep1(false)}
        isLoading={isLoading}
        isCloseable={false}
        {...({
          photoBeforeSelfieUploaded: car.photo_before_selfie_uploaded,
          photoBeforeCarUploaded: car.photo_before_car_uploaded,
          photoBeforeInteriorUploaded: car.photo_before_interior_uploaded,
        } as any)}
      />

      {/* Модальное окно загрузки фотографий - Шаг 2 (салон) */}
      <UploadPhoto
        config={baseConfigStep2}
        onPhotoUpload={handleUploadStep2}
        isOpen={showUploadPhotoStep2}
        onClose={() => setShowUploadPhotoStep2(false)}
        isLoading={isLoading}
        isCloseable={false}
        {...({
          photoBeforeSelfieUploaded: car.photo_before_selfie_uploaded,
          photoBeforeCarUploaded: car.photo_before_car_uploaded,
          photoBeforeInteriorUploaded: car.photo_before_interior_uploaded,
        } as any)}
      />
    </div>
  );
};
