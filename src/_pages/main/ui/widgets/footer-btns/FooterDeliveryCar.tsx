import { IUser } from "@/shared/models/types/user";
import { CarInfoHeader, CarSpecs } from "../modals/ui";
import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";
import { useModal } from "@/shared/ui/modal";
import { ICar } from "@/shared/models/types/car";
import { useDeliveryPoint } from "@/shared/contexts/DeliveryPointContext";
import { ArrowLocationIcon } from "@/shared/icons/ui/ArrowLocationIcon";
import { Button } from "@/components/ui/button";
import React from "react";
import { useMap } from "@vis.gl/react-google-maps";

const FooterDeliveryCar = ({ user, car }: { user: IUser; car: ICar }) => {
  const { showModal, hideModal } = useModal();
  const { setDeliveryPoint, setIsVisible } = useDeliveryPoint();
  const map = useMap();

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

  const handleGoToDeliveryPoint = () => {
    if (car.delivery_coordinates) {
      setDeliveryPoint(car.delivery_coordinates);
      setIsVisible(true);
      map?.setCenter({
        lat: car.delivery_coordinates.latitude,
        lng: car.delivery_coordinates.longitude,
      });
      map?.setZoom(16);
    }
  };

  const hasDeliveryCoordinates = Boolean(
    car.delivery_coordinates?.latitude && car.delivery_coordinates?.longitude
  );

  // Устанавливаем точку доставки один раз при монтировании компонента
  React.useEffect(() => {
    if (hasDeliveryCoordinates && car.delivery_coordinates) {
      setDeliveryPoint(car.delivery_coordinates);
      setIsVisible(true);
    }
  }, [
    hasDeliveryCoordinates,
    car.delivery_coordinates,
    setDeliveryPoint,
    setIsVisible,
  ]);

  return (
    <div className="absolute bottom-0 w-full flex flex-col gap-4">
      <footer className="bg-white w-full rounded-t-[40px] p-6 flex flex-col gap-3">
        <div onClick={handleOpenModal} className="cursor-pointer">
          <CarInfoHeader car={car} />
          <CarSpecs car={car} />
        </div>

        {hasDeliveryCoordinates && (
          <div className="flex justify-center pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToDeliveryPoint}
              className="flex items-center gap-2"
            >
              <ArrowLocationIcon color="#374151" className="w-4 h-4" />
              <span className="text-sm font-medium">
                Перейти к точке доставки
              </span>
            </Button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default FooterDeliveryCar;
