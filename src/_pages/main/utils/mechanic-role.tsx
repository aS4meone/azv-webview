import { IUser } from "@/shared/models/types/user";

import { CarStatus, ICar } from "@/shared/models/types/car";
import { removeAllQueriesFromUrl } from "@/shared/utils/urlUtils";
import { MechanicStartCheckModal } from "../ui/widgets/modals/mechanic/MechanicStartCheckModal";
import { MechanicCarInWaitingModal } from "../ui/widgets/modals/mechanic/MechanicCarInWaitingModal";
import { MechanicInUseModal } from "../ui/widgets/modals/mechanic/MechanicInUseModal";
import { MechanicCarIsFreeModal } from "../ui/widgets/modals/mechanic/MechanicCarIsFreeModal";
import { MechaniCarInWaitingDeliverModal } from "../ui/widgets/modals/mechanic/MechaniCarInWaitingDeliverModal";
import { MechanicDeliveryInUseModal } from "../ui/widgets/modals/mechanic/MechanicDeliveryInUseModal";
import { MechanicTrackingCarModal } from "../ui/widgets/modals/mechanic/MechanicTrackingCarModal";

export const mechaniRoleInteraction = ({
  user,
  notRentedCar,
  hideModal,
}: {
  user: IUser;
  notRentedCar: ICar;
  hideModal: () => void;
}) => {
  const trackingCarId = localStorage.getItem("tracking_car_id");

  if (trackingCarId) {
    return (
      <MechanicTrackingCarModal
        car={notRentedCar}
        currentMechanicId={user.id}
        onClose={() => {
          hideModal();
          removeAllQueriesFromUrl();
        }}
      />
    );
  }

  if (user.current_rental === null && notRentedCar.status === CarStatus.free) {
    return (
      <MechanicCarIsFreeModal
        car={notRentedCar}
        onClose={() => {
          hideModal();
          removeAllQueriesFromUrl();
        }}
      />
    );
  }

  if (
    user.current_rental === null &&
    notRentedCar.status === CarStatus.deliveryReserved
  ) {
    return (
      <MechaniCarInWaitingDeliverModal
        user={user}
        notHaveCar={notRentedCar}
        onClose={() => {
          hideModal();
          removeAllQueriesFromUrl();
        }}
      />
    );
  }

  if (
    user.current_rental === null &&
    notRentedCar.status === CarStatus.deliveryInProgress
  ) {
    return (
      <MechanicDeliveryInUseModal
        user={user}
        notRentedCar={notRentedCar}
        onClose={() => {
          hideModal();
          removeAllQueriesFromUrl();
        }}
      />
    );
  }

  if (user.current_rental === null) {
    // Если нажали на машину в IN_USE - это слежка или осмотр
    if (notRentedCar.status === CarStatus.inUse) {
      return (
        <MechanicTrackingCarModal
          car={notRentedCar}
          currentMechanicId={user.id}
          onClose={() => {
            hideModal();
            removeAllQueriesFromUrl();
          }}
        />
      );
    }
    
    return (
      <MechanicStartCheckModal
        car={notRentedCar}
        onClose={() => {
          hideModal();
          removeAllQueriesFromUrl();
        }}
      />
    );
  }

  if (user.current_rental !== null) {
    if (user.current_rental.car_details.status === CarStatus.service) {
      return (
        <MechanicCarInWaitingModal
          user={user}
          onClose={() => {
            hideModal();
            removeAllQueriesFromUrl();
          }}
        />
      );
    }
    
    // Проверяем, это rental механика или чужой
    const car = user.current_rental.car_details;
    const isMechanicRental = car.current_renter_details?.id === user.id;
    
    if (isMechanicRental) {
      // Это rental механика - показываем управление
      return (
        <MechanicInUseModal
          user={user}
          onClose={() => {
            hideModal();
            removeAllQueriesFromUrl();
          }}
        />
      );
    } else {
      // Это чужой rental - показываем слежку
      return (
        <MechanicTrackingCarModal
          car={car}
          currentMechanicId={user.id}
          onClose={() => {
            hideModal();
            removeAllQueriesFromUrl();
          }}
        />
      );
    }
  }

  return null;
};
