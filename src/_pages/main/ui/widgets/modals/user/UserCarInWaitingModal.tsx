import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import InfoIcon from "@/shared/icons/ui/InfoIcon";
import { IUser } from "@/shared/models/types/user";
import { WaitingTimer } from "../../timers/WaitingTimer";
import { useUserStore } from "@/shared/stores/userStore";
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import {
  baseConfig,
  OWNER_UPLOAD,
  ownerConfig,
  usePhotoUpload,
  USER_UPLOAD,
} from "@/shared/contexts/PhotoUploadContext";
import { useRouter } from "next/navigation";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface UserCarInWaitingModalProps {
  user: IUser;
  onClose: () => void;
}

export const UserCarInWaitingModal = ({
  user,
  onClose,
}: UserCarInWaitingModalProps) => {
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const { refreshUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const car = user.current_rental!.car_details;
  const router = useRouter();
  const { setUploadRequired } = usePhotoUpload();
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const handleClose = async () => {
    setResponseModal(null);
    await refreshUser();
    onClose();
  };

  async function handleRent() {
    try {
      const res = await rentApi.startRent();
      if (res.status === 200) {
        handleClose();
        setUploadRequired(car.owned_car ? OWNER_UPLOAD : USER_UPLOAD, true);
        setResponseModal({
          isOpen: true,
          onClose: handleClose,
          type: "success",
          title: "Аренда успешно начата",
          description: "Загрузите фотографии перед началом аренды",
          buttonText: "Отлично",
          onButtonClick: async () => {
            await refreshUser();
            setShowUploadPhoto(true);
          },
        });
      }
    } catch (error) {
      setResponseModal({
        isOpen: true,
        onClose: handleClose,
        type: "error",
        title: "Ошибка",
        description: error.response.data.detail,
        buttonText: "Попробвать сново",
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
          onClose: handleClose,
          type: "success",
          title: "Аренда успешно отменена",
          description: "Аренда успешно отменена",
          buttonText: "Отлично",
          onButtonClick: handleClose,
        });
      }
    } catch (error) {
      setResponseModal({
        isOpen: true,
        onClose: handleClose,
        type: "error",
        title: "Ошибка",
        description: error.response.data.detail,
        buttonText: "Попробвать сново",
        onButtonClick: handleClose,
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
    const res = await rentApi.uploadBeforeRent(formData);
    if (res.status === 200) {
      setIsLoading(false);
      setShowUploadPhoto(false);
      setResponseModal({
        isOpen: true,
        onClose: handleClose,
        type: "success",
        title: "Фотографии успешно загружены",
        description: "Фотографии успешно загружены",
        buttonText: "Отлично",
        onButtonClick: handleClose,
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
    const res = await rentApi.uploadOwnerBeforeRent(formData);
    if (res.status === 200) {
      setIsLoading(false);
      setShowUploadPhoto(false);
      setResponseModal({
        isOpen: true,
        onClose: handleClose,
        type: "success",
        title: "Фотографии успешно загружены",
        description: "Фотографии успешно загружены",
        buttonText: "Отлично",
        onButtonClick: handleClose,
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
      <UploadPhoto
        config={car.owned_car ? ownerConfig : baseConfig}
        onPhotoUpload={
          car.owned_car ? handleOwnerPhotoUpload : handlePhotoUpload
        }
        isOpen={showUploadPhoto}
        isLoading={isLoading}
        onClose={() => setShowUploadPhoto(false)}
      />

      {/* Таймер ожидания */}
      <div className="absolute -top-16 right-4 left-4 z-10">
        <WaitingTimer user={user} />
      </div>

      {/* Car Image Carousel */}
      <CarImageCarousel
        car={car}
        height="h-64"
        showProgressIndicator
        rounded={true}
      />

      {/* Content */}
      <div className="p-6 pt-4 space-y-6">
        {/* Car Title and Plate */}
        <CarInfoHeader car={car} />

        {/* Car Specs */}
        <CarSpecs car={car} />

        <div>
          <h4 className="text-[20px] font-semibold text-[#191919]">
            Осмотрите автомобиль
          </h4>
          <h4 className="text-[18px] text-[#191919]">
            Сфотографируйте авто перед началом аренды, зафиксировав все
            повреждения, дефекты и состояние салона.
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="outline" onClick={handleCancelRental}>
            Отменить аренду
          </Button>
          <Button onClick={handleRent} variant="secondary">
            Открыть авто
          </Button>
        </div>

        <div className=" flex flex-row gap-2">
          <InfoIcon />
          <p className="text-[14px] text-[#191919]">
            Открытие авто подтверждает акт выдачи.
          </p>
        </div>
      </div>
    </div>
  );
};
