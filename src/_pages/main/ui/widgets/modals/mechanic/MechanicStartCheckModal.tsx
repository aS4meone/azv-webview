import { CarStatus, ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { useResponseModal } from "@/shared/ui/modal";
import { useUserStore } from "@/shared/stores/userStore";
import { mechanicApi } from "@/shared/api/routes/mechanic";

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

  const handleStartInspection = async () => {
    try {
      const res = await mechanicApi.reserveCheckCar(car.id);
      if (res.status === 200) {
        showModal({
          type: "success",
          description: "Осмотр успешно принят в работу",
          buttonText: "Отлично",
          onClose: async () => {
            onClose();
            await refreshUser();
          },
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
    onClose();
    try {
      const res = await mechanicApi.acceptDelivery(car.rental_id);
      if (res.status === 200) {
        showModal({
          type: "success",
          description: "Доставка успешно принята",
          buttonText: "Отлично",
          onClose: async () => {
            await refreshUser();
          },
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

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
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

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={() => {
              if (car.status === CarStatus.pending) {
                handleStartInspection();
              } else {
                handleStartDelivery();
              }
            }}
          >
            {delivering ? "Начать доставку" : "Принять осмотр"}
          </Button>
        </div>
      </div>
    </div>
  );
};
