import { ICar } from "@/shared/models/types/car";
import { IUser, UserRole } from "@/shared/models/types/user";
import { userRoleInteraction } from "./user-role.interaction";
import { mechaniRoleInteraction } from "./mechanic-role";

export const handleCarInteraction = ({
  user,
  notRentedCar,
  hideModal,
}: {
  user: IUser;
  notRentedCar: ICar;
  hideModal: () => void;
}) => {
  switch (user.role) {
    case UserRole.FIRST:
      return userRoleInteraction({ user, notRentedCar, hideModal });

    case UserRole.PENDING:
      return userRoleInteraction({ user, notRentedCar, hideModal });

    case UserRole.ADMIN:
      break;
    case UserRole.MECHANIC:
      return mechaniRoleInteraction({
        user,
        notRentedCar,
        hideModal,
      });

    case UserRole.REJECTED:
      break;

    case UserRole.USER:
      return userRoleInteraction({ user, notRentedCar, hideModal });

    default:
      break;
  }

  return null;
};
