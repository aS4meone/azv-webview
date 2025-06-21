import { CarStatus, ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps, useResponseModal } from "@/shared/ui/modal";
import { useUserStore } from "@/shared/stores/userStore";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface MechanicStartCheckModalProps {
  car: ICar;
  onClose: () => void;
}

export const MechanicStartCheckModal = ({
  car,
  onClose,
}: MechanicStartCheckModalProps) => {
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const delivering = car.status === CarStatus.delivering;
  const tracking = car.status === CarStatus.inUse;
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const [showDataScreen, setShowDataScreen] = useState(false);

  const handleClose = async () => {
    setResponseModal(null);
    onClose();
    await refreshUser();
  };

  const handleStartInspection = async () => {
    try {
      const res = await mechanicApi.reserveCheckCar(car.id);
      if (res.status === 200) {
        setResponseModal({
          type: "success",
          isOpen: true,
          title: "Осмотр успешно принят в работу",
          onButtonClick: handleClose,
          description: "Осмотр успешно принят в работу",
          buttonText: "Отлично",
          onClose: handleClose,
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response.data.detail,
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleStartDelivery = async () => {
    try {
      const res = await mechanicApi.acceptDelivery(car.rental_id!);
      if (res.status === 200) {
        setResponseModal({
          type: "success",
          isOpen: true,
          title: "Доставка успешно принята в работу",
          onButtonClick: handleClose,
          description: "Доставка успешно принята в работу",
          buttonText: "Отлично",
          onClose: handleClose,
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response.data.detail,
        buttonText: "Попробовать снова",
        onClose: () => {},
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
        title: "Слежка начата",
        onButtonClick: handleClose,
        description: "Слежка начата",
        buttonText: "Отлично",
        onClose: handleClose,
      });
    } catch (error) {
      console.log(error);
      setResponseModal({
        type: "error",
        isOpen: true,
        title: "Ошибка при начале слежки",
        description: "Ошибка при начале слежки",
        buttonText: "Попробовать снова",
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
          onClose={responseModal?.onClose || (() => {})}
          title={responseModal?.title || ""}
          description={responseModal?.description || ""}
          buttonText={responseModal?.buttonText || ""}
          onButtonClick={responseModal?.onButtonClick || (() => {})}
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
                Посмотреть данные
              </Button>
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
                ? "Начать доставку"
                : tracking
                ? "Начать слежку"
                : "Принять осмотр"}
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
