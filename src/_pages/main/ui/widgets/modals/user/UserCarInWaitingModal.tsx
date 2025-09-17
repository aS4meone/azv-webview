import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import InfoIcon from "@/shared/icons/ui/InfoIcon";
import { IUser } from "@/shared/models/types/user";
import { WaitingTimer } from "../../timers/WaitingTimer";
import { useUserStore } from "@/shared/stores/userStore";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import {
  baseConfig,
  OWNER_UPLOAD,
  ownerConfig,
  usePhotoUpload,
  USER_UPLOAD,
} from "@/shared/contexts/PhotoUploadContext";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { useTranslations } from "next-intl";

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
  const { refreshUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const car = user.current_rental!.car_details;
  const { setUploadRequired } = usePhotoUpload();
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const handleClose = async () => {
    await refreshUser();
    setResponseModal(null);
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
          description: t("widgets.modals.user.carInWaiting.uploadPhotosBeforeRent"),
          buttonText: t("widgets.modals.user.carInWaiting.tryAgain"),
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
    const res = await rentApi.uploadBeforeRent(formData);
    if (res.status === 200) {
      setIsLoading(false);
      setShowUploadPhoto(false);
      setResponseModal({
        isOpen: true,
        onClose: handleClose,
        type: "success",
        description: t("widgets.modals.user.carInWaiting.photosUploadedSuccessfully"),
        buttonText: t("widgets.modals.user.carInWaiting.tryAgain"),
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
        onClose: async () => {
          await refreshUser();
          onClose();
          setResponseModal(null);
        },
        type: "success",
        description: t("widgets.modals.user.carInWaiting.photosUploadedSuccessfully"),
        buttonText: t("widgets.modals.user.carInWaiting.tryAgain"),
        onButtonClick: async () => {
          await refreshUser();
          onClose();
          setResponseModal(null);
        },
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
          <Button onClick={handleRent} variant="secondary">
            {t("widgets.modals.carInWaiting.openCar")}
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
