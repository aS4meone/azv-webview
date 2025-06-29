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
  console.log("[userRoleInteraction] Called with:", {
    hasRental: !!user.current_rental,
    rentalStatus: user.current_rental?.rental_details.status,
    carStatus: user.current_rental?.car_details.status,
  });

  if (user.current_rental === null) {
    console.log("[userRoleInteraction] No rental - showing UserStartCarModal");
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

  if (
    user.current_rental.rental_details.status === RentalStatus.DELIVERING ||
    user.current_rental.rental_details.status ===
      RentalStatus.DELIVERY_RESERVED ||
    user.current_rental.rental_details.status ===
      RentalStatus.DELIVERY_IN_PROGRESS
  ) {
    console.log(
      "[userRoleInteraction] Delivery status detected - showing UserDeliveryModal"
    );
    return (
      <UserDeliveryModal
        car={user.current_rental.car_details}
        onClose={hideModal}
      />
    );
  }

  if (
    user.current_rental !== null &&
    user.current_rental.rental_details.status === RentalStatus.RESERVED
  ) {
    console.log(
      "[userRoleInteraction] RESERVED status - showing UserCarInWaitingModal"
    );
    return <UserCarInWaitingModal user={user} onClose={hideModal} />;
  }

  if (user.current_rental.rental_details.status === RentalStatus.IN_USE) {
    console.log("[userRoleInteraction] IN_USE status - showing UserInUseModal");
    return <UserInUseModal user={user} onClose={hideModal} />;
  }

  if (user.current_rental.car_details.status === CarStatus.inUse) {
    console.log(
      "[userRoleInteraction] Car status inUse - showing UserInUseModal"
    );
    return <UserInUseModal user={user} onClose={hideModal} />;
  }

  console.log("[userRoleInteraction] No matching condition - returning null");
  return null;
};
