import { IUser } from "@/shared/models/types/user";
import {
  UserCarInWaitingModal,
  UserInUseModal,
  UserStartCarModal,
} from "../ui/widgets/modals";
import { CarStatus, ICar } from "@/shared/models/types/car";

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
    return <UserStartCarModal car={notRentedCar} onClose={hideModal} />;
  }

  if (
    user.current_rental !== null &&
    user.current_rental.car_details.status === CarStatus.reserved
  ) {
    return <UserCarInWaitingModal user={user} onClose={hideModal} />;
  }

  if (user.current_rental.car_details.status === CarStatus.inUse) {
    return <UserInUseModal user={user} onClose={hideModal} />;
  }

  return null;
};
