import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { RentalPage } from "../../rental-screen";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import PushScreen from "@/shared/ui/push-screen";
import { RentalData } from "../../rental-screen/hooks/usePricingCalculator";
import { useResponseModal } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import { RentCarDto } from "@/shared/models/dto/rent.dto";
import { useUserStore } from "@/shared/stores/userStore";

interface UserStartCarModalProps {
  car: ICar;
  onClose: () => void;
}

export const UserStartCarModal = ({ car, onClose }: UserStartCarModalProps) => {
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const [showRentalPage, setShowRentalPage] = useState(false);

  const handleRent = async (rentalData: RentalData) => {
    onClose();
    try {
      const data: RentCarDto = {
        carId: rentalData.carId,
        duration: rentalData.duration,
        rentalType: rentalData.rentalType,
      };

      const res = await rentApi.reserveCar(data);
      if (res.status === 200) {
        showModal({
          type: "success",
          description: "Успешно забронированно",
          buttonText: "Отлично",
          onClose: async () => {
            await refreshUser();
            setShowRentalPage(false);
          },
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response.data.detail,
        buttonText: "Попробвать сново",
        onClose: () => {},
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
      {showRentalPage && (
        <PushScreen withOutStyles={true}>
          <RentalPage
            car={car}
            onBack={() => setShowRentalPage(false)}
            onRent={handleRent}
          />
        </PushScreen>
      )}

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
          <Button variant="secondary" onClick={() => setShowRentalPage(true)}>
            Забронировать авто
          </Button>
          <Button onClick={() => {}} variant="outline">
            Заказать доставку
          </Button>
        </div>
      </div>
    </div>
  );
};
