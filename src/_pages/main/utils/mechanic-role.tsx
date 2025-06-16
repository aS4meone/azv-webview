import { IUser } from "@/shared/models/types/user";

import { CarStatus, ICar } from "@/shared/models/types/car";
import { removeAllQueriesFromUrl } from "@/shared/utils/urlUtils";
import { MechanicStartCheckModal } from "../ui/widgets/modals/mechanic/MechanicStartCheckModal";
import { MechanicCarInWaitingModal } from "../ui/widgets/modals/mechanic/MechanicCarInWaitingModal";
import { MechanicInUseModal } from "../ui/widgets/modals/mechanic/MechanicInUseModal";

export const mechaniRoleInteraction = ({
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
