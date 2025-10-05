"use client";

import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CarInfoHeader, CarControlsSlider, CarImageCarousel } from "../ui";
import { FaMapMarkerAlt } from "react-icons/fa";

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
import { afterRentConfigStep1, afterRentConfigStep2 } from "@/shared/contexts/PhotoUploadContext";
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
  const { fetchCurrentDeliveryVehicle, forceClearCacheAndRefresh, currentDeliveryVehicle } =
    useVehiclesStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [actionType, setActionType] = useState<VehicleActionType | null>(null);
  const [showUploadPhotoStep1, setShowUploadPhotoStep1] = useState(false);
  const [showUploadPhotoStep2, setShowUploadPhotoStep2] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  // Используем currentDeliveryVehicle если доступен (содержит актуальные данные о фото), 
  // иначе используем user.current_rental.car_details или notRentedCar
  const car: ICar = (currentDeliveryVehicle && currentDeliveryVehicle.id > 0) 
    ? currentDeliveryVehicle 
    : (user.current_rental?.car_details || notRentedCar || ({} as ICar));

  // Обновляем данные о текущей доставке при открытии модального окна
  useEffect(() => {
    // Загружаем данные доставки только если машина в статусе доставки
    const isCarInDelivery = user?.current_rental?.car_details?.status === CarStatus.delivering;
    if (isCarInDelivery) {
      fetchCurrentDeliveryVehicle();
    }
  }, [fetchCurrentDeliveryVehicle, user?.current_rental?.car_details?.status]);

  // Временное логирование для отладки
  useEffect(() => {
    console.log("🔍 MechanicDeliveryInUseModal - currentDeliveryVehicle:", currentDeliveryVehicle);
    console.log("🔍 MechanicDeliveryInUseModal - user.current_rental:", user.current_rental);
    console.log("🔍 MechanicDeliveryInUseModal - car (used for display):", car);
    console.log("🔍 MechanicDeliveryInUseModal - car delivery_coordinates:", car?.delivery_coordinates);
    console.log("🔍 MechanicDeliveryInUseModal - AFTER delivery photos:", {
      photo_after_selfie_uploaded: car?.photo_after_selfie_uploaded,
      photo_after_car_uploaded: car?.photo_after_car_uploaded,
      photo_after_interior_uploaded: car?.photo_after_interior_uploaded
    });
  }, [currentDeliveryVehicle, user.current_rental, car]);


  // Проверка статуса загруженных фотографий ПОСЛЕ доставки при монтировании компонента
  useEffect(() => {
    if (isInitialCheckDone) return;

    // Используем данные из user.current_rental.car_details
    const carData = user.current_rental?.car_details || car;
    const hasSelfie = carData.photo_after_selfie_uploaded || false;
    const hasCarPhotos = carData.photo_after_car_uploaded || false;
    const hasInteriorPhotos = carData.photo_after_interior_uploaded || false;

    console.log("Checking AFTER delivery photo upload status:", {
      hasSelfie,
      hasCarPhotos,
      hasInteriorPhotos,
      carData: carData
    });

    // Всегда ждём действия пользователя - НЕ открываем модалы автоматически
    console.log("Photos status checked, waiting for user action...");
    setIsInitialCheckDone(true);
  }, [user.current_rental?.car_details?.photo_after_selfie_uploaded, user.current_rental?.car_details?.photo_after_car_uploaded, user.current_rental?.car_details?.photo_after_interior_uploaded, car.photo_after_selfie_uploaded, car.photo_after_car_uploaded, car.photo_after_interior_uploaded]);

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
      const res = await mechanicApi.uploadAfterDelivery(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhotoStep1(false);
        
        // Обновляем данные доставки чтобы получить актуальный статус фотографий
        try {
          await fetchCurrentDeliveryVehicle();
        } catch (err) {
          console.log("Failed to update delivery data:", err);
        }
        
        setResponseModal({
          type: "success",
          isOpen: true,
          title: "Фото загружены",
          description: "Селфи и фото салона загружены. Теперь сфотографируйте кузов.",
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
          error?.response?.data?.detail || t("mechanic.delivery.completionError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
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
      const res = await mechanicApi.uploadAfterDeliveryCar(formData);
      if (res.status === 200) {
        // Обновляем данные доставки чтобы получить актуальный статус фотографий
        try {
          await fetchCurrentDeliveryVehicle();
        } catch (err) {
          console.log("Failed to update delivery data:", err);
        }
        
        // Обновляем данные пользователя
        await refreshUser();
        
        setIsLoading(false);
        setShowUploadPhotoStep2(false);
        
        // Показываем успех - все фото загружены, можно завершать доставку
        setResponseModal({
          type: "success",
          isOpen: true,
          title: "Фото кузова загружены",
          description: "Все фотографии загружены. Теперь вы можете завершить доставку.",
          buttonText: "Продолжить",
          onButtonClick: () => {
            setResponseModal(null);
          },
          onClose: () => {
            setResponseModal(null);
          },
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при загрузке фото",
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  // Автоматическое завершение доставки когда все фото загружены
  const handleCompleteDeliveryAutomatically = async () => {
    try {
      setIsLoading(true);
      const completeRes = await mechanicApi.completeDelivery();
      if (completeRes.status === 200) {
        setIsLoading(false);

        // Обновляем данные после завершения доставки
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
          title: "Доставка завершена",
          description: "Все фото загружены. Доставка успешно завершена.",
          buttonText: "Отлично",
          onButtonClick: handleClose,
          onClose: handleClose,
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при завершении доставки",
        buttonText: t("modal.error.tryAgain"),
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
        config={afterRentConfigStep1}
        isLoading={isLoading}
        onPhotoUpload={handleUploadStep1}
        isOpen={showUploadPhotoStep1}
        withCloseButton
        onClose={() => setShowUploadPhotoStep1(false)}
      />

      <UploadPhoto
        config={afterRentConfigStep2}
        isLoading={isLoading}
        onPhotoUpload={handleUploadStep2}
        isOpen={showUploadPhotoStep2}
        withCloseButton
        onClose={() => setShowUploadPhotoStep2(false)}
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

        {/* Кнопка для навигации к точке доставки */}
        <Button
          variant="outline"
          onClick={() => {
            if (currentDeliveryVehicle?.delivery_coordinates) {
              openIn2GIS(
                currentDeliveryVehicle.delivery_coordinates.latitude,
                currentDeliveryVehicle.delivery_coordinates.longitude
              );
            } else {
              console.log("🔍 No delivery coordinates available in currentDeliveryVehicle");
            }
          }}
          className="flex items-center justify-center gap-2 w-full"
        >
          <FaMapMarkerAlt className="w-4 h-4" />
          {t("mechanic.vehicle.deliveryPoint")}
          {currentDeliveryVehicle?.delivery_coordinates ? "" : " (Нет данных)"}
        </Button>

        <Button 
          onClick={() => {
            const hasSelfie = car.photo_after_selfie_uploaded || false;
            const hasCarPhotos = car.photo_after_car_uploaded || false;
            const hasInteriorPhotos = car.photo_after_interior_uploaded || false;
            
            console.log("📸 Checking AFTER delivery photos:", {
              hasSelfie,
              hasCarPhotos,
              hasInteriorPhotos
            });
            
            if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
              // Все фото ПОСЛЕ доставки загружены - завершаем доставку
              console.log("✅ All AFTER photos uploaded, completing delivery");
              handleCompleteDeliveryAutomatically();
            } else if (hasSelfie && hasInteriorPhotos && !hasCarPhotos) {
              // Загружены селфи и салон ПОСЛЕ доставки - открываем окно для загрузки кузова
              console.log("📷 Opening step 2: upload car photos AFTER delivery");
              setShowUploadPhotoStep2(true);
            } else {
              // Не загружены селфи или салон ПОСЛЕ доставки - открываем окно для их загрузки
              console.log("📷 Opening step 1: upload selfie and interior photos AFTER delivery");
              setShowUploadPhotoStep1(true);
            }
          }} 
          variant="secondary"
        >
          {t("mechanic.delivery.completeDelivery")}
        </Button>
      </div>
    </div>
  );
};
