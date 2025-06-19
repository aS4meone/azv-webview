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
    return (
      <MechanicInUseModal
        user={user}
        onClose={() => {
          hideModal();
          removeAllQueriesFromUrl();
        }}
      />
    );
  }

  return null;
};
