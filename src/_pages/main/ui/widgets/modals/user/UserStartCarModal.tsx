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
import { DeliveryAddressScreen } from "../../screens/delivery-screen/DeliveryAddressScreen";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";
import { WalletPage } from "@/_pages/wallet";
import { ContractModal } from "./ContractModal";

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

  const [showWalletPage, setShowWalletPage] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "rent" | "delivery";
    data: RentalData;
  } | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleClose = async () => {
    setResponseModal(null);
    await refreshUser();
    setShowWalletPage(false);
    setShowAddressScreen(false);
    setShowRentalPage(false);
  };

  const handleContractAccept = async () => {
    setShowContractModal(false);

    if (pendingAction) {
      if (pendingAction.type === "rent") {
        await executeRent(pendingAction.data);
      } else if (pendingAction.type === "delivery") {
        await executeDelivery(pendingAction.data);
      }
      setPendingAction(null);
    }
  };

  const handleContractReject = () => {
    setShowContractModal(false);
    setPendingAction(null);
    // Возвращаемся на страницу аренды
    setShowRentalPage(true);
  };

  const handleContractClose = () => {
    setShowContractModal(false);
    setPendingAction(null);
    // Возвращаемся на страницу аренды
    setShowRentalPage(true);
  };

  const handleRent = async (rentalData: RentalData) => {
    setPendingAction({ type: "rent", data: rentalData });
    setShowContractModal(true);
  };

  const executeRent = async (rentalData: RentalData) => {
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
          onClose: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
          type: "success",

          description: "Успешно забронированно",
          buttonText: "Отлично",
          onButtonClick: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
        });
      }
    } catch (error: unknown) {
      const apiError = error as { response: { data: { detail: string } } };
      console.log(apiError.response.data.detail);

      if (
        apiError.response.data.detail.includes("Пожалуйста, пополните счёт")
      ) {
        setShowRentalPage(false);
        if (isDelivery) {
          setShowAddressScreen(true);
        }
        setResponseModal({
          isOpen: true,
          onClose: () => {
            setShowWalletPage(false);
          },
          type: "error",
          title: "Ошибка",
          description: apiError.response.data.detail,
          buttonText: "Пополнить баланс",
          onButtonClick: () => {
            setShowWalletPage(true);
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

    // Показываем контракт перед доставкой
    setPendingAction({ type: "delivery", data: rentalData });
    setShowContractModal(true);
  };

  const executeDelivery = async (rentalData: RentalData) => {
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
          onClose: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
          type: "success",
          description: "Доставка успешно закзана",
          buttonText: "Отлично",
          onButtonClick: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
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
            setShowWalletPage(true);
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
          onClose: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
          type: "success",
          description: "Успешно забронированно",
          buttonText: "Отлично",
          onButtonClick: async () => {
            await refreshUser();
            onClose();
            setResponseModal(null);
          },
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
        onButtonClick={responseModal?.onButtonClick || handleClose}
        isOpen={!!responseModal}
        onClose={handleClose}
        type={responseModal?.type || "success"}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
      />

      <CustomPushScreen
        direction="bottom"
        isOpen={showWalletPage}
        onClose={() => {
          setShowWalletPage(false);
          console.log("close wallet page");
        }}
        className="pt-12"
      >
        <WalletPage />
      </CustomPushScreen>

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

      {/* Contract Modal */}
      <ContractModal
        isOpen={showContractModal}
        onClose={handleContractClose}
        onAccept={handleContractAccept}
        onReject={handleContractReject}
        title={"Договор аренды"}
      />
    </div>
  );
};
