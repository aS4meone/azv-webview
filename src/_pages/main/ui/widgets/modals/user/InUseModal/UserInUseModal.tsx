import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { CarInfoHeader, CarControlsSlider } from "../../ui";
import {
  ResponseBottomModalProps,
  VehicleActionSuccessModal,
  VehicleActionType,
} from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import { vehicleActionsApi } from "@/shared/api/routes/vehicles";
import { useUserStore } from "@/shared/stores/userStore";
import { IUser } from "@/shared/models/types/user";
import { RentalType } from "@/shared/models/dto/rent.dto";
import { ArrowRightIcon } from "@/shared/icons";
import { cn } from "@/shared/utils/cn";
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import { baseConfig, ownerConfig } from "@/shared/contexts/PhotoUploadContext";
import PushScreen from "@/shared/ui/push-screen";
import { ICar } from "@/shared/models/types/car";
import { RENTAL_CONFIG } from "../../../screens/rental-screen/hooks/usePricingCalculator";
import { MinutesRentalContent } from "./components/MinutesRentalContent";
import { HoursRentalContent } from "./components/HoursRentalContent";
import { DaysRentalContent } from "./components/DaysRentalContent";
import Loader from "@/shared/ui/loader";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface UserInUseModalProps {
  user: IUser;
  onClose: () => void;
}

