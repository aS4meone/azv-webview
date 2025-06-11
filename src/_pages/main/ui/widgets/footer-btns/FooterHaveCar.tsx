import { IUser } from "@/shared/models/types/user";
import { CarInfoHeader, CarSpecs } from "../modals/ui";
import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";
import { useModal } from "@/shared/ui/modal";
import { WaitingTimer } from "../components/WaitingTimer";
import { useState } from "react";
import { CarStatus } from "@/shared/models/types/car";

const FooterHaveCar = ({ user }: { user: IUser }) => {
  const { showModal, hideModal } = useModal();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    showModal({
      children: handleCarInteraction({
        user,
        notRentedCar: user.current_rental.car_details,
        hideModal: () => {
          setIsModalOpen(false);
          hideModal();
        },
      }),
    });
  };

  return (
    <div className="absolute bottom-0 w-full flex flex-col gap-4">
      {!isModalOpen &&
        user.current_rental.car_details.status === CarStatus.reserved && (
          <div className="px-4">
            <WaitingTimer user={user} />
          </div>
        )}

      {/* Основная карточка */}
      <footer
        className="bg-white w-full rounded-t-[40px] p-6 flex flex-col gap-3"
        onClick={handleOpenModal}
      >
        <CarInfoHeader car={user.current_rental.car_details} />
        <CarSpecs car={user.current_rental.car_details} />
      </footer>
    </div>
  );
};

export default FooterHaveCar;
