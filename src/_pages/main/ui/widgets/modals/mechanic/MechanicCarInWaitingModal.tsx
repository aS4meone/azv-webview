"use client"; import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { IUser } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import {
  baseConfig,
  SERVICE_UPLOAD,
  usePhotoUpload,
} from "@/shared/contexts/PhotoUploadContext";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { MechanicWaitingTimer } from "../../timers/MechanicTimer";
import { CarStatus } from "@/shared/models/types/car";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface MechanicCarInWaitingModalProps {
  user: IUser;
  onClose: () => void;
}

export const MechanicCarInWaitingModal = ({
  user,
  onClose,
}: MechanicCarInWaitingModalProps) => {
  const t = useTranslations();
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { setUploadRequired } = usePhotoUpload();
  const [showDataScreen, setShowDataScreen] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const car = user.current_rental!.car_details;

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    await refreshUser();
  };

  async function handleStartInspection() {
    try {
      const res = await mechanicApi.startCheckCar();
      if (res.status === 200) {
        setUploadRequired(SERVICE_UPLOAD, true);
        setResponseModal({
          type: "success",
          isOpen: true,
          title: t("mechanic.inspection.successfullyStarted"),
          description: t("mechanic.inspection.uploadPhotosBeforeStart"),
          buttonText: t("mechanic.common.excellent"),
          onButtonClick: async () => {
            await refreshUser();
            setShowUploadPhoto(true);
            handleClose();
          },
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

  const handleCancelInspection = async () => {
    try {
      const res = await mechanicApi.cancelCheckCar();
      if (res.status === 200) {
        setResponseModal({
          type: "success",
          isOpen: true,
          description: t("mechanic.inspection.successfullyCancelled"),
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
  };

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
        setShowUploadPhoto(false);
        setResponseModal({
          type: "success",
          isOpen: true,
          title: t("mechanic.inspection.photosUploaded"),
          description: t("mechanic.inspection.photosUploadedSuccessfully"),
          buttonText: t("mechanic.common.excellent"),
          onButtonClick: handleClose,
          onClose: handleClose,
        });
      }
    } catch (error) {
      setIsLoading(false);
      showModal({
        type: "error",
        description:
          error.response?.data?.detail || t("mechanic.inspection.photoUploadError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => { },
      });
    }
  };

  const handleViewData = () => {
    setShowDataScreen(true);
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <UploadPhoto
        config={baseConfig}
        onPhotoUpload={handleUploadBeforeInspection}
        isLoading={isLoading}
        isOpen={showUploadPhoto}
        onClose={() => setShowUploadPhoto(false)}
      />

      <CustomResponseModal
        isOpen={responseModal?.isOpen || false}
        onClose={responseModal?.onClose || (() => { })}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
        onButtonClick={responseModal?.onButtonClick || (() => { })}
      />

      {/* Таймер ожидания */}
      <div className="absolute -top-16 right-4 left-4 z-10">
        <MechanicWaitingTimer user={user} />
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
            {t("mechanic.inspection.preparationTitle")}
          </h4>
          <h4 className="text-[18px] text-[#191919]">
            {t("mechanic.inspection.preparationDescription")}
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {car.status === CarStatus.service && (
            <Button variant="outline" onClick={handleViewData}>
              {t("mechanic.inspection.viewData")}
            </Button>
          )}

          <Button variant="outline" onClick={handleCancelInspection}>
            {t("mechanic.inspection.cancelInspection")}
          </Button>
          <Button onClick={handleStartInspection} variant="secondary">
            {t("mechanic.inspection.startInspection")}
          </Button>
        </div>
      </div>

      {showDataScreen && (
        <DescriptionScreen car={car} onClose={() => setShowDataScreen(false)} />
      )}
    </div>
  );
};