export const UserInUseModal = ({ user, onClose }: UserInUseModalProps) => {
  const { refreshUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const [showMore, setShowMore] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [actionType, setActionType] = useState<VehicleActionType | null>(null);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isEndLoading, setIsEndLoading] = useState(false);

  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const handleClose = async () => {
    setResponseModal(null);
    await refreshUser();
    onClose();
  };

  const handlePhotoUpload = async (files: { [key: string]: File[] }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    const res = await rentApi.uploadAfterRent(formData);
    if (res.status === 200) {
      setIsLoading(false);
      setShowUploadPhoto(false);
      setShowRatingModal(true);
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
    const res = await rentApi.uploadOwnerAfterRent(formData);
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
  }, [isSuccessOpen, responseModal]);

  const car = user.current_rental!.car_details;
  const rentalDetails = user.current_rental!.rental_details;
  const rentalType = rentalDetails.rental_type as RentalType;

  // Vehicle action handlers
  const handlePause = async () => {
    try {
      await vehicleActionsApi.takeKey();
      showSuccessModal("takeKey");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Ошибка при попытке поставить на паузу";

      setResponseModal({
        isOpen: true,
        onClose: async () => {
          setResponseModal(null);
          await refreshUser();
        },
        type: "error",
        title: "Ошибка",
        description: errorMessage || "Ошибка при попытке поставить на паузу",
        buttonText: "Попробовать снова",
        onButtonClick: async () => {
          setResponseModal(null);
          await refreshUser();
        },
      });
    }
  };

  const handleStartTrip = async () => {
    try {
      await vehicleActionsApi.giveKey();
      showSuccessModal("giveKey");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Ошибка при попытке начать поездку";

      setResponseModal({
        isOpen: true,
        onClose: async () => {
          setResponseModal(null);
          await refreshUser();
        },
        type: "error",
        title: "Ошибка",
        description: errorMessage || "Ошибка при попытке начать поездку",
        buttonText: "Попробовать снова",
        onButtonClick: async () => {
          setResponseModal(null);
        },
      });
    }
  };

  const handleEndRental = async () => {
    try {
      setIsEndLoading(true);
      const res = await rentApi.completeRent({
        rating,
        comment,
      });
      if (res.status === 200) {
        setIsEndLoading(false);
        setShowRatingModal(false);

        setResponseModal({
          isOpen: true,
          onClose: async () => {
            setResponseModal(null);
            await refreshUser();
            onClose();
          },
          type: "success",
          description: "Аренда успешно завершена",
          buttonText: "Отлично",
          onButtonClick: async () => {
            setResponseModal(null);
            await refreshUser();
            onClose();
          },
        });
      }
    } catch (error: unknown) {
      setIsEndLoading(false);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Произошла ошибка при завершении аренды";

      setResponseModal({
        isOpen: true,
        onClose: () => {},
        type: "error",
        title: "Ошибка",
        description: errorMessage || "Произошла ошибка при завершении аренды",
        buttonText: "Попробовать снова",
        onButtonClick: () => {},
      });
    }
  };

  const handleLock = async () => {
    try {
      await vehicleActionsApi.closeVehicle();
      showSuccessModal("lock");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Ошибка при попытке заблокировать автомобиль";

      setResponseModal({
        isOpen: true,
        onClose: () => {},
        type: "error",
        title: "Ошибка",
        description:
          errorMessage || "Ошибка при попытке заблокировать автомобиль",
        buttonText: "Попробовать снова",
        onButtonClick: () => {},
      });
    }
  };

  const handleUnlock = async () => {
    try {
      await vehicleActionsApi.openVehicle();
      showSuccessModal("unlock");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : "Ошибка при попытке разблокировать автомобиль";

      setResponseModal({
        isOpen: true,
        onClose: () => {},
        type: "error",
        title: "Ошибка",
        description:
          errorMessage || "Ошибка при попытке разблокировать автомобиль",
        buttonText: "Попробовать снова",
        onButtonClick: () => {},
      });
    }
  };

  const renderRentalTypeContent = () => {
    switch (rentalType) {
      case "minutes":
        return <MinutesRentalContent rentalDetails={rentalDetails} car={car} />;
      case "hours":
        return <HoursRentalContent rentalDetails={rentalDetails} car={car} />;
      case "days":
        return <DaysRentalContent rentalDetails={rentalDetails} car={car} />;
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Неизвестный тип аренды: {rentalType}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
      <div className="p-6 pt-4 space-y-6">
        <CarInfoHeader car={car} />
      </div>
      <CustomResponseModal
        onButtonClick={handleClose}
        isOpen={!!responseModal}
        onClose={handleClose}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
      />
      <VehicleActionSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
        }}
        actionType={actionType!}
      />

      <UploadPhoto
        config={car.owned_car ? ownerConfig : baseConfig}
        onPhotoUpload={
          car.owned_car ? handleOwnerPhotoUpload : handlePhotoUpload
        }
        isLoading={isLoading}
        isOpen={showUploadPhoto}
        withCloseButton
        onClose={() => setShowUploadPhoto(false)}
      />

      {showRatingModal && (
        <RatingModal
          isLoading={isEndLoading}
          onClose={() => setShowRatingModal(false)}
          handleEndRental={handleEndRental}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          car={car}
          user={user}
        />
      )}

      {car.owned_car ? null : (
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            "w-full h-auto bg-[#F3F3F3] text-left text-[#191919] p-5 text-[16px]",
            showMore && "bg-[#F1F7FF]"
          )}
        >
          {showMore ? (
            renderRentalTypeContent()
          ) : (
            <div className="text-center flex items-center justify-start gap-2">
              <span>Подробнее</span> <ArrowRightIcon />
            </div>
          )}
        </button>
      )}

      <div className="p-6 pt-4 space-y-6">
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            className="text-[14px]"
            onClick={handlePause}
          >
            Пауза
          </Button>
          <Button
            variant="outline"
            className="text-[14px]"
            onClick={handleStartTrip}
          >
            Начать поездку
          </Button>
        </div>

        {/* Car Controls Slider */}
        <CarControlsSlider onLock={handleUnlock} onUnlock={handleLock} />

        <Button onClick={() => setShowUploadPhoto(true)} variant="secondary">
          Завершить аренду
        </Button>
      </div>
    </div>
  );
};

