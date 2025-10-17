"use client";

import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { IUser } from "@/shared/models/types/user";
import { CarStatus } from "@/shared/models/types/car";
import { useUserStore } from "@/shared/stores/userStore";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import {
  baseConfigStep1,
  baseConfigStep2,
  usePhotoUpload,
} from "@/shared/contexts/PhotoUploadContext";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { MechanicWaitingTimer } from "../../timers/MechanicTimer";
import { ICar } from "@/shared/models/types/car";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { openIn2GIS } from "@/shared/utils/urlUtils";

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
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { setUploadRequired } = usePhotoUpload();
  const { fetchCurrentDeliveryVehicle, forceRefreshMechanicData, currentDeliveryVehicle } =
    useVehiclesStore();
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  // Используем данные из user.current_rental.car_details если доставка принята, иначе fallback на notHaveCar
  const car = user.current_rental?.car_details || notHaveCar;

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
    console.log("🔍 MechaniCarInWaitingDeliverModal - notHaveCar:", notHaveCar);
    console.log("🔍 MechaniCarInWaitingDeliverModal - currentDeliveryVehicle:", currentDeliveryVehicle);
    console.log("🔍 MechaniCarInWaitingDeliverModal - car (used for display):", car);
    console.log("🔍 MechaniCarInWaitingDeliverModal - car photos:", car?.photos);
    console.log("🔍 MechaniCarInWaitingDeliverModal - delivery_coordinates:", car?.delivery_coordinates);
    console.log("🔍 MechaniCarInWaitingDeliverModal - has delivery_coordinates:", !!car?.delivery_coordinates);
  }, [notHaveCar, currentDeliveryVehicle, car]);


  // Проверка статуса загруженных фотографий при монтировании компонента
  useEffect(() => {
    if (isInitialCheckDone) return;

    // Используем данные из user.current_rental.car_details если доставка принята
    const carData = user.current_rental?.car_details || car;
    const hasSelfie = carData.photo_before_selfie_uploaded || false;
    const hasCarPhotos = carData.photo_before_car_uploaded || false;
    const hasInteriorPhotos = carData.photo_before_interior_uploaded || false;

    console.log("Checking photo upload status:", {
      hasSelfie,
      hasCarPhotos,
      hasInteriorPhotos,
      carData: carData
    });

    // Всегда ждём действия пользователя - НЕ запускаем доставку автоматически
    console.log("Photos status checked, waiting for user action...");
    setIsInitialCheckDone(true);
  }, [user.current_rental?.car_details?.photo_before_selfie_uploaded, user.current_rental?.car_details?.photo_before_car_uploaded, user.current_rental?.car_details?.photo_before_interior_uploaded, car.photo_before_selfie_uploaded, car.photo_before_car_uploaded, car.photo_before_interior_uploaded]);

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

  async function handleAcceptDelivery() {
    try {
      console.log("Accepting delivery...");
      
      // Получаем rental_id из notHaveCar (данные машины до принятия доставки)
      const rentalId = notHaveCar.rental_id || car.rental_id;
      if (!rentalId) {
        throw new Error("Rental ID not found");
      }
      
      // Принимаем доставку
      const res = await mechanicApi.acceptDelivery(rentalId);
      if (res.status === 200) {
        // Обновляем данные пользователя
        await refreshUser();
        await fetchCurrentDeliveryVehicle();
        
        // Закрываем модальное окно после успешного принятия доставки
        console.log("✅ Delivery accepted successfully, closing modal");
        handleClose();
      }
    } catch (error) {
      console.error("Error in handleAcceptDelivery:", error);
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при принятии доставки",
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  }

  async function handleStartDelivery() {
    try {
      console.log("Starting delivery process...");
      
      // Проверяем, что все фотографии загружены
      const carData = user.current_rental?.car_details || car;
      const hasSelfie = carData.photo_before_selfie_uploaded || false;
      const hasCarPhotos = carData.photo_before_car_uploaded || false;
      const hasInteriorPhotos = carData.photo_before_interior_uploaded || false;
      
      if (!hasSelfie || !hasCarPhotos || !hasInteriorPhotos) {
        showModal({
          type: "error",
          description: "Необходимо загрузить все фотографии перед началом доставки",
          buttonText: t("modal.error.tryAgain"),
          onClose: () => {},
        });
        return;
      }
      
      // Запускаем доставку (меняем статус на DELIVERING_IN_PROGRESS)
      const res = await mechanicApi.startDeliveryCar();
      if (res.status === 200) {
        // Если успешно - закрываем модал
        handleClose();
      }
    } catch (error) {
      console.error("Error in handleStartDelivery:", error);
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при запуске доставки",
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  }

  const handleStartPhotoUpload = async () => {
    try {
      console.log("Starting photo upload process...");
      
      // Закрываем все модальные окна и показываем первый этап загрузки фото
      setResponseModal(null);
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
        
        // Обновляем данные доставки чтобы получить актуальный статус фотографий
        try {
          await fetchCurrentDeliveryVehicle();
          await refreshUser();
        } catch (err) {
          console.log("Failed to update delivery data:", err);
        }
        
        // Автоматически переходим к загрузке фото салона
        setShowUploadPhotoStep2(true);
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
        setIsLoading(false);
        setShowUploadPhotoStep2(false);
        
        // Обновляем данные доставки чтобы получить актуальный статус фотографий
        try {
          await fetchCurrentDeliveryVehicle();
        } catch (err) {
          console.log("Failed to update delivery data:", err);
        }
        
        // Обновляем данные пользователя
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
          error.response?.data?.detail || t("mechanic.delivery.photoUploadError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
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


        {/* Проверяем статус доставки */}
        {user.current_rental ? (
          // Если доставка принята - показываем кнопки для фотографий и точку доставки
          <>
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
              <Button 
                onClick={() => {
                  // Используем данные из user.current_rental.car_details если доставка принята
                  const carData = user.current_rental?.car_details || car;
                  const hasSelfie = carData.photo_before_selfie_uploaded || false;
                  const hasCarPhotos = carData.photo_before_car_uploaded || false;
                  const hasInteriorPhotos = carData.photo_before_interior_uploaded || false;
                  
                  if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
                    // Все фото загружены - запускаем доставку
                    handleStartDelivery();
                  } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
                    // Загружены селфи и кузов - открываем окно для загрузки салона
                    setShowUploadPhotoStep2(true);
                  } else {
                    // Не загружены селфи или кузов - открываем окно для их загрузки
                    handleStartPhotoUpload();
                  }
                }} 
                variant="secondary"
              >
                {(() => {
                  // Используем данные из user.current_rental.car_details если доставка принята
                  const carData = user.current_rental?.car_details || car;
                  const hasSelfie = carData.photo_before_selfie_uploaded || false;
                  const hasCarPhotos = carData.photo_before_car_uploaded || false;
                  const hasInteriorPhotos = carData.photo_before_interior_uploaded || false;
                  
                  if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
                    return "Начать доставку";
                  } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
                    return "Загрузить фото салона";
                  } else {
                    return "Загрузить фото кузова и селфи";
                  }
                })()}
              </Button>

              {/* Кнопка для навигации к точке доставки */}
              <Button
                variant="outline"
                onClick={() => {
                  // Используем данные из user.current_rental.car_details если доставка принята
                  const carData = user.current_rental?.car_details || car;
                  if (carData.delivery_coordinates) {
                    openIn2GIS(
                      carData.delivery_coordinates.latitude,
                      carData.delivery_coordinates.longitude
                    );
                  } else {
                    console.log("🔍 No delivery coordinates available");
                  }
                }}
                className="flex items-center justify-center gap-2 w-full"
              >
                <FaMapMarkerAlt className="w-4 h-4" />
                {t("mechanic.vehicle.deliveryPoint")}
                {(user.current_rental?.car_details?.delivery_coordinates || car.delivery_coordinates) ? " ✓" : " (Нет данных)"}
              </Button>
            </div>
          </>
        ) : (
          // Если доставка НЕ принята - показываем только кнопку принятия доставки
          <>
            <div>
              <h4 className="text-[20px] font-semibold text-[#191919]">
                Принять доставку
              </h4>
              <h4 className="text-[18px] text-[#191919]">
                Сначала примите доставку автомобиля, затем загрузите фотографии и начните доставку.
              </h4>
            </div>

            {/* Кнопка принятия доставки */}
            <div className="space-y-3">
              <Button 
                onClick={handleAcceptDelivery}
                variant="secondary"
              >
                Принять доставку
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Модальные окна */}
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
        withCloseButton
        onClose={() => setShowUploadPhotoStep1(false)}
      />
      
      <UploadPhoto
        config={baseConfigStep2}
        onPhotoUpload={handleUploadStep2}
        isLoading={isLoading}
        isOpen={showUploadPhotoStep2}
        withCloseButton
        onClose={() => setShowUploadPhotoStep2(false)}
      />
    </div>
  );
};
