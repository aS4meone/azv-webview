import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";

import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { ResponseBottomModalProps } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import { RentCarDto } from "@/shared/models/dto/rent.dto";
import { useUserStore } from "@/shared/stores/userStore";
import { RentalData } from "../../screens/rental-screen/hooks/usePricingCalculator";
import { RentalPage } from "../../screens/rental-screen";
import { ROUTES } from "@/shared/constants/routes";
import { useFormatCarInUrl } from "@/shared/utils/formatCarInUrl";
import { DeliveryAddressScreen } from "../../screens/delivery-screen/DeliveryAddressScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface UserStartCarModalProps {
  car: ICar;
  onClose: () => void;
}

export const UserStartCarModal = ({ car, onClose }: UserStartCarModalProps) => {
  const { refreshUser } = useUserStore();
  const [showRentalPage, setShowRentalPage] = useState(false);
  const [showAddressScreen, setShowAddressScreen] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const { redirectToCar } = useFormatCarInUrl({
    car: {
      id: car.id,
      lat: car.latitude,
      lng: car.longitude,
    },
    route: ROUTES.WALLET,
  });
  const [deliveryAddress, setDeliveryAddress] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleClose = async () => {
    setResponseModal(null);
    await refreshUser();
    onClose();
  };

  const handleRent = async (rentalData: RentalData) => {
    try {
      const data: RentCarDto = {
        carId: rentalData.carId,
        duration: rentalData.duration,
        rentalType: rentalData.rentalType,
      };

      const res = await rentApi.reserveCar(data);
      if (res.status === 200) {
        setResponseModal({
          isOpen: true,
          onClose: handleClose,
          type: "success",
          title: "Успешно забронированно",
          description: "Успешно забронированно",
          buttonText: "Отлично",
          onButtonClick: handleClose,
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };
      console.log(apiError.response.data.detail);

      if (
        apiError.response.data.detail.includes("Пожалуйста, пополните счёт")
      ) {
        setResponseModal({
          isOpen: true,
          onClose: handleClose,
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Пополнить баланс",
          onButtonClick: () => {
            redirectToCar();
          },
        });
      } else {
        setResponseModal({
          isOpen: true,
          onClose: handleClose,
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Повторить попытку",
          onButtonClick: handleClose,
        });
      }
    }
  };

  const handleDelivery = async (rentalData: RentalData) => {
    if (!deliveryAddress) return;

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
        setResponseModal({
          isOpen: true,
          onClose: handleClose,
          type: "success",
          title: "Успешно забронированно",
          description: "Доставка успешно заказана",
          buttonText: "Отлично",
          onButtonClick: handleClose,
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };
      setResponseModal({
        isOpen: true,
        onClose: handleClose,
        type: "error",
        title: "Ошибка",
        description: apiError.response.data.detail,
        buttonText: "Попробовать снова",
        onButtonClick: handleClose,
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
        handleClose();
        setResponseModal({
          isOpen: true,
          onClose: handleClose,
          type: "success",
          title: "Успешно забронированно",
          description: "Успешно забронированно",
          buttonText: "Отлично",
          onButtonClick: handleClose,
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
        setResponseModal({
          isOpen: true,
          onClose: handleClose,
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Пополнить",
          onButtonClick: () => {
            redirectToCar();
          },
        });
      } else {
        setResponseModal({
          isOpen: true,
          onClose: handleClose,
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Попробовать снова",
          onButtonClick: () => {
            setShowRentalPage(true);
          },
        });
      }
    }
  };

  const handleAddressSelected = (lat: number, lng: number, address: string) => {
    setDeliveryAddress({ lat, lng, address });
    setShowAddressScreen(false);
    setShowRentalPage(true);
  };

  const handleDeliveryClick = () => {
    setIsDelivery(true);
    setShowAddressScreen(true);
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
      <CustomResponseModal
        onButtonClick={handleClose}
        isOpen={!!responseModal}
        onClose={handleClose}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
      />
      {showAddressScreen && (
        <CustomPushScreen
          direction="bottom"
          isOpen={showAddressScreen}
          onClose={() => {
            setShowAddressScreen(false);
            setIsDelivery(false);
          }}
          isCloseable={false}
          className="p-0"
        >
          <DeliveryAddressScreen
            onBack={() => {
              setShowAddressScreen(false);
              setIsDelivery(false);
            }}
            onAddressSelected={handleAddressSelected}
          />
        </CustomPushScreen>
      )}

      {/* Rental Page */}
      {showRentalPage && (
        <CustomPushScreen
          direction="bottom"
          className="p-0"
          isOpen={showRentalPage}
          onClose={() => {
            setShowRentalPage(false);
            if (isDelivery) {
              setShowAddressScreen(true);
            }
          }}
        >
          <RentalPage
            isDelivery={isDelivery}
            car={car}
            onRent={isDelivery ? handleDelivery : handleRent}
            deliveryAddress={deliveryAddress?.address}
          />
        </CustomPushScreen>
      )}

      {/* Car Image Carousel */}
      <CarImageCarousel car={car} />

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
              setIsDelivery(false);
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
