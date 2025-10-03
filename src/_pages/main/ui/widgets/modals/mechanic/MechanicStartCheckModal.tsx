"use client";
import { CarStatus, ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { useUserStore } from "@/shared/stores/userStore";
import { mechanicActionsApi, mechanicApi } from "@/shared/api/routes/mechanic";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { openIn2GIS } from "@/shared/utils/urlUtils";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import { baseConfigStep1, baseConfigStep2 } from "@/shared/contexts/PhotoUploadContext";
import Loader from "@/shared/ui/loader";

interface MechanicStartCheckModalProps {
  car: ICar;
  onClose: () => void;
}

export const MechanicStartCheckModal = ({
  car: initialCar,
  onClose,
}: MechanicStartCheckModalProps) => {
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const { user, refreshUser } = useUserStore();
  const { allMechanicVehicles, fetchCurrentDeliveryVehicle, fetchAllMechanicVehicles } = useVehiclesStore();
  
  // Получаем актуальные данные о машине из user.current_rental.car_details (из /auth/user/me)
  // Это важно для получения правильных флагов photo_before_*_uploaded
  const car = user?.current_rental?.car_details || allMechanicVehicles?.find(v => v.id === initialCar.id) || initialCar;
  
  const delivering = car.status === CarStatus.delivering;
  const tracking = car.status === CarStatus.inUse;
  const isService = car.status === CarStatus.service;
  
  // Получаем ID текущего механика из user store
  const currentMechanicId = user?.id;
  
  // Проверяем, осматривает ли текущий механик эту машину
  const isMechanicInspecting = car?.status === "IN_USE" && 
    car?.current_renter_details?.id === currentMechanicId;
    
  // 🔍 DEBUG: Отслеживаем источник данных и условия для управления автомобилем
  console.log("🔍 DEBUG: MechanicStartCheckModal - Data Source");
  console.log("user?.current_rental?.car_details:", user?.current_rental?.car_details);
  console.log("allMechanicVehicles:", allMechanicVehicles);
  console.log("car from user.current_rental:", user?.current_rental?.car_details);
  console.log("car from allMechanicVehicles:", allMechanicVehicles?.find(v => v.id === initialCar.id));
  console.log("final car object:", car);
  console.log("---");
  
  console.log("🔍 DEBUG: MechanicStartCheckModal - Car Management Conditions");
  console.log("car?.status:", car?.status);
  console.log("car?.current_renter_details?.id:", car?.current_renter_details?.id);
  console.log("currentMechanicId:", currentMechanicId);
  console.log("car?.status === 'IN_USE':", car?.status === "IN_USE");
  console.log("car?.current_renter_details?.id === currentMechanicId:", car?.current_renter_details?.id === currentMechanicId);
  console.log("isMechanicInspecting:", isMechanicInspecting);
  console.log("---");

  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const [showDataScreen, setShowDataScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadPhotoStep1, setShowUploadPhotoStep1] = useState(false);
  const [showUploadPhotoStep2, setShowUploadPhotoStep2] = useState(false);

  // Проверяем состояние загрузки фотографий при инициализации
  useEffect(() => {
    // Проверяем статус загрузки фотографий по новым полям из API
    const hasSelfie = car.photo_before_selfie_uploaded || false;
    const hasCarPhotos = car.photo_before_car_uploaded || false;
    const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
    
    console.log("🔍 DEBUG: MechanicStartCheckModal - Photo status check on init");
    console.log("car.photo_before_selfie_uploaded:", car.photo_before_selfie_uploaded);
    console.log("car.photo_before_car_uploaded:", car.photo_before_car_uploaded);
    console.log("car.photo_before_interior_uploaded:", car.photo_before_interior_uploaded);
    console.log("hasSelfie:", hasSelfie, "hasCarPhotos:", hasCarPhotos, "hasInteriorPhotos:", hasInteriorPhotos);
    console.log("isMechanicInspecting:", isMechanicInspecting);
    console.log("car.status:", car.status);
    
    // Если механик уже осматривает машину (статус IN_USE), не показываем модалы загрузки фотографий
    if (isMechanicInspecting) {
      console.log("🔍 DEBUG: Mechanic is already inspecting, closing all photo upload modals");
      setShowUploadPhotoStep1(false);
      setShowUploadPhotoStep2(false);
      return;
    }
    
    // Если статус машины PENDING, не показываем модалы загрузки фотографий автоматически
    // Они будут показаны только при нажатии кнопки "Начать осмотр"
    if (car.status === CarStatus.pending) {
      console.log("🔍 DEBUG: Car status is PENDING, not showing photo upload modals automatically");
      setShowUploadPhotoStep1(false);
      setShowUploadPhotoStep2(false);
      return;
    }
    
    // Если все фотографии загружены, закрываем все модалы загрузки фотографий
    if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
      console.log("🔍 DEBUG: All photos uploaded, closing photo upload modals");
      setShowUploadPhotoStep1(false);
      setShowUploadPhotoStep2(false);
    }
    // Если загружены селфи и фото кузова, но не загружены фото салона - показываем второй модал
    else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
      console.log("🔍 DEBUG: Selfie and car photos uploaded, showing Step 2 modal");
      setShowUploadPhotoStep2(true);
    }
    // Если не загружены селфи или фото кузова - показываем первый модал
    else if (!hasSelfie || !hasCarPhotos) {
      console.log("🔍 DEBUG: Need selfie or car photos, showing Step 1 modal");
      setShowUploadPhotoStep1(true);
    }
  }, [car.photo_before_selfie_uploaded, car.photo_before_car_uploaded, car.photo_before_interior_uploaded, isMechanicInspecting, car.status]);

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    try {
      await refreshUser();
      // Принудительно обновляем данные о доставке для механика
      await fetchCurrentDeliveryVehicle();
      // Обновляем данные о всех машинах для корректного отображения статусов
      await fetchAllMechanicVehicles();
    } catch (error) {
      console.warn("Failed to refresh data on modal close:", error);
      // Continue with close even if refresh fails
    }
  };

  const handleStartInspection = async () => {
    try {
      const res = await mechanicApi.reserveCheckCar(car.id);
      if (res.status === 200) {
        // 🔍 DEBUG: Выводим информацию о принятии машины на осмотр
        console.log("--- DEBUG: Mechanic accepted car for inspection ---");
        console.log("Car ID:", car.id, "Response status:", res.status);
        
        // Обновляем данные пользователя и машины сразу после успешного принятия на осмотр
        await Promise.all([refreshUser(), fetchAllMechanicVehicles()]);
        console.log("🔍 DEBUG: Data refreshed after accepting car for inspection");
        
        // Проверяем статус фотографий после обновления данных
        const updatedCar = user?.current_rental?.car_details || allMechanicVehicles?.find(v => v.id === car.id) || car;
        const hasSelfie = updatedCar?.photo_before_selfie_uploaded || false;
        const hasCarPhotos = updatedCar?.photo_before_car_uploaded || false;
        const hasInteriorPhotos = updatedCar?.photo_before_interior_uploaded || false;
        
        console.log("🔍 DEBUG: Photo status after data refresh:");
        console.log("hasSelfie:", hasSelfie, "hasCarPhotos:", hasCarPhotos, "hasInteriorPhotos:", hasInteriorPhotos);
        
        if (!hasSelfie || !hasCarPhotos) {
          // Нужно загрузить селфи + кузов
          setResponseModal({
            type: "success",
            isOpen: true,
            title: "Загрузка фотографий",
            description: "Машина принята на осмотр. Сначала загрузите селфи с автомобилем и фото кузова.",
            buttonText: "Загрузить фотографии",
            onButtonClick: () => {
              setResponseModal(null);
              setShowUploadPhotoStep1(true);
            },
            onClose: () => {
              setResponseModal(null);
              setShowUploadPhotoStep1(true);
            },
          });
        } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
          // Селфи + кузов уже загружены, нужно загрузить салон
          setResponseModal({
            type: "success",
            isOpen: true,
            title: "Загрузка фотографий салона",
            description: "Машина принята на осмотр. Отлично! Фотографии селфи и кузова загружены. Теперь загрузите фотографии салона автомобиля.",
            buttonText: "Загрузить фото салона",
            onButtonClick: () => {
              setResponseModal(null);
              setShowUploadPhotoStep2(true);
            },
            onClose: () => {
              setResponseModal(null);
              setShowUploadPhotoStep2(true);
            },
          });
        } else if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
          // Все фотографии загружены, можем начать осмотр
          setResponseModal({
            type: "success",
            isOpen: true,
            title: t("mechanic.inspection.acceptedInWork"),
            description: "Машина принята на осмотр. Все фотографии загружены. Осмотр можно начать.",
            buttonText: "Начать осмотр",
            onButtonClick: () => {
              setResponseModal(null);
              // Начинаем осмотр сразу
              handleStartServiceInspection();
            },
            onClose: () => {
              setResponseModal(null);
              handleStartServiceInspection();
            },
          });
        } else {
          // Fallback - показываем первый шаг
          setResponseModal({
            type: "success",
            isOpen: true,
            title: "Загрузка фотографий",
            description: "Машина принята на осмотр. Теперь загрузите фотографии для начала осмотра.",
            buttonText: "Загрузить фотографии",
            onButtonClick: () => {
              setResponseModal(null);
              setShowUploadPhotoStep1(true);
            },
            onClose: () => {
              setResponseModal(null);
              setShowUploadPhotoStep1(true);
            },
          });
        }
      }
    } catch (error) {
      console.error("Error accepting car for inspection:", error);
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при принятии машины на осмотр",
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
      });
    }
  };


  const handleStartServiceInspection = async () => {
    console.log("🔍 DEBUG: handleStartServiceInspection called");
    console.log("isMechanicInspecting:", isMechanicInspecting);
    console.log("🔍 DEBUG: Photo status in handleStartServiceInspection:");
    console.log("car.photo_before_selfie_uploaded:", car.photo_before_selfie_uploaded);
    console.log("car.photo_before_car_uploaded:", car.photo_before_car_uploaded);
    console.log("car.photo_before_interior_uploaded:", car.photo_before_interior_uploaded);
    
    // Если механик уже осматривает машину, закрываем модал
    if (isMechanicInspecting) {
      console.log("🔍 DEBUG: Mechanic is already inspecting, closing modal");
      handleClose();
      return;
    }
    
    // Проверяем статус загрузки фотографий из auth/user/me
    const hasSelfie = car.photo_before_selfie_uploaded || false;
    const hasCarPhotos = car.photo_before_car_uploaded || false;
    const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
    
    console.log("🔍 DEBUG: Photo status check:");
    console.log("hasSelfie:", hasSelfie, "hasCarPhotos:", hasCarPhotos, "hasInteriorPhotos:", hasInteriorPhotos);
    
    // Если селфи или фото кузова не загружены - показываем модал для их загрузки
    if (!hasSelfie || !hasCarPhotos) {
      console.log("🔍 DEBUG: Need to upload selfie or car photos, opening Step 1 modal");
      setShowUploadPhotoStep1(true);
      return;
    }
    
    // Если селфи и фото кузова загружены, но фото салона не загружено - показываем модал для загрузки салона
    if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
      console.log("🔍 DEBUG: Need to upload interior photos, opening Step 2 modal");
      setShowUploadPhotoStep2(true);
      return;
    }
    
    // Если все фото загружены, отправляем запрос на начало осмотра
    if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
      console.log("🔍 DEBUG: All photos uploaded, starting inspection");
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
        
        // Обновляем данные пользователя и машины чтобы получить обновленные флаги
        await Promise.all([refreshUser(), fetchAllMechanicVehicles()]);
        
        // 🔍 DEBUG: После обновления данных после загрузки фото (Step 1)
        console.log("🔍 DEBUG: MechanicStartCheckModal - After Step 1 photo upload and data refresh");
        console.log("Car status after refresh:", car.status);
        console.log("Car current_renter_details after refresh:", car.current_renter_details);
        
        // РАЗБЛОКИРУЕМ ЗАМКИ после загрузки селфи и фото кузова
        try {
          await mechanicActionsApi.openVehicle();
          
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
        } catch (unlockError) {
          console.error("Ошибка при открытии замков:", unlockError);
          setResponseModal({
            isOpen: true,
            type: "success",
            description: "Фотографии загружены! Теперь сфотографируйте салон.",
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
        
        // Обновляем данные пользователя и машины чтобы получить обновленные флаги
        await Promise.all([refreshUser(), fetchAllMechanicVehicles()]);
        
        // 🔍 DEBUG: После обновления данных после загрузки фото (Step 2)
        console.log("🔍 DEBUG: MechanicStartCheckModal - After Step 2 photo upload and data refresh");
        console.log("Car status after refresh:", car.status);
        console.log("Car current_renter_details after refresh:", car.current_renter_details);
        
        // РАЗБЛОКИРУЕМ ДВИГАТЕЛЬ после загрузки фото салона
        try {
          await mechanicActionsApi.unlockEngine();
          
          // Теперь автоматически начинаем осмотр, так как все фото загружены
          const startRes = await mechanicApi.startCheckCar(car.id);
          if (startRes.status === 200) {
            // Дополнительно обновляем данные после начала осмотра
            await Promise.all([refreshUser(), fetchAllMechanicVehicles()]);
            
            // 🔍 DEBUG: После начала осмотра и обновления данных
            console.log("🔍 DEBUG: MechanicStartCheckModal - After starting inspection and data refresh");
            console.log("Car status after inspection start:", car.status);
            console.log("Car current_renter_details after inspection start:", car.current_renter_details);
            console.log("isMechanicInspecting after inspection start:", isMechanicInspecting);
            console.log("Should now show car management controls!");
            
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
        } catch (unlockError) {
          console.error("Ошибка при разблокировке двигателя:", unlockError);
          // Если не удалось разблокировать двигатель, все равно начинаем осмотр
          try {
            const startRes = await mechanicApi.startCheckCar(car.id);
            if (startRes.status === 200) {
              await Promise.all([refreshUser(), fetchAllMechanicVehicles()]);
              
              setResponseModal({
                isOpen: true,
                type: "success",
                description: "Фотографии салона загружены! Осмотр автомобиля начат успешно!",
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
            showModal({
              type: "error",
              description: startError.response?.data?.detail || "Ошибка при начале осмотра",
              buttonText: t("modal.error.tryAgain"),
              onClose: () => {},
            });
          }
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

            {/* Car Controls - только когда механик осматривает машину */}
            {isMechanicInspecting && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[#191919]">
                  Управление автомобилем
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await mechanicActionsApi.openVehicle();
                        showModal({
                          type: "success",
                          description: "Замки автомобиля открыты",
                          buttonText: "Отлично",
                          onClose: () => {},
                        });
                      } catch (error) {
                        showModal({
                          type: "error",
                          description: "Ошибка при открытии замков",
                          buttonText: "Понятно",
                          onClose: () => {},
                        });
                      }
                    }}
                  >
                    Открыть замки
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await mechanicActionsApi.closeVehicle();
                        showModal({
                          type: "success",
                          description: "Замки автомобиля закрыты",
                          buttonText: "Отлично",
                          onClose: () => {},
                        });
                      } catch (error) {
                        showModal({
                          type: "error",
                          description: "Ошибка при закрытии замков",
                          buttonText: "Понятно",
                          onClose: () => {},
                        });
                      }
                    }}
                  >
                    Закрыть замки
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await mechanicActionsApi.unlockEngine();
                        showModal({
                          type: "success",
                          description: "Двигатель разблокирован",
                          buttonText: "Отлично",
                          onClose: () => {},
                        });
                      } catch (error) {
                        showModal({
                          type: "error",
                          description: "Ошибка при разблокировке двигателя",
                          buttonText: "Понятно",
                          onClose: () => {},
                        });
                      }
                    }}
                  >
                    Разблокировать двигатель
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await mechanicActionsApi.lockEngine();
                        showModal({
                          type: "success",
                          description: "Двигатель заблокирован",
                          buttonText: "Отлично",
                          onClose: () => {},
                        });
                      } catch (error) {
                        showModal({
                          type: "error",
                          description: "Ошибка при блокировке двигателя",
                          buttonText: "Понятно",
                          onClose: () => {},
                        });
                      }
                    }}
                  >
                    Заблокировать двигатель
                  </Button>
                </div>
              </div>
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
                    ? (() => {
                        const hasSelfie = car.photo_before_selfie_uploaded || false;
                        const hasCarPhotos = car.photo_before_car_uploaded || false;
                        const hasInteriorPhotos = car.photo_before_interior_uploaded || false;
                        
                        if (!hasSelfie || !hasCarPhotos) {
                          return "Загрузить селфи и фото кузова";
                        } else if (hasSelfie && hasCarPhotos && !hasInteriorPhotos) {
                          return "Загрузить фото салона";
                        } else if (hasSelfie && hasCarPhotos && hasInteriorPhotos) {
                          return "Начать осмотр";
                        } else {
                          return "Загрузить селфи и фото кузова";
                        }
                      })()
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
    </>
  );
};
