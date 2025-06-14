import { ICar } from "@/shared/models/types/car";
import { IUser, UserRole } from "@/shared/models/types/user";
import { userRoleInteraction } from "./user-role.interaction";
import { mechaniRoleInteraction } from "./mechanic-role";
import { DeliveryData } from "@/shared/hooks/useCurrentDelivery";

export const handleCarInteraction = ({
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
        deliveryData,
        isDeliveryMode,
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
