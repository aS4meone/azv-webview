import { CarStatus, ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { useResponseModal } from "@/shared/ui/modal";
import { useUserStore } from "@/shared/stores/userStore";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";

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

  const [showDataScreen, setShowDataScreen] = useState(false);
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
    try {
      const res = await mechanicApi.acceptDelivery(car.rental_id!);
      if (res.status === 200) {
        showModal({
          type: "success",
          description: "Доставка успешно принята в работу",
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

  const handleStartTracking = async () => {
    try {
      // Сохраняем ID машины в localStorage для слежки
      localStorage.setItem("tracking_car_id", car.id.toString());

      showModal({
        type: "success",
        description: "Слежка начата",
        buttonText: "Отлично",
        onClose: async () => {
          onClose();
          await refreshUser();
        },
      });
    } catch (error) {
      console.log(error);
      showModal({
        type: "error",
        description: "Ошибка при начале слежки",
        buttonText: "Попробовать снова",
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
