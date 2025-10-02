"use client";

import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CarInfoHeader, CarControlsSlider } from "../ui";
import { ThumbsUpIcon, ThumbsDownIcon } from "@/shared/icons";
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
import { 
  baseConfigStep1, 
  baseConfigStep2, 
  afterRentConfigStep1, 
  afterRentConfigStep2 
} from "@/shared/contexts/PhotoUploadContext";
import PushScreen from "@/shared/ui/push-screen";
import { CarStatus, ICar } from "@/shared/models/types/car";
import { mechanicActionsApi, mechanicApi } from "@/shared/api/routes/mechanic";
import Loader from "@/shared/ui/loader";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface MechanicInUseModalProps {
  user: IUser;
  onClose: () => void;
}

export const MechanicInUseModal = ({
  user,
  onClose,
}: MechanicInUseModalProps) => {
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { fetchAllMechanicVehicles } = useVehiclesStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [actionType, setActionType] = useState<VehicleActionType | null>(null);
  const [showUploadPhotoBefore, setShowUploadPhotoBefore] = useState(false);
  const [showUploadPhotoBeforeStep2, setShowUploadPhotoBeforeStep2] = useState(false);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [showUploadPhotoStep2, setShowUploadPhotoStep2] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isEndLoading, setIsEndLoading] = useState(false);
  const [showDataScreen, setShowDataScreen] = useState(false);
  const [photosBeforeUploaded, setPhotosBeforeUploaded] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const car: ICar = user.current_rental?.car_details || ({} as ICar);
  
  // Проверяем, является ли это rental механика
  const isMechanicRental = car.current_renter_details?.id === user.id;

  // Проверяем, загружены ли фото ДО осмотра
  useEffect(() => {
    // Проверяем через данные с бэкенда
    const allPhotosUploaded = 
      car.photo_before_selfie_uploaded && 
      car.photo_before_car_uploaded && 
      car.photo_before_interior_uploaded;
    
    if (allPhotosUploaded) {
      setPhotosBeforeUploaded(true);
    } else {
      setPhotosBeforeUploaded(false);
    }
  }, [car]);

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    await refreshUser();
    await fetchAllMechanicVehicles();
  };

  // Загрузка фото ДО осмотра - Шаг 1
  const handleUploadBeforeInspection = async (files: {
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
        setShowUploadPhotoBefore(false);
        
        // Обновляем данные пользователя чтобы получить обновленные флаги
        await refreshUser();
        
        // Показываем сообщение об открытии замков
        setResponseModal({
          isOpen: true,
          type: "success",
          description: "Фотографии загружены! Замки автомобиля открыты.",
          buttonText: "Отлично",
          onClose: () => {
            setResponseModal(null);
          },
          onButtonClick: () => {
            setResponseModal(null);
          },
        });
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error.response?.data?.detail || t("mechanic.inspection.photoUploadError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  // Загрузка фото ДО осмотра - Шаг 2
  const handleUploadBeforeInspectionStep2 = async (files: {
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
        setShowUploadPhotoBeforeStep2(false);
        
        // Обновляем данные пользователя чтобы получить обновленные флаги
        await refreshUser();
        
        setPhotosBeforeUploaded(true);
        
        setResponseModal({
          isOpen: true,
          type: "success",
          description: "Фотографии салона загружены! Двигатель разблокирован. Теперь автомобиль доступен для управления.",
          buttonText: "Отлично",
          onClose: () => {
            setResponseModal(null);
          },
          onButtonClick: () => {
            setResponseModal(null);
          },
        });
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error.response?.data?.detail || t("mechanic.inspection.photoUploadError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleUploadAfterInspection = async (files: {
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
      const res = await mechanicApi.uploadAfterCheckCar(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhoto(false);
        // Показываем сообщение о блокировке и переходим ко второму шагу
        setResponseModal({
          isOpen: true,
          type: "success",
          description: "Замки, двигатель заблокированы, ключ забран. Теперь сфотографируйте кузов автомобиля.",
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
          error.response?.data?.detail || t("mechanic.inspection.photoUploadError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleUploadAfterInspectionStep2 = async (files: {
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
      const res = await mechanicApi.uploadAfterCheckCarCar(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhotoStep2(false);
        setShowRatingModal(true);
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error.response?.data?.detail || t("mechanic.inspection.photoUploadError"),
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
  const handlePauseInspection = async () => {
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
          : t("mechanic.inspection.pauseError");

      showModal({
        type: "error",
        description: errorMessage || t("mechanic.inspection.pauseError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleResumeInspection = async () => {
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
          : t("mechanic.inspection.resumeError");

      showModal({
        type: "error",
        description: errorMessage || t("mechanic.inspection.resumeError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleCompleteInspection = async () => {
    // Предотвращаем повторные вызовы во время загрузки
    if (isEndLoading) {
      return;
    }
    
    try {
      setIsEndLoading(true);
      const res = await mechanicApi.completeCheckCar({
        rating,
        comment,
      });
      
      // Проверяем, что это не дублирующийся запрос
      if (res.data === "DUPLICATE_PREVENTED") {
        setIsEndLoading(false);
        return; // Просто выходим, не показываем никаких модальных окон
      }
      
      if (res.status === 200) {
        setIsEndLoading(false);
        setShowRatingModal(false);
        setResponseModal({
          type: "success",
          isOpen: true,
          description: t("mechanic.inspection.successfullyCompleted"),
          buttonText: t("mechanic.common.excellent"),
          onButtonClick: handleClose,
          onClose: handleClose,
        });
      } else {
        // Если статус не 200, обрабатываем как ошибку
        setIsEndLoading(false);
        let errorMessage = t("mechanic.inspection.completionError");
        
        // Пытаемся извлечь сообщение об ошибке из ответа
        if (res.data?.detail) {
          errorMessage = res.data.detail;
        }
        
        showModal({
          type: "error",
          description: errorMessage,
          buttonText: t("modal.error.tryAgain"),
          onClose: () => {},
          onButtonClick: () => {
            // Позволяем пользователю попробовать снова завершить осмотр
            handleCompleteInspection();
          },
        });
      }
    } catch (error: unknown) {
      setIsEndLoading(false);
      let errorMessage = t("mechanic.inspection.completionError");
      
      if (error instanceof Error && "response" in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) {
          errorMessage = response.data.detail;
        }
      }

      showModal({
        type: "error",
        description: errorMessage,
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
        onButtonClick: () => {
          // Позволяем пользователю попробовать снова завершить осмотр
          handleCompleteInspection();
        },
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
          : t("mechanic.common.unlockError");

      showModal({
        type: "error",
        description:
          errorMessage || t("mechanic.common.unlockError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleViewData = () => {
    setShowDataScreen(true);
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <div className="p-6 pt-4 space-y-6">
        <CarInfoHeader car={car} />
      </div>

      <CustomResponseModal
        isOpen={responseModal?.isOpen || false}
        onClose={responseModal?.onClose || (() => {})}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
        onButtonClick={responseModal?.onButtonClick || (() => {})}
        type={responseModal?.type || "success"}
      />

      <VehicleActionSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
        }}
        actionType={actionType!}
      />

      {/* Фото ДО осмотра - Шаг 1: Селфи + Кузов */}
      <UploadPhoto
        config={baseConfigStep1}
        isLoading={isLoading}
        onPhotoUpload={handleUploadBeforeInspection}
        isOpen={showUploadPhotoBefore}
        withCloseButton={false}
        onClose={() => {}}
      />

      {/* Фото ДО осмотра - Шаг 2: Салон */}
      <UploadPhoto
        config={baseConfigStep2}
        isLoading={isLoading}
        onPhotoUpload={handleUploadBeforeInspectionStep2}
        isOpen={showUploadPhotoBeforeStep2}
        withCloseButton={false}
        onClose={() => {}}
      />

      {/* Фото ПОСЛЕ осмотра - Шаг 1: Селфи + Салон */}
      <UploadPhoto
        config={afterRentConfigStep1}
        isLoading={isLoading}
        onPhotoUpload={handleUploadAfterInspection}
        isOpen={showUploadPhoto}
        withCloseButton
        onClose={() => setShowUploadPhoto(false)}
      />

      {/* Фото ПОСЛЕ осмотра - Шаг 2: Кузов */}
      <UploadPhoto
        config={afterRentConfigStep2}
        isLoading={isLoading}
        onPhotoUpload={handleUploadAfterInspectionStep2}
        isOpen={showUploadPhotoStep2}
        withCloseButton={false}
        onClose={() => setShowUploadPhotoStep2(false)}
      />

      {showRatingModal && (
        <RatingModal
          isLoading={isEndLoading}
          onClose={() => setShowRatingModal(false)}
          handleCompleteInspection={handleCompleteInspection}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          car={car}
          user={user}
        />
      )}

      {/* Проверяем статус загрузки фото */}
      {!car.photo_before_selfie_uploaded || !car.photo_before_car_uploaded ? (
        // Шаг 1: Нужно загрузить селфи + кузов
        <div className="p-6 pt-4 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <div>
                <h4 className="text-[16px] font-semibold text-green-800">
                  Начало осмотра
                </h4>
                <p className="text-[14px] text-green-700">
                  Загрузите фотографии (селфи + кузов) для начала осмотра
                </p>
              </div>
            </div>
          </div>
          
          <Button onClick={() => setShowUploadPhotoBefore(true)} variant="secondary">
            Загрузить фотографии
          </Button>
        </div>
      ) : !car.photo_before_interior_uploaded ? (
        // Шаг 2: Селфи и кузов загружены, нужен салон
        <div className="p-6 pt-4 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <div>
                <h4 className="text-[16px] font-semibold text-blue-800">
                  Замки открыты
                </h4>
                <p className="text-[14px] text-blue-700">
                  Теперь загрузите фото салона для разблокировки двигателя
                </p>
              </div>
            </div>
          </div>
          
          <Button onClick={() => setShowUploadPhotoBeforeStep2(true)} variant="secondary">
            Загрузить фото салона
          </Button>
        </div>
      ) : (
        // Все фото загружены - показываем управление
        <>
          {car.status === CarStatus.inUse && (
            <div className="flex justify-center px-6">
              <Button variant="outline" onClick={handleViewData}>
                {t("mechanic.inspection.viewData")}
              </Button>
            </div>
          )}

          <div className="p-6 pt-4 space-y-6">
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                className="text-[14px]"
                onClick={handlePauseInspection}
              >
                {t("mechanic.inspection.pauseInspection")}
              </Button>
              <Button
                variant="outline"
                className="text-[14px]"
                onClick={handleResumeInspection}
              >
                {t("mechanic.inspection.resumeInspection")}
              </Button>
            </div>

            {/* Car Controls Slider */}
            <CarControlsSlider onLock={handleUnlock} onUnlock={handleLock} />

            <Button onClick={() => setShowUploadPhoto(true)} variant="secondary">
              {t("mechanic.inspection.completeInspection")}
            </Button>
          </div>
        </>
      )}

      {showDataScreen && (
        <DescriptionScreen car={car} onClose={() => setShowDataScreen(false)} />
      )}
    </div>
  );
};

interface RatingModalProps {
  onClose: () => void;
  handleCompleteInspection: () => void;
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  car: ICar;
  user: IUser;
  isLoading: boolean;
}

const RatingModal = ({
  onClose,
  handleCompleteInspection,
  rating,
  setRating,
  comment,
  setComment,
  car,
  isLoading,
}: RatingModalProps) => {
  const t = useTranslations();
  return (
  <PushScreen onClose={onClose} withOutStyles>
    <div className="bg-white px-8 py-10 pt-[140px] text-[#191919] flex flex-col justify-between h-full">
      <div>
        <h2 className="text-[20px] font-semibold mb-4">
          {t("mechanic.inspection.rateCarCondition")}
        </h2>

        <div className="flex gap-4 mb-4 justify-center">
          <button
            onClick={() => setRating(5)}
            className={`flex w-[140px] flex-col items-center gap-2 p-4 rounded-[40px] border-2 transition-all ${
              rating === 5
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-green-300"
            }`}
          >
            <ThumbsUpIcon />
          </button>

          <button
            onClick={() => setRating(1)}
            className={`flex w-[140px] flex-col items-center gap-2 p-4 rounded-[40px] border-2 transition-all ${
              rating === 1
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-red-300"
            }`}
          >
            <ThumbsDownIcon />
          </button>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            rating === 1
              ? t("mechanic.inspection.specifyDefects")
              : t("mechanic.inspection.additionalComments")
          }
          maxLength={255}
          className="w-full h-[200px] p-5 rounded-[30px] border border-[#E0E0E0] mb-4 bg-[#F9F9F9] outline-none"
        />

        <CarInfoHeader car={car} showPlateNumber={false} />
      </div>
      <Button
        variant="secondary"
        disabled={rating === 0 || (rating === 1 && comment.trim().length === 0)}
        onClick={handleCompleteInspection}
        className="w-full"
      >
        {isLoading ? <Loader /> : t("mechanic.inspection.completeInspection")}
      </Button>
    </div>
  </PushScreen>
  );
};
