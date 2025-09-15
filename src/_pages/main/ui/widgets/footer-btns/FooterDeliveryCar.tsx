import { IUser } from "@/shared/models/types/user";
import { CarInfoHeader, CarSpecs } from "../modals/ui";
import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";
import { useModal } from "@/shared/ui/modal";
import { ICar } from "@/shared/models/types/car";
import { Button } from "@/components/ui/button";
import React from "react";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { IoChevronUp } from "react-icons/io5";
import { useTranslations } from "next-intl";

import { openIn2GIS } from "@/shared/utils/urlUtils";

const FooterDeliveryCar = ({ user, car }: { user: IUser; car: ICar }) => {
  const { showModal, hideModal } = useModal();
  const t = useTranslations();

  const handleOpenModal = () => {
    showModal({
      children: handleCarInteraction({
        user,
        notRentedCar: car,
        hideModal: () => {
          hideModal();
        },
      }),
    });
  };

  const hasDeliveryCoordinates = Boolean(
    car.delivery_coordinates?.latitude && car.delivery_coordinates?.longitude
  );

  return (
    <div className="absolute bottom-0 w-full flex flex-col gap-4">
      <footer className="bg-white w-full rounded-t-[40px] p-6 flex flex-col gap-3 relative">
        {/* Иконка "вверх" */}
        <div 
          onClick={handleOpenModal} 
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer z-10"
        >
          <IoChevronUp className="w-6 h-6 text-gray-700" />
        </div>
        
        <div onClick={handleOpenModal} className="cursor-pointer">
        
          <CarInfoHeader car={car} />
          <CarSpecs car={car} />
        </div>

        {hasDeliveryCoordinates && (
          <div className="flex justify-center pt-2 border-t border-gray-100 gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={handleGoToDeliveryPoint}
              className="flex items-center gap-2"
            >
              <ArrowLocationIcon color="#374151" className="w-4 h-4" />
              <span className="text-sm font-medium">
                Перейти к точке доставки
              </span>
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openIn2GIS(
                  car.latitude,
                  car.longitude
                )
              }
              className="flex items-center gap-2"
            >
              <FaCar className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">{t("widgets.modals.mechanic.startCheck.carPoint")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openIn2GIS(
                  car.delivery_coordinates!.latitude,
                  car.delivery_coordinates!.longitude
                )
              }
              className="flex items-center gap-2"
            >
              <FaMapMarkerAlt className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">{t("widgets.modals.mechanic.startCheck.deliveryPoint")}</span>
            </Button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default FooterDeliveryCar;
