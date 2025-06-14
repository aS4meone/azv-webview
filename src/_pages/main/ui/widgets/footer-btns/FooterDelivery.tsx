import { IUser } from "@/shared/models/types/user";
import { CarInfoHeader, CarSpecs } from "../modals/ui";
import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";
import { useModal } from "@/shared/ui/modal";
import React from "react";
import { ICar } from "@/shared/models/types/car";
import { DeliveryData } from "@/shared/hooks/useCurrentDelivery";
import { createCarFromDeliveryData } from "@/shared/utils/deliveryUtils";

const FooterDelivery = ({
  user,
  deliveryData,
}: {
  user: IUser;
  deliveryData: DeliveryData;
}) => {
  const { showModal, hideModal } = useModal();

  // Создаем объект ICar из данных доставки
  const deliveryCar: ICar = createCarFromDeliveryData(deliveryData);

  const handleOpenModal = () => {
    showModal({
      children: handleCarInteraction({
        user,
        notRentedCar: deliveryCar,
        hideModal: () => {
          hideModal();
        },
        deliveryData,
        isDeliveryMode: true,
      }),
    });
  };

  return (
    <div className="absolute bottom-0 w-full flex flex-col gap-4">
      {/* Основная карточка */}
      <footer
        className="bg-white w-full rounded-t-[40px] p-6 flex flex-col gap-3"
        onClick={handleOpenModal}
      >
        <CarInfoHeader car={deliveryCar} />
        <CarSpecs car={deliveryCar} />
      </footer>
    </div>
  );
};

export default FooterDelivery;
