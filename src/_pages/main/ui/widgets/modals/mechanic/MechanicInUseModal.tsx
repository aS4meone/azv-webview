import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { CarInfoHeader, CarControlsSlider } from "../ui";
import { ThumbsUpIcon, ThumbsDownIcon } from "@/shared/icons";
import {
  useResponseModal,
  VehicleActionSuccessModal,
  VehicleActionType,
} from "@/shared/ui/modal";
import { vehicleActionsApi } from "@/shared/api/routes/vehicles";
import { useUserStore } from "@/shared/stores/userStore";
import { IUser } from "@/shared/models/types/user";
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import { baseConfig } from "@/shared/contexts/PhotoUploadContext";
import PushScreen from "@/shared/ui/push-screen";
import { CarStatus, ICar } from "@/shared/models/types/car";
import { MechanicWaitingTimer } from "../../components/MechanicTimer";
import { mechanicActionsApi, mechanicApi } from "@/shared/api/routes/mechanic";
import { createCarFromDeliveryData } from "@/shared/utils/deliveryUtils";

interface MechanicInUseModalProps {
  user: IUser;
  onClose: () => void;
}

interface DeliveryData {
  rental_id: number;
  car_id: number;
  car_name: string;
  plate_number: string;
  fuel_level: number;
  latitude: number;
  longitude: number;
  course: number;
  engine_volume: number;
  drive_type: number;
  photos: string[];
  year: number;
  delivery_coordinates: {
    latitude: number;
    longitude: number;
  };
  reservation_time: string;
  status: string;
}

