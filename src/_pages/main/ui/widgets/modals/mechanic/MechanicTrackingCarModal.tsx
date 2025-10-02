"use client";import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs, CarControlsSlider } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { useUserStore } from "@/shared/stores/userStore";
import { TrackingDataScreen } from "../../screens/tracking-screen/TrackingDataScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { ClientReviewSection } from "./ClientReviewSection";
import { mechanicActionsApi, mechanicApi } from "@/shared/api/routes/mechanic";
import { vehicleActionsApi } from "@/shared/api/routes/vehicles";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import { mechanicAfterConfigStep1, mechanicAfterConfigStep2 } from "@/shared/contexts/PhotoUploadContext";
import { ThumbsUpIcon, ThumbsDownIcon } from "@/shared/icons";
import PushScreen from "@/shared/ui/push-screen";
import Loader from "@/shared/ui/loader";
import { IUser } from "@/shared/models/types/user";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";

interface MechanicTrackingCarModalProps {
  car: ICar;
  currentMechanicId?: number | null;
  onClose: () => void;
}

export const MechanicTrackingCarModal = ({
  car: initialCar,
  currentMechanicId,
  onClose,
}: MechanicTrackingCarModalProps) => {
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { allVehicles } = useVehiclesStore();
  
  // Получаем актуальные данные о машине из vehiclesStore
  const car = allVehicles.find(v => v.id === initialCar.id) || initialCar;
  const [showDataScreen, setShowDataScreen] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const [showUploadPhotoStep1, setShowUploadPhotoStep1] = useState(false);
  const [showUploadPhotoStep2, setShowUploadPhotoStep2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    await refreshUser();
  };

  const handleCompleteTracking = async () => {
    try {
      if (isMechanicInspecting) {
        // 🔍 DEBUG: Выводим все значения для диагностики
        console.log("--- DEBUG: Mechanic Complete Tracking clicked ---");
        console.log("car.photo_after_selfie_uploaded:", car.photo_after_selfie_uploaded);
        console.log("car.photo_after_car_uploaded:", car.photo_after_car_uploaded);
        console.log("car.photo_after_interior_uploaded:", car.photo_after_interior_uploaded);
        console.log("car.status:", car.status);
        console.log("car.current_renter_details?.id:", car.current_renter_details?.id);
        console.log("currentMechanicId:", currentMechanicId);
        console.log("isMechanicInspecting:", isMechanicInspecting);
        
        // Проверяем флаги photo_after_*_uploaded для определения следующих шагов
        const needsSelfieInterior = !car.photo_after_selfie_uploaded || !car.photo_after_interior_uploaded;
        const needsCarPhotos = !car.photo_after_car_uploaded;
        
        console.log("🔍 DEBUG: needsSelfieInterior:", needsSelfieInterior);
        console.log("🔍 DEBUG: needsCarPhotos:", needsCarPhotos);
        
        if (needsSelfieInterior) {
          console.log("🔍 DEBUG: Showing Step 1 (selfie + interior)");
          // Первый шаг: загружаем селфи + салон
          setShowUploadPhotoStep1(true);
        } else if (needsCarPhotos) {
          console.log("🔍 DEBUG: Showing Step 2 (car photos)");
          // Второй шаг: загружаем фото кузова
          setShowUploadPhotoStep2(true);
        } else {
          console.log("🔍 DEBUG: All photos uploaded, showing rating modal");
          // Все фото загружены - показываем рейтинг
          setShowRatingModal(true);
        }
      } else {
        // Завершение слежки
        localStorage.removeItem("tracking_car_id");
        setResponseModal({
          type: "success",
          isOpen: true,
          title: t("mechanic.tracking.completed"),
          description: t("mechanic.tracking.successfullyCompleted"),
          buttonText: t("mechanic.common.excellent"),
          onButtonClick: handleClose,
          onClose: handleClose,
        });
      }
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: isMechanicInspecting ? "Ошибка при завершении осмотра" : t("mechanic.tracking.completionError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  const handleViewData = () => {
    setShowDataScreen(true);
  };

  // Загрузка фото после осмотра - Шаг 1 (селфи + салон)
  const handleUploadStep1 = async (files: { [key: string]: File[] }) => {
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
        setShowUploadPhotoStep1(false);
        
        // Обновляем данные пользователя чтобы получить обновленные флаги
        await refreshUser();
        
        setResponseModal({
          type: "success",
          isOpen: true,
          title: "Фото загружены",
          description: "Селфи и фото салона загружены. Замки заблокированы, двигатель заблокирован, ключ взят. Теперь сфотографируйте кузов.",
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
    } catch (error: any) {
      setIsLoading(false);
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при загрузке фото",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  // Загрузка фото после осмотра - Шаг 2 (кузов)
  const handleUploadStep2 = async (files: { [key: string]: File[] }) => {
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
        
        // Обновляем данные пользователя чтобы получить обновленные флаги
        await refreshUser();
        
        // Показываем модальное окно рейтинга вместо прямого завершения
        setShowRatingModal(true);
      }
    } catch (error: any) {
      setIsLoading(false);
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при загрузке фото",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  // Завершение осмотра
  const handleCompleteInspection = async () => {
    try {
      const res = await mechanicApi.completeCheckCar({
        rating: rating,
        comment: comment
      });
      if (res.status === 200) {
        setShowRatingModal(false);
        setResponseModal({
          type: "success",
          isOpen: true,
          title: "Осмотр завершен",
          description: "Осмотр автомобиля успешно завершен",
          buttonText: "Отлично",
          onButtonClick: handleClose,
          onClose: handleClose,
        });
      }
    } catch (error: any) {
      showModal({
        type: "error",
        description: error.response?.data?.detail || "Ошибка при завершении осмотра",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  // Проверяем, осматривает ли текущий механик эту машину
  const isMechanicInspecting = car?.status === "IN_USE" && 
    car?.current_renter_details?.id === currentMechanicId;

  // Функции управления автомобилем
  const handleLock = async () => {
    try {
      await mechanicActionsApi.closeVehicle();
      showModal({
        type: "success",
        description: "Автомобиль заблокирован",
        buttonText: "Отлично",
        onClose: () => {},
      });
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: "Ошибка при блокировке автомобиля",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleUnlock = async () => {
    try {
      await mechanicActionsApi.openVehicle();
      showModal({
        type: "success",
        description: "Автомобиль разблокирован",
        buttonText: "Отлично",
        onClose: () => {},
      });
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: "Ошибка при разблокировке автомобиля",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  // Функции управления двигателем
  const handleLockEngine = async () => {
    try {
      await vehicleActionsApi.lockEngine();
      showModal({
        type: "success",
        description: "Двигатель заблокирован",
        buttonText: "Отлично",
        onClose: () => {},
      });
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: "Ошибка при блокировке двигателя",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleUnlockEngine = async () => {
    try {
      await vehicleActionsApi.unlockEngine();
      showModal({
        type: "success",
        description: "Двигатель разблокирован",
        buttonText: "Отлично",
        onClose: () => {},
      });
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: "Ошибка при разблокировке двигателя",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  // Функции управления ключами
  const handleGiveKey = async () => {
    try {
      await mechanicActionsApi.giveKey();
      showModal({
        type: "success",
        description: "Ключ выдан",
        buttonText: "Отлично",
        onClose: () => {},
      });
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: "Ошибка при выдаче ключа",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleTakeKey = async () => {
    try {
      await mechanicActionsApi.takeKey();
      showModal({
        type: "success",
        description: "Ключ принят",
        buttonText: "Отлично",
        onClose: () => {},
      });
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: "Ошибка при принятии ключа",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
        {/* Car Image Carousel */}
        <CarImageCarousel car={car} rounded={true} />

        <CustomResponseModal
          isOpen={responseModal?.isOpen || false}
          onClose={responseModal?.onClose || (() => {})}
          title={responseModal?.title || ""}
          description={responseModal?.description || ""}
          buttonText={responseModal?.buttonText || ""}
          onButtonClick={responseModal?.onButtonClick || (() => {})}
        />

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

          {/* Inspection Status */}
          {isMechanicInspecting ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-medium">Осмотр активен</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                Вы проводите осмотр этого автомобиля
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">{t("mechanic.tracking.active")}</span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                {t("mechanic.tracking.description")}
              </p>
            </div>
          )}

          {/* Car Controls - только когда механик осматривает машину */}
          {isMechanicInspecting && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#191919]">
                Управление автомобилем
              </h3>
              
              {/* Car Controls Slider */}
              <CarControlsSlider onLock={handleLock} onUnlock={handleUnlock} />
              
              {/* Engine Controls */}
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  className="text-[14px] flex-1"
                  onClick={handleLockEngine}
                >
                  Заблокировать двигатель
                </Button>
                <Button
                  variant="outline"
                  className="text-[14px] flex-1"
                  onClick={handleUnlockEngine}
                >
                  Разблокировать двигатель
                </Button>
              </div>
              
              {/* Key Controls */}
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  className="text-[14px] flex-1"
                  onClick={handleGiveKey}
                >
                  Выдать ключ
                </Button>
                <Button
                  variant="outline"
                  className="text-[14px] flex-1"
                  onClick={handleTakeKey}
                >
                  Принять ключ
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button variant="outline" onClick={handleViewData}>
              {isMechanicInspecting ? "Посмотреть данные осмотра" : t("mechanic.tracking.viewData")}
            </Button>

            <Button variant="secondary" onClick={handleCompleteTracking}>
              {isMechanicInspecting ? "Завершить осмотр" : t("mechanic.tracking.completeTracking")}
            </Button>
          </div>
        </div>
      </div>

      {/* Экран данных осмотра/слежки */}
      {showDataScreen && (
        <TrackingDataScreen
          car={car}
          onClose={() => setShowDataScreen(false)}
        />
      )}

      {/* Модальные окна загрузки фотографий */}
      <UploadPhoto
        config={mechanicAfterConfigStep1}
        onPhotoUpload={handleUploadStep1}
        isOpen={showUploadPhotoStep1}
        onClose={() => setShowUploadPhotoStep1(false)}
        isLoading={isLoading}
        isCloseable={false}
      />

      <UploadPhoto
        config={mechanicAfterConfigStep2}
        onPhotoUpload={handleUploadStep2}
        isOpen={showUploadPhotoStep2}
        onClose={() => setShowUploadPhotoStep2(false)}
        isLoading={isLoading}
        isCloseable={false}
      />

      {/* Модальное окно рейтинга */}
      {showRatingModal && (
        <RatingModal
          isLoading={isLoading}
          onClose={() => setShowRatingModal(false)}
          handleCompleteInspection={handleCompleteInspection}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          car={car}
          user={{ id: currentMechanicId } as IUser}
        />
      )}
    </>
  );
};

// Компонент рейтинга с лайком/дизлайком и комментарием
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
  user,
  isLoading,
}: RatingModalProps) => {
  const t = useTranslations();
  return (
    <PushScreen onClose={onClose} withOutStyles>
      <div className="bg-white px-8 py-10 pt-[140px] text-[#191919] flex flex-col justify-between h-full">
        <div>
          <h2 className="text-[20px] font-semibold mb-4">
            Оцените состояние автомобиля
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
                ? "Укажите обнаруженные дефекты"
                : "Дополнительные комментарии"
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
          {isLoading ? <Loader /> : "Завершить осмотр"}
        </Button>
      </div>
    </PushScreen>
  );
};
