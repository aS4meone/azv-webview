import { IUser } from "@/shared/models/types/user";

import { CarStatus, ICar } from "@/shared/models/types/car";
import { RentalStatus } from "@/shared/models/types/current-rental";
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
  console.log("[mechaniRoleInteraction] Debug info:", {
    hasCurrentRental: !!user.current_rental,
    carStatus: notRentedCar.status,
    rentalStatus: user.current_rental?.rental_details.status,
    carId: notRentedCar.id,
    currentRenterId: notRentedCar.current_renter_details?.id,
    userId: user.id,
    isMechanicRental: user.current_rental?.car_details?.current_renter_details?.id === user.id
  });
  
  const trackingCarId = localStorage.getItem("tracking_car_id");

  if (trackingCarId) {
    console.log("[mechaniRoleInteraction] Showing MechanicTrackingCarModal - tracking car ID found");
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
    console.log("[mechaniRoleInteraction] Showing MechanicCarIsFreeModal - no rental, car is free");
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
    console.log("[mechaniRoleInteraction] Showing MechaniCarInWaitingDeliverModal - no rental, car is deliveryReserved");
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
    console.log("[mechaniRoleInteraction] Showing MechanicDeliveryInUseModal - no rental, car is deliveryInProgress");
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
    // Если машина в статусе DELIVERING - показываем модал ожидания доставки
    if (notRentedCar.status === CarStatus.delivering) {
      console.log("[mechaniRoleInteraction] Showing MechaniCarInWaitingDeliverModal - no rental, car is delivering");
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
    
    // Если нажали на машину в IN_USE - это слежка или осмотр
    if (notRentedCar.status === CarStatus.inUse) {
      console.log("[mechaniRoleInteraction] Showing MechanicTrackingCarModal - no rental, car is inUse");
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
    
    console.log("[mechaniRoleInteraction] Showing MechanicStartCheckModal - no rental, default case");
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
    console.log("[mechaniRoleInteraction] Has current rental, checking status...");
    
    // ВАЖНО: Сначала проверяем статус доставки
    const rentalStatus = user.current_rental.rental_details.status;
    
    // Если статус DELIVERY_RESERVED - механик принял доставку, но еще не начал (нужно загрузить фото)
    if (rentalStatus === RentalStatus.DELIVERY_RESERVED) {
      console.log("[mechaniRoleInteraction] Showing MechaniCarInWaitingDeliverModal - mechanic accepted delivery, waiting to start");
      return (
        <MechaniCarInWaitingDeliverModal
          user={user}
          notHaveCar={user.current_rental.car_details}
          onClose={() => {
            hideModal();
            removeAllQueriesFromUrl();
          }}
        />
      );
    }
    
    // Если статус DELIVERY_IN_PROGRESS или DELIVERING - доставка уже началась
    if (
      rentalStatus === RentalStatus.DELIVERY_IN_PROGRESS ||
      rentalStatus === RentalStatus.DELIVERING
    ) {
      console.log("[mechaniRoleInteraction] Showing MechanicDeliveryInUseModal - mechanic is in delivery process");
      return (
        <MechanicDeliveryInUseModal
          user={user}
          notRentedCar={user.current_rental.car_details}
          onClose={() => {
            hideModal();
            removeAllQueriesFromUrl();
          }}
        />
      );
    }
    
    if (user.current_rental.car_details.status === CarStatus.service) {
      console.log("[mechaniRoleInteraction] Showing MechanicCarInWaitingModal - rental exists, car is service");
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
    
    console.log("[mechaniRoleInteraction] Rental analysis:", {
      carStatus: car.status,
      isMechanicRental,
      currentRenterId: car.current_renter_details?.id,
      userId: user.id
    });

    if (isMechanicRental) {
      // Это rental механика - показываем управление
      console.log("[mechaniRoleInteraction] Showing MechanicInUseModal - this is mechanic's rental (УПРАВЛЕНИЕ АВТО)");
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
      console.log("[mechaniRoleInteraction] Showing MechanicTrackingCarModal - this is someone else's rental");
      return (
        <MechanicTrackingCarModal
          car={car}
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
