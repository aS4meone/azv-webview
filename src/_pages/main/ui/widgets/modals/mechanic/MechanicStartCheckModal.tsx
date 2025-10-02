"use client";
import { CarStatus, ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { useUserStore } from "@/shared/stores/userStore";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { openIn2GIS } from "@/shared/utils/urlUtils";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import { baseConfigStep1, baseConfigStep2 } from "@/shared/contexts/PhotoUploadContext";
import Loader from "@/shared/ui/loader";
import { ClientReviewSection } from "./ClientReviewSection";

interface MechanicStartCheckModalProps {
  car: ICar;
  onClose: () => void;
}

export const MechanicStartCheckModal = ({
  car,
  onClose,
}: MechanicStartCheckModalProps) => {
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const delivering = car.status === CarStatus.delivering;
  const tracking = car.status === CarStatus.inUse;
  const isService = car.status === CarStatus.service;
  const { fetchCurrentDeliveryVehicle } = useVehiclesStore();

  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const [showDataScreen, setShowDataScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadPhotoStep1, setShowUploadPhotoStep1] = useState(false);
  const [showUploadPhotoStep2, setShowUploadPhotoStep2] = useState(false);

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    try {
      await refreshUser();
      // Принудительно обновляем данные о доставке для механика
      await fetchCurrentDeliveryVehicle();
    } catch (error) {
      console.warn("Failed to refresh data on modal close:", error);
      // Continue with close even if refresh fails
    }
  };

  const handleStartInspection = async () => {
    try {
      const res = await mechanicApi.reserveCheckCar(car.id);
      if (res.status === 200) {
        setResponseModal({
          type: "success",
          isOpen: true,

          onButtonClick: handleClose,
          description: t("mechanic.inspection.acceptedInWork"),
          buttonText: t("mechanic.common.excellent"),
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

  const handleStartServiceInspection = async () => {
    // Проверяем, загружены ли уже фотографии
    const allPhotosUploaded = 
      car.photo_before_selfie_uploaded && 
      car.photo_before_car_uploaded && 
      car.photo_before_interior_uploaded;
    
    if (allPhotosUploaded) {
      // Если все фото загружены, можем начать осмотр
      try {
        const res = await mechanicApi.startCheckCar(car.id);
        if (res.status === 200) {
          setResponseModal({
            type: "success",
            isOpen: true,
            title: t("mechanic.inspection.successfullyStarted"),
            description: "Осмотр автомобиля начат успешно!",
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
    } else {
      // Если фото не загружены, сначала создаем аренду для механика
      try {
        const res = await mechanicApi.reserveCheckCar(car.id);
        if (res.status === 200) {
          // После создания аренды показываем нужный шаг загрузки
          // Определяем, какой шаг показать
          if (!car.photo_before_selfie_uploaded || !car.photo_before_car_uploaded) {
            // Нужно загрузить селфи + кузов
            setShowUploadPhotoStep1(true);
          } else if (car.photo_before_selfie_uploaded && car.photo_before_car_uploaded && !car.photo_before_interior_uploaded) {
            // Селфи + кузов уже загружены, нужно загрузить салон
            setShowUploadPhotoStep2(true);
          }
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
  };

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
        
        // Показываем сообщение об открытии замков и переходим ко второму шагу
        setResponseModal({
          isOpen: true,
          type: "success",
          description: "Фотографии загружены! Замки автомобиля открыты. Теперь сфотографируйте салон.",
          buttonText: "Продолжить",
          onClose: () => {
            setResponseModal(null);
            setShowUploadPhotoStep2(true);
          },
          onButtonClick: () => {
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
        
        // Теперь автоматически начинаем осмотр, так как все фото загружены
        try {
          const startRes = await mechanicApi.startCheckCar(car.id);
          if (startRes.status === 200) {
            setResponseModal({
              isOpen: true,
              type: "success",
              description: "Фотографии салона загружены! Двигатель разблокирован. Осмотр автомобиля начат успешно!",
              buttonText: "Отлично",
              onClose: () => {
                setResponseModal(null);
                handleClose();
              },
              onButtonClick: () => {
                setResponseModal(null);
                handleClose();
              },
            });
          }
        } catch (startError) {
          // Если не удалось начать осмотр, показываем ошибку
          showModal({
            type: "error",
            description: startError.response?.data?.detail || "Ошибка при начале осмотра",
            buttonText: t("modal.error.tryAgain"),
            onClose: () => {},
          });
        }
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

  const handleStartDelivery = async () => {
    try {
      const res = await mechanicApi.acceptDelivery(car.rental_id!);
      if (res.status === 200) {
        // Safely update delivery data with error handling
        try {
          await fetchCurrentDeliveryVehicle();
        } catch (error) {
          console.warn(
            "Failed to fetch current delivery vehicle after accepting delivery:",
            error
          );
          // Continue with success flow even if fetch fails
        }

        setResponseModal({
          type: "success",
          isOpen: true,
          onButtonClick: () => {
            handleClose();
          },
          description: t("mechanic.delivery.acceptedInWork"),
          buttonText: t("mechanic.common.excellent"),
          onClose: () => {
            handleClose();
          },
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

  const handleStartTracking = async () => {
    try {
      // Сохраняем ID машины в localStorage для слежки
      localStorage.setItem("tracking_car_id", car.id.toString());

      setResponseModal({
        type: "success",
        isOpen: true,

        onButtonClick: handleClose,
        description: t("mechanic.tracking.started"),
        buttonText: t("mechanic.common.excellent"),
        onClose: handleClose,
      });
    } catch (error) {
      console.log(error);
      setResponseModal({
        type: "error",
        isOpen: true,

        description: t("mechanic.tracking.startError"),
        buttonText: t("modal.error.tryAgain"),
        onButtonClick: handleClose,
        onClose: handleClose,
      });
    }
  };

  const handleViewData = () => {
    setShowDataScreen(true);
  };

  return (
    <>
      <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
        {/* Car Image Carousel */}

        <CustomResponseModal
          isOpen={responseModal?.isOpen || false}
          onClose={responseModal?.onClose || (() => { })}
          title={responseModal?.title || ""}
          description={responseModal?.description || ""}
          buttonText={responseModal?.buttonText || ""}
          onButtonClick={responseModal?.onButtonClick || (() => { })}
        />

        <CarImageCarousel car={car} rounded={true} />

        {/* Content */}
        <div className="p-6 pt-4 space-y-6">
          {/* Car Title and Plate */}
          <CarInfoHeader car={car} />

          {/* Car Specs */}
          <CarSpecs car={car} />

          {/* Client Review Section */}
          {car.last_client_review && (
            <ClientReviewSection 
              review={car.last_client_review} 
              car={car}
              currentMechanicId={car.current_renter_id}
            />
          )}

          {/* Action Buttons */}
          <div className="space-y-3 flex flex-col gap-3">
            {(car.status === CarStatus.pending || car.status === CarStatus.service) && (
              <Button variant="outline" onClick={handleViewData}>
                {t("mechanic.tracking.viewData")}
              </Button>
            )}

            {/* Кнопка для просмотра в 2GIS */}
            {car.delivery_coordinates && (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    openIn2GIS(
                      car.latitude,
                      car.longitude
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
                      car.delivery_coordinates!.latitude,
                      car.delivery_coordinates!.longitude
                    )
                  }
                  className="flex items-center justify-center gap-2"
                >
                  <FaMapMarkerAlt className="w-4 h-4" />
                  {t("mechanic.vehicle.deliveryPoint")}
                </Button>
              </>

            )}

            <Button
              variant="secondary"
              onClick={() => {
                if (car.status === CarStatus.pending) {
                  handleStartInspection();
                } else if (car.status === CarStatus.service) {
                  handleStartServiceInspection();
                } else if (car.status === CarStatus.delivering) {
                  handleStartDelivery();
                } else if (car.status === CarStatus.inUse) {
                  handleStartTracking();
                }
              }}
            >
              {delivering
                ? t("mechanic.delivery.startDelivery")
                : tracking
                  ? t("mechanic.tracking.startTracking")
                  : isService
                    ? t("mechanic.inspection.startInspection")
                    : t("mechanic.inspection.acceptInspection")}
            </Button>
          </div>
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
      />

      {/* Модальное окно загрузки фотографий - Шаг 2 (салон) */}
      <UploadPhoto
        config={baseConfigStep2}
        onPhotoUpload={handleUploadStep2}
        isOpen={showUploadPhotoStep2}
        onClose={() => setShowUploadPhotoStep2(false)}
        isLoading={isLoading}
        isCloseable={false}
      />
    </>
  );
};
