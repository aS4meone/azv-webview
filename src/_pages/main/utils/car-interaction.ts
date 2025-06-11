import { ICar } from "@/shared/models/types/car";
import { IUser, UserRole } from "@/shared/models/types/user";
import { userRoleInteraction } from "./user-role.interaction";

export const handleCarInteraction = ({
  user,
  notRentedCar,
  hideModal,
}: {
  user: IUser;
  notRentedCar: ICar;
  hideModal: () => void;
}) => {
  console.log(user.current_rental);
  if (user.current_rental?.car_details.owned_car) {
    return null;
  }

  switch (user.role) {
    case UserRole.FIRST:
      return userRoleInteraction({ user, notRentedCar, hideModal });

    case UserRole.PENDING:
      return userRoleInteraction({ user, notRentedCar, hideModal });

    case UserRole.ADMIN:
      break;
    case UserRole.MECHANIC:
      break;

    case UserRole.REJECTED:
      break;

    case UserRole.USER:
      return userRoleInteraction({ user, notRentedCar, hideModal });

    default:
      break;
  }

  return null;
};
