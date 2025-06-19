import { IUser } from "@/shared/models/types/user";
import { CarInfoHeader, CarSpecs } from "../modals/ui";
import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";
import { useModal } from "@/shared/ui/modal";
import { ICar } from "@/shared/models/types/car";

const FooterTrackingCar = ({ user, car }: { user: IUser; car: ICar }) => {
  const { showModal, hideModal } = useModal();

  const handleOpenModal = () => {
    showModal({
      children: handleCarInteraction({
        user,
        notRentedCar: car,
        hideModal: () => {
          hideModal();
        },
      }),
    });
  };

  return (
    <div className="absolute bottom-0 w-full flex flex-col gap-4">
      <footer
        className="bg-white w-full rounded-t-[40px] p-6 flex flex-col gap-3"
        onClick={handleOpenModal}
      >
        <CarInfoHeader car={car} />
        <CarSpecs car={car} />
      </footer>
    </div>
  );
};

export default FooterTrackingCar;
