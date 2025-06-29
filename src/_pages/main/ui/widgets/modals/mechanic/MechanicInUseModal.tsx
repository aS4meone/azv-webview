import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
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
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import { baseConfig } from "@/shared/contexts/PhotoUploadContext";
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
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { fetchAllMechanicVehicles } = useVehiclesStore();
  const [isLoading, setIsLoading] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [actionType, setActionType] = useState<VehicleActionType | null>(null);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isEndLoading, setIsEndLoading] = useState(false);
  const [showDataScreen, setShowDataScreen] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const car: ICar = user.current_rental?.car_details || ({} as ICar);

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    await refreshUser();
    await fetchAllMechanicVehicles();
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
        setShowRatingModal(true);
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error.response?.data?.detail || "Ошибка при загрузке фотографий",
        buttonText: "Попробовать снова",
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
          : "Ошибка при попытке приостановить осмотр";

      showModal({
        type: "error",
        description: errorMessage || "Ошибка при попытке приостановить осмотр",
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
          : "Ошибка при попытке возобновить осмотр";

      showModal({
        type: "error",
        description: errorMessage || "Ошибка при попытке возобновить осмотр",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleCompleteInspection = async () => {
    try {
      setIsEndLoading(true);
      const res = await mechanicApi.completeCheckCar({
        rating,
        comment,
      });
      if (res.status === 200) {
        setIsEndLoading(false);
        setShowRatingModal(false);
        setResponseModal({
          type: "success",
          isOpen: true,
          description: "Осмотр успешно завершен",
          buttonText: "Отлично",
          onButtonClick: handleClose,
          onClose: handleClose,
        });
      }
    } catch (error: unknown) {
      setIsEndLoading(false);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Произошла ошибка при завершении осмотра";

      showModal({
        type: "error",
        description: errorMessage || "Произошла ошибка при завершении осмотра",
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
      />

      <VehicleActionSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
        }}
        actionType={actionType!}
      />

      <UploadPhoto
        config={baseConfig}
        isLoading={isLoading}
        onPhotoUpload={handleUploadAfterInspection}
        isOpen={showUploadPhoto}
        withCloseButton
        onClose={() => setShowUploadPhoto(false)}
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

      {car.status === CarStatus.inUse && (
        <div className="flex justify-center px-6">
          <Button variant="outline" onClick={handleViewData}>
            Посмотреть данные
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
            Пауза
          </Button>
          <Button
            variant="outline"
            className="text-[14px]"
            onClick={handleResumeInspection}
          >
            Начать поездку
          </Button>
        </div>

        {/* Car Controls Slider */}
        <CarControlsSlider onLock={handleUnlock} onUnlock={handleLock} />

        <Button onClick={() => setShowUploadPhoto(true)} variant="secondary">
          Завершить осмотр
        </Button>
      </div>

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
}: RatingModalProps) => (
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
              ? "Укажите обнаруженные дефекты (обязательно)"
              : "Дополнительные замечания (необязательно)"
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
