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
import { UserRole } from "@/shared/models/types/user";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import {
  userConfigStep1,
  userConfigStep2,
  ownerConfigStep1,
  ownerConfigStep2,
  usePhotoUpload,
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
  const { allVehicles, allMechanicVehicles, fetchAllVehicles, fetchAllMechanicVehicles } = useVehiclesStore();
  
  // Функция для обновления данных в зависимости от роли пользователя
  const refreshVehiclesData = async () => {
    if (user.role === UserRole.MECHANIC) {
      await fetchAllMechanicVehicles();
    } else {
      await fetchAllVehicles();
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  
  // Получаем данные машины из vehicles store (свежие данные из API)
  // Для механиков используем allMechanicVehicles, для обычных пользователей - allVehicles
  const vehiclesData = user.role === UserRole.MECHANIC ? allMechanicVehicles : allVehicles;
  const car = vehiclesData.find(v => v.current_renter_id === user.id) || user.current_rental!.car_details;
  const { setUploadRequired } = usePhotoUpload();
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
    // Сначала обновляем данные пользователя и машин для получения актуальных флагов
    await Promise.all([refreshUser(), refreshVehiclesData()]);
    
    // Получаем обновленные данные машины
    const updatedVehiclesData = user.role === UserRole.MECHANIC ? allMechanicVehicles : allVehicles;
    const updatedCar = updatedVehiclesData.find(v => v.current_renter_id === user.id) || user.current_rental!.car_details;
    
    // Проверяем, является ли пользователь владельцем автомобиля
    const isOwner = updatedCar.owner_id === user.id;
    
    // 🔍 DEBUG: Выводим все значения для диагностики
    console.log("--- DEBUG: User Car In Waiting - handleOpenCar clicked ---");
    console.log("updatedCar.owner_id:", updatedCar.owner_id);
    console.log("user.id:", user.id);
    console.log("isOwner:", isOwner);
    console.log("updatedCar.photo_before_selfie_uploaded:", updatedCar.photo_before_selfie_uploaded);
    console.log("updatedCar.photo_before_car_uploaded:", updatedCar.photo_before_car_uploaded);
    console.log("updatedCar.photo_before_interior_uploaded:", updatedCar.photo_before_interior_uploaded);
    
    // Проверяем статус загрузки фотографий по новым полям из API
    const hasSelfie = updatedCar.photo_before_selfie_uploaded || false;
    const hasCarPhotos = updatedCar.photo_before_car_uploaded || false;
    const hasInteriorPhotos = updatedCar.photo_before_interior_uploaded || false;
    
    console.log("🔍 DEBUG: hasSelfie:", hasSelfie, "hasCarPhotos:", hasCarPhotos, "hasInteriorPhotos:", hasInteriorPhotos);
    
    if (isOwner) {
      console.log("🔍 DEBUG: User is OWNER - checking photo requirements");
      // Для владельца автомобиля пропускаем селфи, но требуем фото кузова и салона
      if (!hasCarPhotos || !hasInteriorPhotos) {
        console.log("🔍 DEBUG: Owner - Need car or interior photos");
        if (!hasCarPhotos) {
          console.log("🔍 DEBUG: Owner - Showing Step 1 (car photos)");
          // Показываем первый модал для загрузки фото кузова
          setShowOwnerUploadPhoto(true);
        } else if (hasCarPhotos && !hasInteriorPhotos) {
          console.log("🔍 DEBUG: Owner - Showing Step 2 (interior photos)");
          // Показываем второй модал для загрузки фото салона
          setShowOwnerUploadPhotoStep2(true);
        }
      } else {
        console.log("🔍 DEBUG: Owner - All required photos uploaded, starting rental");
        // Все необходимые фото загружены (кузов + салон), открываем замки и разблокируем двигатель
        await handleOpenCarAndUnlock();
      }
    } else {
      console.log("🔍 DEBUG: User is REGULAR USER - checking all photo requirements");
      // Для обычных пользователей проверяем статус загрузки фотографий
      if (!hasSelfie || !hasCarPhotos) {
        console.log("🔍 DEBUG: Regular - Need selfie or car photos, showing Step 1");
        console.log("🔍 DEBUG: Setting showUploadPhoto to true");
        // Показываем первый модал для загрузки селфи и фото кузова
        setShowUploadPhoto(true);
        console.log("🔍 DEBUG: showUploadPhoto state set to:", true);
      } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
        console.log("🔍 DEBUG: Regular - Need interior photos, showing Step 2");
        console.log("🔍 DEBUG: Setting showUploadPhotoStep2 to true");
        // Показываем второй модал для загрузки фото салона
        setShowUploadPhotoStep2(true);
        console.log("🔍 DEBUG: showUploadPhotoStep2 state set to:", true);
      } else {
        console.log("🔍 DEBUG: Regular - All photos uploaded, starting rental");
        // Все фотографии загружены, открываем замки и разблокируем двигатель
        await handleOpenCarAndUnlock();
      }
    }
  }

  // Функция для начала аренды, открытия замков и разблокировки двигателя когда все фотографии загружены
  async function handleOpenCarAndUnlock() {
    setIsLoading(true);
    
    try {
      // Сначала начинаем аренду (меняем статус с RESERVED на IN_USE)
      await rentApi.startRent(car.id);
      
      // После успешного начала аренды открываем замки
      // await vehicleActionsApi.openVehicle();
      
      
      setIsLoading(false);
      
      // Обновляем данные пользователя и машин после успешного начала аренды
      await Promise.all([refreshUser(), refreshVehiclesData()]);
      
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
        await Promise.all([refreshUser(), refreshVehiclesData()]);
        
        // РАЗБЛОКИРУЕМ ЗАМКИ после загрузки селфи и фото кузова
        try {
          
          setResponseModal({
            isOpen: true,
            onClose: () => {
              setShowUploadPhotoStep2(true);
              setResponseModal(null);
            },
            type: "success",
            description: "Фотографии загружены! Замки автомобиля открыты. Теперь сфотографируйте салон.",
            buttonText: "Продолжить",
            onButtonClick: () => {
              setShowUploadPhotoStep2(true);
              setResponseModal(null);
            },
          });
        } catch (unlockError) {
          console.error("Ошибка при открытии замков:", unlockError);
          setResponseModal({
            isOpen: true,
            onClose: () => {
              setShowUploadPhotoStep2(true);
              setResponseModal(null);
            },
            type: "success",
            description: "Фотографии загружены! Теперь сфотографируйте салон.",
            buttonText: "Продолжить",
            onButtonClick: () => {
              setShowUploadPhotoStep2(true);
              setResponseModal(null);
            },
          });
        }
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
        await Promise.all([refreshUser(), refreshVehiclesData()]);
        
        // Фото салона загружены успешно
        setResponseModal({
          isOpen: true,
          onClose: async () => {
            setResponseModal(null);
          },
          type: "success",
          description: "Фотографии салона загружены!",
          buttonText: "Отлично",
          onButtonClick: async () => {
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
        await Promise.all([refreshUser(), refreshVehiclesData()]);
        
        // РАЗБЛОКИРУЕМ ЗАМКИ после загрузки фото кузова (для владельца)
        try {
          
          setResponseModal({
            isOpen: true,
            onClose: () => {
              setShowOwnerUploadPhotoStep2(true);
              setResponseModal(null);
            },
            type: "success",
            description: "Фотографии загружены! Замки автомобиля открыты. Теперь сфотографируйте салон.",
            buttonText: "Продолжить",
            onButtonClick: () => {
              setShowOwnerUploadPhotoStep2(true);
              setResponseModal(null);
            },
          });
        } catch (unlockError) {
          console.error("Ошибка при открытии замков:", unlockError);
          setResponseModal({
            isOpen: true,
            onClose: () => {
              setShowOwnerUploadPhotoStep2(true);
              setResponseModal(null);
            },
            type: "success",
            description: "Фотографии загружены! Теперь сфотографируйте салон.",
            buttonText: "Продолжить",
            onButtonClick: () => {
              setShowOwnerUploadPhotoStep2(true);
              setResponseModal(null);
            },
          });
        }
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
        await Promise.all([refreshUser(), refreshVehiclesData()]);
        
        // Фото салона загружены успешно (для владельца)
        setResponseModal({
          isOpen: true,
          onClose: async () => {
            setResponseModal(null);
          },
          type: "success",
          description: "Фотографии салона загружены!",
          buttonText: "Отлично",
          onButtonClick: async () => {
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
        {...({
          photoBeforeSelfieUploaded: car.photo_before_selfie_uploaded,
          photoBeforeCarUploaded: car.photo_before_car_uploaded,
          photoBeforeInteriorUploaded: car.photo_before_interior_uploaded,
        } as any)}
      />

      {/* User Upload Photo Step 2 */}
      <UploadPhoto
        config={userConfigStep2}
        onPhotoUpload={handlePhotoUploadStep2}
        isOpen={showUploadPhotoStep2}
        isLoading={isLoading}
        onClose={() => setShowUploadPhotoStep2(false)}
        isCloseable={true}
        {...({
          photoBeforeSelfieUploaded: car.photo_before_selfie_uploaded,
          photoBeforeCarUploaded: car.photo_before_car_uploaded,
          photoBeforeInteriorUploaded: car.photo_before_interior_uploaded,
        } as any)}
      />

      {/* Owner Upload Photo Step 1 */}
      <UploadPhoto
        config={ownerConfigStep1}
        onPhotoUpload={handleOwnerPhotoUpload}
        isOpen={showOwnerUploadPhoto}
        isLoading={isLoading}
        onClose={() => setShowOwnerUploadPhoto(false)}
        isCloseable={true}
        {...({
          photoBeforeSelfieUploaded: car.photo_before_selfie_uploaded,
          photoBeforeCarUploaded: car.photo_before_car_uploaded,
          photoBeforeInteriorUploaded: car.photo_before_interior_uploaded,
        } as any)}
      />

      {/* Owner Upload Photo Step 2 */}
      <UploadPhoto
        config={ownerConfigStep2}
        onPhotoUpload={handleOwnerPhotoUploadStep2}
        isOpen={showOwnerUploadPhotoStep2}
        isLoading={isLoading}
        onClose={() => setShowOwnerUploadPhotoStep2(false)}
        isCloseable={true}
        {...({
          photoBeforeSelfieUploaded: car.photo_before_selfie_uploaded,
          photoBeforeCarUploaded: car.photo_before_car_uploaded,
          photoBeforeInteriorUploaded: car.photo_before_interior_uploaded,
        } as any)}
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
              const isOwner = car.owner_id === user.id;
              const hasSelfie = car.photo_before_selfie_uploaded || false;
              const hasCarPhotos = car.photo_before_car_uploaded || false;
              const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
              
              if (isOwner) {
                // Логика для владельца
                if (!hasCarPhotos) {
                  return "Загрузить фото кузова";
                } else if (hasCarPhotos && !hasInteriorPhotos) {
                  return "Загрузить фото салона";
                } else {
                  return "Начать аренду";
                }
              } else {
                // Логика для обычных пользователей
                if (!hasSelfie || !hasCarPhotos) {
                  return "Загрузить селфи и фото кузова";
                } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
                  return "Загрузить фото салона";
                } else {
                  return "Начать аренду";
                }
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