interface RatingModalProps {
  onClose: () => void;
  handleEndRental: () => void;
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
  handleEndRental,
  rating,
  setRating,
  comment,
  setComment,
  car,
  user,
  isLoading,
}: RatingModalProps) => (
  <PushScreen onClose={onClose} withOutStyles>
    <div className="bg-white px-8 py-10 pt-[140px] text-[#191919] flex flex-col justify-between h-full">
      <div>
        <h2 className="text-[20px] font-semibold mb-4">Оставьте отзыв</h2>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <StartIcon fill={star <= rating ? "#FFD700" : "none"} />
            </button>
          ))}
          <span className="ml-2 text-[#191919] text-[16px]">{rating}.0</span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            rating === 1
              ? "Комментарий (обязательно при оценке 1 звезда)"
              : "Комментарий (необязательно)"
          }
          maxLength={255}
          className="w-full h-[200px] p-5 rounded-[30px] border border-[#E0E0E0]  mb-4 bg-[#F9F9F9] outline-none"
        />
        <CarInfoHeader car={car} showPlateNumber={false} />
        <div className="flex justify-between items-center border-t border-[#E0E0E0] mt-2 pt-2">
          <p className="text-[16px] text-[#191919]">Тариф</p>
          <p className="text-[16px] text-[#191919]">
            {user.current_rental!.rental_details.rental_type === "minutes"
              ? `${car.price_per_minute} ₸/мин`
              : user.current_rental!.rental_details.rental_type === "hours"
              ? `${
                  user.current_rental!.rental_details.duration
                } ${RENTAL_CONFIG[
                  user.current_rental!.rental_details.rental_type as RentalType
                ].getUnitText(user.current_rental!.rental_details.duration!)}`
              : `${
                  user.current_rental!.rental_details.duration
                } ${RENTAL_CONFIG[
                  user.current_rental!.rental_details.rental_type as RentalType
                ].getUnitText(user.current_rental!.rental_details.duration!)}`}
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        disabled={rating === 0 || (rating === 1 && comment.length === 0)}
        onClick={handleEndRental}
        className="w-full"
      >
        {isLoading ? <Loader /> : "Завершить"}
      </Button>
    </div>
  </PushScreen>
);

const StartIcon = ({
  fill = "none",
  border = "#686868",
}: {
  fill?: string;
  border?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="26"
      viewBox="0 0 25 26"
      fill={fill}
    >
      <path
        d="M9.91759 5.22613C11.0119 2.40871 11.5591 1 12.5 1C13.4409 1 13.9881 2.40871 15.0824 5.22613L15.1334 5.35733C15.7516 6.94903 16.0607 7.74488 16.6907 8.22861C17.3208 8.71234 18.1478 8.78883 19.8018 8.94181L20.1008 8.96946C22.8079 9.21983 24.1614 9.34502 24.451 10.2343C24.7406 11.1236 23.7354 12.0681 21.7251 13.9569L21.0541 14.5873C20.0364 15.5435 19.5276 16.0216 19.2904 16.6482C19.2462 16.765 19.2094 16.8848 19.1803 17.0066C19.0245 17.6599 19.1735 18.3534 19.4715 19.7405L19.5642 20.1723C20.1119 22.7215 20.3858 23.9962 19.9076 24.5459C19.729 24.7514 19.4967 24.8993 19.2388 24.972C18.5485 25.1665 17.5684 24.3418 15.6082 22.6923C14.3211 21.6091 13.6776 21.0676 12.9387 20.9457C12.6481 20.8978 12.3519 20.8978 12.0613 20.9457C11.3224 21.0676 10.6789 21.6091 9.39175 22.6923C7.4316 24.3418 6.45153 25.1665 5.76121 24.972C5.50325 24.8993 5.27104 24.7514 5.09238 24.5459C4.61425 23.9962 4.88809 22.7215 5.43577 20.1723L5.52854 19.7405C5.82655 18.3534 5.97555 17.6599 5.81966 17.0066C5.79058 16.8848 5.7538 16.765 5.70956 16.6482C5.47239 16.0216 4.96355 15.5435 3.94587 14.5873L3.27492 13.9569C1.26456 12.0681 0.259379 11.1236 0.549 10.2343C0.83862 9.34502 2.19214 9.21983 4.89917 8.96946L5.1982 8.94181C6.85223 8.78883 7.67925 8.71234 8.30926 8.22861C8.93927 7.74488 9.24839 6.94903 9.86663 5.35732L9.91759 5.22613Z"
        stroke={border}
      />
    </svg>
  );
};

export default StartIcon;