export const MechanicInUseModal = ({
  user,
  onClose,
}: MechanicInUseModalProps) => {
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [actionType, setActionType] = useState<VehicleActionType | null>(null);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);

  // Проверяем, есть ли текущая доставка
  useEffect(() => {
    const checkCurrentDelivery = async () => {
      try {
        const response = await mechanicApi.getCurrentDelivery();
        if (response.status === 200 && response.data) {
          setIsDeliveryMode(true);
          setDeliveryData(response.data);
          console.log("Current delivery in use modal:", response.data);
        } else {
          setIsDeliveryMode(false);
          setDeliveryData(null);
        }
      } catch (error) {
        console.log(error);
        setIsDeliveryMode(false);
        setDeliveryData(null);
      }
    };

    checkCurrentDelivery();
  }, []);

  // Определяем какой автомобиль показывать
  const car: ICar = deliveryData
    ? createCarFromDeliveryData(deliveryData)
    : user.current_rental?.car_details || ({} as ICar);

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
    const res = await mechanicApi.uploadAfterCheckCar(formData);
    if (res.status === 200) {
      setIsLoading(false);
      setShowUploadPhoto(false);
      setShowRatingModal(true);
    }
  };

  const handleUploadAfterDelivery = async (files: {
    [key: string]: File[];
  }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    const res = await mechanicApi.uploadAfterDelivery(formData);
    if (res.status === 200) {
      setIsLoading(false);
      setShowUploadPhoto(false);
      setShowRatingModal(true);
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
          : isDeliveryMode
          ? "Ошибка при попытке приостановить доставку"
          : "Ошибка при попытке приостановить осмотр";

      showModal({
        type: "error",
        description:
          errorMessage ||
          (isDeliveryMode
            ? "Ошибка при попытке приостановить доставку"
            : "Ошибка при попытке приостановить осмотр"),
        buttonText: "Попробовать снова",
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
          : isDeliveryMode
          ? "Ошибка при попытке возобновить доставку"
          : "Ошибка при попытке возобновить осмотр";

      showModal({
        type: "error",
        description:
          errorMessage ||
          (isDeliveryMode
            ? "Ошибка при попытке возобновить доставку"
            : "Ошибка при попытке возобновить осмотр"),
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleCompleteInspection = async () => {
    try {
      if (isDeliveryMode) {
        // Для доставки используем completeDelivery
        const res = await mechanicApi.completeDelivery();
        if (res.status === 200) {
          //   setShowRatingModal(false);
          onClose();
          showModal({
            type: "success",
            description: "Доставка успешно завершена",
            buttonText: "Отлично",
            onClose: async () => {
              await refreshUser();
            },
          });
        }
      } else {
        // Для осмотра используем completeCheckCar с рейтингом
        const res = await mechanicApi.completeCheckCar({
          rating,
          comment,
        });
        if (res.status === 200) {
          setShowRatingModal(false);
          onClose();
          showModal({
            type: "success",
            description: "Осмотр успешно завершен",
            buttonText: "Отлично",
            onClose: async () => {
              await refreshUser();
            },
          });
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : isDeliveryMode
          ? "Произошла ошибка при завершении доставки"
          : "Произошла ошибка при завершении осмотра";

      showModal({
        type: "error",
        description:
          errorMessage ||
          (isDeliveryMode
            ? "Произошла ошибка при завершении доставки"
            : "Произошла ошибка при завершении осмотра"),
        buttonText: "Попробовать снова",
        onClose: () => {},
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
          : "Ошибка при попытке заблокировать автомобиль";

      showModal({
        type: "error",
        description:
          errorMessage || "Ошибка при попытке заблокировать автомобиль",
        buttonText: "Попробовать снова",
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
          : "Ошибка при попытке разблокировать автомобиль";

      showModal({
        type: "error",
        description:
          errorMessage || "Ошибка при попытке разблокировать автомобиль",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <div className="p-6 pt-4 space-y-6">
        <CarInfoHeader car={car} />

        {isDeliveryMode && deliveryData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Адрес доставки:
            </h3>
            <p className="text-sm text-blue-700">
              Координаты:{" "}
              {deliveryData.delivery_coordinates.latitude.toFixed(6)},{" "}
              {deliveryData.delivery_coordinates.longitude.toFixed(6)}
            </p>
          </div>
        )}
      </div>

      <VehicleActionSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
        }}
        actionType={actionType!}
      />

      {isDeliveryMode ? null : (
        <div className="absolute -top-16 right-4 left-4 z-10">
          <MechanicWaitingTimer
            user={user}
            deReservationTime={deliveryData?.reservation_time}
            deCar={car}
          />
        </div>
      )}

      <UploadPhoto
        config={baseConfig}
        isLoading={isLoading}
        onPhotoUpload={
          isDeliveryMode
            ? handleUploadAfterDelivery
            : handleUploadAfterInspection
        }
        isOpen={showUploadPhoto}
        withCloseButton
        onClose={() => setShowUploadPhoto(false)}
      />

      {showRatingModal && (
        <RatingModal
          onClose={() => setShowRatingModal(false)}
          handleCompleteInspection={handleCompleteInspection}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          car={car}
          user={user}
          isDeliveryMode={isDeliveryMode}
        />
      )}

      <div className="p-6 pt-4 space-y-6">
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            className="text-[14px]"
            onClick={handlePauseInspection}
          >
            {isDeliveryMode ? "Приостановить" : "Пауза"}
          </Button>
          <Button
            variant="outline"
            className="text-[14px]"
            onClick={handleResumeInspection}
          >
            {isDeliveryMode ? "Продолжить" : "Возобновить"}
          </Button>
        </div>

        {/* Car Controls Slider */}
        <CarControlsSlider onLock={handleLock} onUnlock={handleUnlock} />

        <Button onClick={() => setShowUploadPhoto(true)} variant="secondary">
          {isDeliveryMode ? "Завершить доставку" : "Завершить осмотр"}
        </Button>
      </div>
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
  isDeliveryMode: boolean;
}

const RatingModal = ({
  onClose,
  handleCompleteInspection,
  rating,
  setRating,
  comment,
  setComment,
  car,
  isDeliveryMode,
}: RatingModalProps) => (
  <PushScreen onClose={onClose} withOutStyles>
    <div className="bg-white px-8 py-10 pt-[140px] text-[#191919] flex flex-col justify-between h-full">
      <div>
        <h2 className="text-[20px] font-semibold mb-4">
          {isDeliveryMode ? "Оцените доставку" : "Оцените состояние автомобиля"}
        </h2>

        {/* Для доставки рейтинг не обязателен */}
        {!isDeliveryMode && (
          <div className="flex gap-4 mb-4 justify-center">
            <button
              onClick={() => setRating(5)}
              className={`flex w-[140px] flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                rating === 5
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-green-300"
              }`}
            >
              <ThumbsUpIcon />
              <span
                className={`text-sm font-medium ${
                  rating === 5 ? "text-green-600" : "text-gray-600"
                }`}
              >
                Хорошее
              </span>
            </button>

            <button
              onClick={() => setRating(1)}
              className={`flex w-[140px] flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                rating === 1
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-red-300"
              }`}
            >
              <ThumbsDownIcon />
              <span
                className={`text-sm font-medium ${
                  rating === 1 ? "text-red-600" : "text-gray-600"
                }`}
              >
                Плохое
              </span>
            </button>
          </div>
        )}

        {(rating !== 0 || isDeliveryMode) && (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              isDeliveryMode
                ? "Комментарий к доставке (необязательно)"
                : rating === 1
                ? "Укажите обнаруженные дефекты (обязательно)"
                : "Дополнительные замечания (необязательно)"
            }
            maxLength={255}
            className="w-full h-[200px] p-5 rounded-[30px] border border-[#E0E0E0] mb-4 bg-[#F9F9F9] outline-none"
          />
        )}
        <CarInfoHeader car={car} showPlateNumber={false} />
      </div>
      <Button
        variant="secondary"
        disabled={
          isDeliveryMode
            ? false
            : rating === 0 || (rating === 1 && comment.trim().length === 0)
        }
        onClick={handleCompleteInspection}
        className="w-full"
      >
        {isDeliveryMode ? "Завершить доставку" : "Завершить осмотр"}
      </Button>
    </div>
  </PushScreen>
);
