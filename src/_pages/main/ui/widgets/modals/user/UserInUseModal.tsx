import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CarInfoHeader, CarControlsSlider } from "../ui";
import { useResponseModal } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import { useUserStore } from "@/shared/stores/userStore";
import { IUser } from "@/shared/models/types/user";

interface UserInUseModalProps {
  user: IUser;
  onClose: () => void;
}

export const UserInUseModal = ({ user, onClose }: UserInUseModalProps) => {
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const [isLocked, setIsLocked] = useState(false);
  const car = user.current_rental.car_details;

  const handleEndRental = async () => {
    onClose();
    try {
      const res = await rentApi.completeRent({
        rating: 5,
        comment: "test",
      });
      if (res.status === 200) {
        showModal({
          type: "success",
          description: "Аренда успешно завершена",
          buttonText: "Отлично",
          onClose: async () => {
            await refreshUser();
          },
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description:
          error.response?.data?.detail ||
          "Произошла ошибка при завершении аренды",
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    // showModal({
    //   type: "success",
    //   description: "Автомобиль заблокирован",
    //   buttonText: "ОК",
    //   onClose: () => {},
    // });
  };

  const handleUnlock = () => {
    setIsLocked(false);
    // showModal({
    //   type: "success",
    //   description: "Автомобиль разблокирован",
    //   buttonText: "ОК",
    //   onClose: () => {},
    // });
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
      {/* Content */}
      <div className="p-6 pt-4 space-y-6">
        {/* Car Title and Plate */}
        <CarInfoHeader car={car} />

        {/* Car Controls Slider */}
        <CarControlsSlider
          isLocked={isLocked}
          onLock={handleLock}
          onUnlock={handleUnlock}
        />

        <Button onClick={handleEndRental} variant="secondary">
          Завершить аренду
        </Button>
      </div>
    </div>
  );
};
