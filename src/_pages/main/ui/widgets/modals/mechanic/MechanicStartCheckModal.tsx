"use client";import { CarStatus, ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { useUserStore } from "@/shared/stores/userStore";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { openIn2GIS } from "@/shared/utils/urlUtils";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";

interface MechanicStartCheckModalProps {
  car: ICar;
  onClose: () => void;
}

export const MechanicStartCheckModal = ({
  car,
  onClose,
}: MechanicStartCheckModalProps) => {
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const delivering = car.status === CarStatus.delivering;
  const tracking = car.status === CarStatus.inUse;
  const { fetchCurrentDeliveryVehicle } = useVehiclesStore();

  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const [showDataScreen, setShowDataScreen] = useState(false);

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    try {
      await refreshUser();
      // Принудительно обновляем данные о доставке для механика
      await fetchCurrentDeliveryVehicle();
    } catch (error) {
      console.warn("Failed to refresh data on modal close:", error);
      // Continue with close even if refresh fails
    }
  };

  const handleStartInspection = async () => {
    try {
      const res = await mechanicApi.reserveCheckCar(car.id);
      if (res.status === 200) {
        setResponseModal({
          type: "success",
          isOpen: true,

          onButtonClick: handleClose,
          description: t("mechanic.inspection.acceptedInWork"),
          buttonText: t("mechanic.common.excellent"),
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

  const handleStartDelivery = async () => {
    try {
      const res = await mechanicApi.acceptDelivery(car.rental_id!);
      if (res.status === 200) {
        // Safely update delivery data with error handling
        try {
          await fetchCurrentDeliveryVehicle();
        } catch (error) {
          console.warn(
            "Failed to fetch current delivery vehicle after accepting delivery:",
            error
          );
          // Continue with success flow even if fetch fails
        }

        setResponseModal({
          type: "success",
          isOpen: true,
          onButtonClick: () => {
            handleClose();
          },
          description: t("mechanic.delivery.acceptedInWork"),
          buttonText: t("mechanic.common.excellent"),
          onClose: () => {
            handleClose();
          },
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

  const handleStartTracking = async () => {
    try {
      // Сохраняем ID машины в localStorage для слежки
      localStorage.setItem("tracking_car_id", car.id.toString());

      setResponseModal({
        type: "success",
        isOpen: true,

        onButtonClick: handleClose,
        description: t("mechanic.tracking.started"),
        buttonText: t("mechanic.common.excellent"),
        onClose: handleClose,
      });
    } catch (error) {
      console.log(error);
      setResponseModal({
        type: "error",
        isOpen: true,

        description: t("mechanic.tracking.startError"),
        buttonText: t("modal.error.tryAgain"),
        onButtonClick: handleClose,
        onClose: handleClose,
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

        <CustomResponseModal
          isOpen={responseModal?.isOpen || false}
          onClose={responseModal?.onClose || (() => { })}
          title={responseModal?.title || ""}
          description={responseModal?.description || ""}
          buttonText={responseModal?.buttonText || ""}
          onButtonClick={responseModal?.onButtonClick || (() => { })}
        />

        <CarImageCarousel car={car} rounded={true} />

        {/* Content */}
        <div className="p-6 pt-4 space-y-6">
          {/* Car Title and Plate */}
          <CarInfoHeader car={car} />

          {/* Car Specs */}
          <CarSpecs car={car} />

          {/* Action Buttons */}
          <div className="space-y-3 flex flex-col gap-3">
            {car.status === CarStatus.pending && (
              <Button variant="outline" onClick={handleViewData}>
                {t("mechanic.tracking.viewData")}
              </Button>
            )}

            {/* Кнопка для просмотра в 2GIS */}
            {car.delivery_coordinates && (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    openIn2GIS(
                      car.latitude,
                      car.longitude
                    )
                  }
                  className="flex items-center justify-center gap-2"
                >
                  <FaCar className="w-4 h-4" />
                  {t("mechanic.vehicle.carPoint")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    openIn2GIS(
                      car.delivery_coordinates!.latitude,
                      car.delivery_coordinates!.longitude
                    )
                  }
                  className="flex items-center justify-center gap-2"
                >
                  <FaMapMarkerAlt className="w-4 h-4" />
                  {t("mechanic.vehicle.deliveryPoint")}
                </Button>
              </>

            )}

            <Button
              variant="secondary"
              onClick={() => {
                if (car.status === CarStatus.pending) {
                  handleStartInspection();
                } else if (car.status === CarStatus.delivering) {
                  handleStartDelivery();
                } else if (car.status === CarStatus.inUse) {
                  handleStartTracking();
                }
              }}
            >
              {delivering
                ? t("mechanic.delivery.startDelivery")
                : tracking
                  ? t("mechanic.tracking.startTracking")
                  : t("mechanic.inspection.acceptInspection")}
            </Button>
          </div>
        </div>
      </div>

      {showDataScreen && (
        <DescriptionScreen car={car} onClose={() => setShowDataScreen(false)} />
      )}
    </>
  );
};
