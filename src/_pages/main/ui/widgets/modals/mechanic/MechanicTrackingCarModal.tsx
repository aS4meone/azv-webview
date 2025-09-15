"use client";import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { useUserStore } from "@/shared/stores/userStore";
import { TrackingDataScreen } from "../../screens/tracking-screen/TrackingDataScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface MechanicTrackingCarModalProps {
  car: ICar;
  onClose: () => void;
}

export const MechanicTrackingCarModal = ({
  car,
  onClose,
}: MechanicTrackingCarModalProps) => {
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const [showDataScreen, setShowDataScreen] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    await refreshUser();
  };

  const handleCompleteTracking = async () => {
    try {
      // Удаляем ID машины из localStorage
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
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: t("mechanic.tracking.completionError"),
        buttonText: t("modal.error.tryAgain"),
        onClose: () => {},
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

          {/* Tracking Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">{t("mechanic.tracking.active")}</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              {t("mechanic.tracking.description")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button variant="outline" onClick={handleViewData}>
              {t("mechanic.tracking.viewData")}
            </Button>

            <Button variant="secondary" onClick={handleCompleteTracking}>
              {t("mechanic.tracking.completeTracking")}
            </Button>
          </div>
        </div>
      </div>

      {/* Экран данных слежки */}
      {showDataScreen && (
        <TrackingDataScreen
          car={car}
          onClose={() => setShowDataScreen(false)}
        />
      )}
    </>
  );
};
