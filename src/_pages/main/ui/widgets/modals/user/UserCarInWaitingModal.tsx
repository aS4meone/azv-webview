import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import InfoIcon from "@/shared/icons/ui/InfoIcon";
import { IUser } from "@/shared/models/types/user";
import { WaitingTimer } from "../../timers/WaitingTimer";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import {
  userConfigStep1,
  userConfigStep2,
  OWNER_UPLOAD,
  ownerConfigStep1,
  ownerConfigStep2,
  usePhotoUpload,
  USER_UPLOAD,
} from "@/shared/contexts/PhotoUploadContext";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { useTranslations } from "next-intl";
import { vehicleActionsApi } from "@/shared/api/routes/vehicles";

interface UserCarInWaitingModalProps {
  user: IUser;
  onClose: () => void;
}

export const UserCarInWaitingModal = ({
  user,
  onClose,
}: UserCarInWaitingModalProps) => {
  const t = useTranslations();
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [showUploadPhotoStep2, setShowUploadPhotoStep2] = useState(false);
  const [showOwnerUploadPhoto, setShowOwnerUploadPhoto] = useState(false);
  const [showOwnerUploadPhotoStep2, setShowOwnerUploadPhotoStep2] = useState(false);
  const { refreshUser } = useUserStore();
  const { allVehicles, fetchAllVehicles } = useVehiclesStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Получаем данные машины из vehicles store (свежие данные из API)
  const car = allVehicles.find(v => v.current_renter_id === user.id) || user.current_rental!.car_details;
  const { setUploadRequired, isPhotoUploadCompleted } = usePhotoUpload();
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  // Проверяем состояние загрузки фотографий при инициализации
  useEffect(() => {
    // Используем новые поля из API для проверки статуса фотографий
    const hasSelfie = car.photo_before_selfie_uploaded || false;
    const hasCarPhotos = car.photo_before_car_uploaded || false;
    const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
    
    // Если все фотографии загружены, закрываем все модалы загрузки фотографий
    if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
      setShowUploadPhoto(false);
      setShowUploadPhotoStep2(false);
      setShowOwnerUploadPhoto(false);
      setShowOwnerUploadPhotoStep2(false);
    }
    // Модалы загрузки фотографий теперь открываются только по кнопке, а не автоматически
  }, [car.photo_before_selfie_uploaded, car.photo_before_car_uploaded, car.photo_before_interior_uploaded, car.owned_car]);

  const handleClose = async () => {
    await refreshUser();
    setResponseModal(null);
    onClose();
  };

  async function handleOpenCar() {
    // Проверяем, является ли пользователь владельцем автомобиля
    const isOwner = car.owner_id === user.id;
    
    // Проверяем статус загрузки фотографий по новым полям из API
    const hasSelfie = car.photo_before_selfie_uploaded || false;
    const hasCarPhotos = car.photo_before_car_uploaded || false;
    const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
    
    // Для владельца автомобиля пропускаем селфи - сразу даем доступ
    if (isOwner) {
      await handleOpenCarAndUnlock();
      return;
    }
    
    // Для обычных пользователей проверяем статус загрузки фотографий
    if (!hasSelfie || !hasCarPhotos) {
      // Показываем первый модал для загрузки селфи и фото кузова
      if (car.owned_car) {
        setShowOwnerUploadPhoto(true);
      } else {
        setShowUploadPhoto(true);
      }
    } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
      // Показываем второй модал для загрузки фото салона
      if (car.owned_car) {
        setShowOwnerUploadPhotoStep2(true);
      } else {
        setShowUploadPhotoStep2(true);
      }
    } else {
      // Все фотографии загружены, открываем замки и разблокируем двигатель
      await handleOpenCarAndUnlock();
    }
  }

  // Функция для начала аренды, открытия замков и разблокировки двигателя когда все фотографии загружены
  async function handleOpenCarAndUnlock() {
    setIsLoading(true);
    
    try {
      // Сначала начинаем аренду (меняем статус с RESERVED на IN_USE)
      await rentApi.startRent(car.id);
      
      // После успешного начала аренды открываем замки
      await vehicleActionsApi.openVehicle();
      
      // Разблокируем двигатель
      await vehicleActionsApi.unlockEngine();
      
      setIsLoading(false);
      
      // Обновляем данные пользователя и машин после успешного начала аренды
      await Promise.all([refreshUser(), fetchAllVehicles()]);
      
      setResponseModal({
        isOpen: true,
        onClose: async () => {
          setResponseModal(null);
        },
        type: "success",
        description: "Аренда начата! Замки автомобиля открыты! Двигатель разблокирован. Теперь вы можете пользоваться автомобилем.",
        buttonText: "Отлично",
        onButtonClick: async () => {
          setResponseModal(null);
          // Закрываем модал и переходим к использованию автомобиля
          onClose();
        },
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Ошибка начала аренды или открытия автомобиля:", error);
      setResponseModal({
        isOpen: true,
        onClose: () => setResponseModal(null),
        type: "error",
        description: "Ошибка начала аренды или открытия автомобиля. Попробуйте еще раз.",
        buttonText: "Попробовать снова",
        onButtonClick: () => setResponseModal(null),
      });
    }
  }

  async function handleRent() {
    // Проверяем статус загрузки фотографий по новым полям из API
    const hasSelfie = car.photo_before_selfie_uploaded || false;
    const hasCarPhotos = car.photo_before_car_uploaded || false;
    const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
    
    // Определяем, какие фотографии не загружены
    const missingPhotos: string[] = [];
    if (!hasSelfie) missingPhotos.push("селфи");
    if (!hasCarPhotos) missingPhotos.push("фото кузова");
    if (!hasInteriorPhotos) missingPhotos.push("фото салона");
    
    if (missingPhotos.length > 0) {
      // Если фотографии не загружены, показываем модал загрузки
      setResponseModal({
        isOpen: true,
        onClose: () => setResponseModal(null),
        type: "error",
        title: "Требуется загрузка фотографий",
        description: `Для начала аренды необходимо загрузить: ${missingPhotos.join(", ")}. Это обязательно для фиксации состояния автомобиля.`,
        buttonText: "Загрузить фотографии",
        onButtonClick: () => {
          setResponseModal(null);
          if (car.owned_car) {
            setShowOwnerUploadPhoto(true);
          } else {
            setShowUploadPhoto(true);
          }
        },
      });
      return;
    }

    try {
      const res = await rentApi.startRent(car.id);
      if (res.status === 200) {
        handleClose();
      }
    } catch (error) {
      setResponseModal({
        isOpen: true,
        onClose: handleClose,
        type: "error",
        title: t("error"),
        description: error.response.data.detail,
        buttonText: t("widgets.modals.user.carInWaiting.tryAgain"),
        onButtonClick: handleClose,
      });
    }
  }

  const handleCancelRental = async () => {
    try {
      const res = await rentApi.cancelReservation();
      if (res.status === 200) {
        setResponseModal({
          isOpen: true,
          onClose: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
          type: "success",
          description: t("widgets.modals.user.carInWaiting.rentalCancelledSuccessfully"),
          buttonText: t("widgets.modals.user.carInWaiting.tryAgain"),
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
        onClose: async () => {
          await refreshUser();
          onClose();
          setResponseModal(null);
        },
        type: "error",
        title: t("error"),
        description: error.response.data.detail,
        buttonText: t("widgets.modals.user.carInWaiting.tryAgain"),
        onButtonClick: async () => {
          await refreshUser();
          onClose();
          setResponseModal(null);
        },
      });
    }
  };

  const handlePhotoUpload = async (files: { [key: string]: File[] }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    try {
      const res = await rentApi.uploadBeforeRent(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhoto(false);
        
        // Обновляем данные пользователя и машин после успешной загрузки фотографий
        await Promise.all([refreshUser(), fetchAllVehicles()]);
        
        setResponseModal({
          isOpen: true,
          onClose: () => {
            setShowUploadPhotoStep2(true);
            setResponseModal(null);
          },
          type: "success",
          description: "Фотографии успешно загружены! Теперь сфотографируйте салон.",
          buttonText: "Продолжить",
          onButtonClick: () => {
            setShowUploadPhotoStep2(true);
            setResponseModal(null);
          },
        });
      }
    } catch (error) {
      setIsLoading(false);
      setResponseModal({
        isOpen: true,
        onClose: () => setResponseModal(null),
        type: "error",
        description: "Ошибка загрузки фотографий",
        buttonText: "Попробовать снова",
        onButtonClick: () => setResponseModal(null),
      });
    }
  };

  const handlePhotoUploadStep2 = async (files: { [key: string]: File[] }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    try {
      const res = await rentApi.uploadBeforeRentInterior(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhotoStep2(false);
        
        // Обновляем данные пользователя и машин после успешной загрузки фотографий салона
        await Promise.all([refreshUser(), fetchAllVehicles()]);
        
        setResponseModal({
          isOpen: true,
          onClose: async () => {
            setResponseModal(null);
          },
          type: "success",
          description: "Фотографии салона успешно загружены! Теперь вы можете открыть автомобиль и начать аренду.",
          buttonText: "Открыть автомобиль",
          onButtonClick: async () => {
            setResponseModal(null);
            await handleOpenCarAndUnlock();
          },
        });
      }
    } catch (error) {
      setIsLoading(false);
      setResponseModal({
        isOpen: true,
        onClose: () => setResponseModal(null),
        type: "error",
        description: "Ошибка загрузки фотографий",
        buttonText: "Попробовать снова",
        onButtonClick: () => setResponseModal(null),
      });
    }
  };

  const handleOwnerPhotoUpload = async (files: { [key: string]: File[] }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    try {
      const res = await rentApi.uploadOwnerBeforeRent(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowOwnerUploadPhoto(false);
        
        // Обновляем данные пользователя и машин после успешной загрузки фотографий
        await Promise.all([refreshUser(), fetchAllVehicles()]);
        
        setResponseModal({
          isOpen: true,
          onClose: () => {
            setShowOwnerUploadPhotoStep2(true);
            setResponseModal(null);
          },
          type: "success",
          description: "Фотографии успешно загружены! Теперь сфотографируйте салон.",
          buttonText: "Продолжить",
          onButtonClick: () => {
            setShowOwnerUploadPhotoStep2(true);
            setResponseModal(null);
          },
        });
      }
    } catch (error) {
      setIsLoading(false);
      setResponseModal({
        isOpen: true,
        onClose: () => setResponseModal(null),
        type: "error",
        description: "Ошибка загрузки фотографий",
        buttonText: "Попробовать снова",
        onButtonClick: () => setResponseModal(null),
      });
    }
  };

  const handleOwnerPhotoUploadStep2 = async (files: { [key: string]: File[] }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    try {
      const res = await rentApi.uploadOwnerBeforeRentInterior(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowOwnerUploadPhotoStep2(false);
        
        // Обновляем данные пользователя и машин после успешной загрузки фотографий салона
        await Promise.all([refreshUser(), fetchAllVehicles()]);
        
        setResponseModal({
          isOpen: true,
          onClose: async () => {
            setResponseModal(null);
          },
          type: "success",
          description: "Фотографии салона успешно загружены! Теперь вы можете открыть автомобиль и начать аренду.",
          buttonText: "Открыть автомобиль",
          onButtonClick: async () => {
            setResponseModal(null);
            await handleOpenCarAndUnlock();
          },
        });
      }
    } catch (error) {
      setIsLoading(false);
      setResponseModal({
        isOpen: true,
        onClose: () => setResponseModal(null),
        type: "error",
        description: "Ошибка загрузки фотографий",
        buttonText: "Попробовать снова",
        onButtonClick: () => setResponseModal(null),
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <CustomResponseModal
        onButtonClick={responseModal?.onButtonClick || handleClose}
        isOpen={!!responseModal}
        onClose={handleClose}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
      />
      {/* User Upload Photo Step 1 */}
      <UploadPhoto
        config={userConfigStep1}
        onPhotoUpload={handlePhotoUpload}
        isOpen={showUploadPhoto}
        isLoading={isLoading}
        onClose={() => setShowUploadPhoto(false)}
        isCloseable={true}
      />

      {/* User Upload Photo Step 2 */}
      <UploadPhoto
        config={userConfigStep2}
        onPhotoUpload={handlePhotoUploadStep2}
        isOpen={showUploadPhotoStep2}
        isLoading={isLoading}
        onClose={() => setShowUploadPhotoStep2(false)}
        isCloseable={true}
      />

      {/* Owner Upload Photo Step 1 */}
      <UploadPhoto
        config={ownerConfigStep1}
        onPhotoUpload={handleOwnerPhotoUpload}
        isOpen={showOwnerUploadPhoto}
        isLoading={isLoading}
        onClose={() => setShowOwnerUploadPhoto(false)}
        isCloseable={true}
      />

      {/* Owner Upload Photo Step 2 */}
      <UploadPhoto
        config={ownerConfigStep2}
        onPhotoUpload={handleOwnerPhotoUploadStep2}
        isOpen={showOwnerUploadPhotoStep2}
        isLoading={isLoading}
        onClose={() => setShowOwnerUploadPhotoStep2(false)}
        isCloseable={true}
      />

      {/* Таймер ожидания */}
      <div className="absolute -top-16 right-4 left-4 z-10">
        <WaitingTimer user={user} />
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
            {t("widgets.modals.carInWaiting.inspectCar")}
          </h4>
          <h4 className="text-[18px] text-[#191919]">
            {t("widgets.modals.carInWaiting.inspectCarDescription")}
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="outline" onClick={handleCancelRental}>
            {t("widgets.modals.carInWaiting.cancelRental")}
          </Button>
          <Button onClick={handleOpenCar} variant="secondary">
            {(() => {
              const hasSelfie = car.photo_before_selfie_uploaded || false;
              const hasCarPhotos = car.photo_before_car_uploaded || false;
              const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
              
              if (!hasSelfie || !hasCarPhotos) {
                return "Загрузить фото и открыть авто";
              } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
                return "Загрузить фото салона";
              } else {
                return "Открыть авто и разблокировать двигатель";
              }
            })()}
          </Button>
        </div>

        <div className=" flex flex-row gap-2">
          <InfoIcon />
          <p className="text-[14px] text-[#191919]">
            {t("widgets.modals.carInWaiting.openCarConfirms")}
          </p>
        </div>
      </div>
    </div>
  );
};
