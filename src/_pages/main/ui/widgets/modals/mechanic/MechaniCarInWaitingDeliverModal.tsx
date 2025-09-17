"use client";

import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { IUser } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import {
  baseConfig,
  DELIVERY_UPLOAD,
  usePhotoUpload,
} from "@/shared/contexts/PhotoUploadContext";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { MechanicWaitingTimer } from "../../timers/MechanicTimer";
import { ICar } from "@/shared/models/types/car";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";

interface MechaniCarInWaitingDeliverModalProps {
  user: IUser;
  notHaveCar: ICar;
  onClose: () => void;
}

export const MechaniCarInWaitingDeliverModal = ({
  user,
  notHaveCar,
  onClose,
}: MechaniCarInWaitingDeliverModalProps) => {
  const t = useTranslations();
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { setUploadRequired } = usePhotoUpload();
  const { fetchCurrentDeliveryVehicle, forceRefreshMechanicData } =
    useVehiclesStore();
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const car = notHaveCar;

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    try {
      await refreshUser();
      try {
        await fetchCurrentDeliveryVehicle();
      } catch {
        console.log("No current delivery - this is expected");
      }
      await forceRefreshMechanicData();
    } catch (error) {
      console.warn("Failed to refresh data on modal close:", error);
    }
  };

  async function handleStartDelivery() {
    try {
      const res = await mechanicApi.startDeliveryCar();
      if (res.status === 200) {
        setUploadRequired(DELIVERY_UPLOAD, true);
        setResponseModal({
          type: "success",
          isOpen: true,
          title: t("mechanic.delivery.successfullyStarted"),
          description: t("mechanic.delivery.uploadPhotosBeforeStart"),
          buttonText: t("mechanic.common.excellent"),
          onButtonClick: async () => {
            await refreshUser();
            setShowUploadPhoto(true);
            handleClose();
          },
          onClose: async () => {
            await refreshUser();
            setShowUploadPhoto(true);
            handleClose();
          },
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response.data.detail,
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  }

  const handleUploadBeforeDelivery = async (files: {
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
      const res = await mechanicApi.uploadBeforeDelivery(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setShowUploadPhoto(false);
        setResponseModal({
          type: "success",
          isOpen: true,
          title: t("mechanic.delivery.photosUploaded"),
          description: t("mechanic.delivery.photosUploadedSuccessfully"),
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
          error.response?.data?.detail || t("mechanic.delivery.photoUploadError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <UploadPhoto
        config={baseConfig}
        onPhotoUpload={handleUploadBeforeDelivery}
        isLoading={isLoading}
        isOpen={showUploadPhoto}
        onClose={() => setShowUploadPhoto(false)}
      />

      <CustomResponseModal
        isOpen={responseModal?.isOpen || false}
        onClose={responseModal?.onClose || (() => {})}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
        onButtonClick={responseModal?.onButtonClick || (() => {})}
      />

      {/* Таймер ожидания */}
      <div className="absolute -top-16 right-4 left-4 z-10">
        <MechanicWaitingTimer
          user={user}
          deCar={notHaveCar}
          deReservationTime={notHaveCar.reservation_time}
        />
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
            {t("mechanic.delivery.preparationTitle")}
          </h4>
          <h4 className="text-[18px] text-[#191919]">
            {t("mechanic.delivery.preparationDescription")}
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleStartDelivery} variant="secondary">
            {t("mechanic.delivery.startDelivery")}
          </Button>
        </div>
      </div>
    </div>
  );
};
