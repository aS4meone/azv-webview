import { IUser } from "@/shared/models/types/user";

import { CarStatus, ICar } from "@/shared/models/types/car";
import { removeAllQueriesFromUrl } from "@/shared/utils/urlUtils";
import { MechanicStartCheckModal } from "../ui/widgets/modals/mechanic/MechanicStartCheckModal";
import { MechanicCarInWaitingModal } from "../ui/widgets/modals/mechanic/MechanicCarInWaitingModal";
import { MechanicInUseModal } from "../ui/widgets/modals/mechanic/MechanicInUseModal";
import { DeliveryData } from "@/shared/hooks/useCurrentDelivery";

export const mechaniRoleInteraction = ({
  user,
  notRentedCar,
  hideModal,
  deliveryData,
  isDeliveryMode,
}: {
  user: IUser;
  notRentedCar: ICar;
  hideModal: () => void;
  deliveryData?: DeliveryData | null;
  isDeliveryMode?: boolean;
}) => {
  if (isDeliveryMode && deliveryData) {
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

  // Если у механика нет аренды и нет доставки, он может принять новую задачу
  if (user.current_rental === null) {
    // Механик может принять осмотр автомобиля
    if (notRentedCar.status === CarStatus.pending) {
      console.log("Showing MechanicStartCheckModal for pending car");
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

    // Механик может принять доставку автомобиля
    if (notRentedCar.status === CarStatus.delivering) {
      console.log("Showing MechanicStartCheckModal for delivery car");
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
  }

  // Если у механика есть аренда (он уже работает) - обычная логика для осмотра
  if (user.current_rental !== null) {
    // Механик принял осмотр и ожидает начала
    if (user.current_rental.car_details.status === CarStatus.service) {
      console.log(
        "Showing MechanicCarInWaitingModal for inspection in service status"
      );
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

    // Механик работает с автомобилем (осмотр)
    if (user.current_rental.car_details.status === CarStatus.inUse) {
      console.log("Showing MechanicInUseModal for inspection in inUse status");
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
  }

  console.log("No modal to show");
  return null;
};
