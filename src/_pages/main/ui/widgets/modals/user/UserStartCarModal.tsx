import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";

import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import PushScreen from "@/shared/ui/push-screen";
import { useResponseModal } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import { RentCarDto } from "@/shared/models/dto/rent.dto";
import { useUserStore } from "@/shared/stores/userStore";
import { RentalData } from "../../screens/rental-screen/hooks/usePricingCalculator";
import { RentalPage } from "../../screens/rental-screen";

interface UserStartCarModalProps {
  car: ICar;
  onClose: () => void;
}

export const UserStartCarModal = ({ car, onClose }: UserStartCarModalProps) => {
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const [showRentalPage, setShowRentalPage] = useState(false);
  const [, setShowAddressScreen] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

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
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };
      showModal({
        type: "error",
        description: apiError.response.data.detail,
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleDelivery = async (rentalData: RentalData) => {
    if (!deliveryAddress) return;

    onClose();
    try {
      const data: RentCarDto = {
        carId: rentalData.carId,
        duration: rentalData.duration,
        rentalType: rentalData.rentalType,
      };

      const res = await rentApi.reserveDelivery(
        car.id,
        data,
        deliveryAddress.lng,
        deliveryAddress.lat
      );

      if (res.status === 200) {
        showModal({
          type: "success",
          description: "Доставка успешно заказана",
          buttonText: "Отлично",
          onClose: async () => {
            await refreshUser();
            setShowRentalPage(false);
            setShowAddressScreen(false);
            setDeliveryAddress(null);
          },
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };
      showModal({
        type: "error",
        description: apiError.response.data.detail,
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleOwnerRent = async () => {
    onClose();
    try {
      const data: RentCarDto = {
        carId: car.id,
        duration: 0,
        rentalType: "minutes",
      };

      const res = await rentApi.reserveCar(data);
      if (res.status === 200) {
        showModal({
          type: "success",
          description: "Успешно забронированно",
          buttonText: "Отлично",
          onClose: async () => {
            await refreshUser();
          },
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };
      console.log(
        apiError,
        apiError.response.data.detail,
        apiError.response.data.detail.startsWith("Для")
      );
      if (apiError.response.data.detail.startsWith("Для")) {
        showModal({
          type: "error",
          description: apiError.response.data.detail,
          buttonText: "Пополнить",
          onClose: () => {},
        });
      } else {
        showModal({
          type: "error",
          description: apiError.response.data.detail,
          buttonText: "Попробовать снова",
          onClose: () => {},
        });
      }
    }
  };

  // const handleAddressSelected = (lat: number, lng: number, address: string) => {
  //   setDeliveryAddress({ lat, lng, address });
  //   setShowAddressScreen(false);
  //   setShowRentalPage(true);
  // };

  const handleDeliveryClick = () => {
    setIsDelivery(true);
    setShowAddressScreen(true);
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
      {/* Address Selection Screen */}
      {/* {showAddressScreen && (
        <PushScreen withOutStyles={true}>
          <DeliveryAddressScreen
            onBack={() => {
              setShowAddressScreen(false);
              setIsDelivery(false);
            }}
            onAddressSelected={handleAddressSelected}
          />
        </PushScreen>
      )} */}

      {/* Rental Page */}
      {showRentalPage && (
        <PushScreen withOutStyles={true}>
          <RentalPage
            isDelivery={isDelivery}
            car={car}
            onBack={() => {
              setShowRentalPage(false);
              if (isDelivery) {
                setShowAddressScreen(true);
              }
            }}
            onRent={isDelivery ? handleDelivery : handleRent}
            deliveryAddress={deliveryAddress?.address}
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
          <Button
            variant="secondary"
            onClick={() => {
              if (car.owned_car) {
                handleOwnerRent();
              } else {
                setShowRentalPage(true);
              }
            }}
          >
            {car.owned_car ? "Снять с аренды" : "Забронировать авто"}
          </Button>
          <Button onClick={handleDeliveryClick} variant="outline">
            Заказать доставку
          </Button>
        </div>
      </div>
    </div>
  );
};
