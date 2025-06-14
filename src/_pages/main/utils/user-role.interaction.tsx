import { IUser } from "@/shared/models/types/user";
import {
  UserCarInWaitingModal,
  UserInUseModal,
  UserStartCarModal,
  UserDeliveryModal,
} from "../ui/widgets/modals";
import { CarStatus, ICar } from "@/shared/models/types/car";
import { removeAllQueriesFromUrl } from "@/shared/utils/urlUtils";
import { RentalStatus } from "@/shared/models/types/current-rental";

export const userRoleInteraction = ({
  user,
  notRentedCar,
  hideModal,
}: {
  user: IUser;
  notRentedCar: ICar;
  hideModal: () => void;
}) => {
  if (user.current_rental === null) {
    return (
      <UserStartCarModal
        car={notRentedCar}
        onClose={() => {
          hideModal();
          removeAllQueriesFromUrl();
        }}
      />
    );
  }

  if (user.current_rental.rental_details.status === RentalStatus.DELIVERING) {
    const deliveryStatus = user.current_rental.rental_details
      .delivery_in_progress
      ? "in_progress"
      : "searching_driver";

    return (
      <UserDeliveryModal
        car={user.current_rental.car_details}
        onClose={hideModal}
        deliveryStatus={deliveryStatus}
      />
    );
  }

  if (user.current_rental.car_details.status === CarStatus.inUse) {
    return <UserInUseModal user={user} onClose={hideModal} />;
  }

  if (
    user.current_rental !== null &&
    user.current_rental.rental_details.status === RentalStatus.RESERVED
  ) {
    return <UserCarInWaitingModal user={user} onClose={hideModal} />;
  }

  if (user.current_rental.rental_details.status === RentalStatus.IN_USE) {
    return <UserInUseModal user={user} onClose={hideModal} />;
  }

  return null;
};
