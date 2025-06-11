import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CarInfoHeader, CarControlsSlider } from "../ui";
import { useResponseModal } from "@/shared/ui/modal";
import { rentApi } from "@/shared/api/routes/rent";
import { useUserStore } from "@/shared/stores/userStore";
import { IUser } from "@/shared/models/types/user";
import { RentalType } from "@/shared/models/dto/rent.dto";
import { RentalDetails } from "@/shared/models/types/current-rental";

interface UserInUseModalProps {
  user: IUser;
  onClose: () => void;
}

// Rental type specific content components
const MinutesRentalContent = ({
  rentalDetails,
}: {
  rentalDetails: RentalDetails;
}) => (
  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
    <h3 className="font-semibold text-lg">Поминутная аренда</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Время начала</p>
        <p className="font-medium">{rentalDetails.start_time || "Не начато"}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Уже оплачено</p>
        <p className="font-medium">{rentalDetails.already_payed} ₸</p>
      </div>
    </div>
    <div className="space-y-2">
      <Button variant="outline" className="w-full">
        Добавить время
      </Button>
      <Button variant="outline" className="w-full">
        История поездки
      </Button>
    </div>
  </div>
);

const HoursRentalContent = ({
  rentalDetails,
}: {
  rentalDetails: RentalDetails;
}) => (
  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
    <h3 className="font-semibold text-lg">Почасовая аренда</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Время аренды</p>
        <p className="font-medium">{rentalDetails.reservation_time}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Продолжительность</p>
        <p className="font-medium">{rentalDetails.duration || "Не указано"}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Уже оплачено</p>
        <p className="font-medium">{rentalDetails.already_payed} ₸</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Статус</p>
        <p className="font-medium">{rentalDetails.status}</p>
      </div>
    </div>
    <div className="space-y-2">
      <Button variant="outline" className="w-full">
        Продлить аренду
      </Button>
      <Button variant="outline" className="w-full">
        Детали тарифа
      </Button>
    </div>
  </div>
);

const DaysRentalContent = ({
  rentalDetails,
}: {
  rentalDetails: RentalDetails;
}) => (
  <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
    <h3 className="font-semibold text-lg">Суточная аренда</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Дата начала</p>
        <p className="font-medium">
          {new Date(rentalDetails.reservation_time).toLocaleDateString()}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Дней аренды</p>
        <p className="font-medium">{rentalDetails.duration || "Не указано"}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Уже оплачено</p>
        <p className="font-medium">{rentalDetails.already_payed} ₸</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Статус доставки</p>
        <p className="font-medium">
          {rentalDetails.delivery_in_progress ? "В процессе" : "Доставлено"}
        </p>
      </div>
    </div>
    <div className="space-y-2">
      <Button variant="outline" className="w-full">
        Продлить на день
      </Button>
      <Button variant="outline" className="w-full">
        Запросить доставку
      </Button>
      <Button variant="outline" className="w-full">
        Отчет об использовании
      </Button>
    </div>
  </div>
);

export const UserInUseModal = ({ user, onClose }: UserInUseModalProps) => {
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const [, setIsLocked] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const car = user.current_rental.car_details;
  const rentalDetails = user.current_rental.rental_details;
  const rentalType = rentalDetails.rental_type as RentalType;

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

  const renderRentalTypeContent = () => {
    switch (rentalType) {
      case "minutes":
        return <MinutesRentalContent rentalDetails={rentalDetails} />;
      case "hours":
        return <HoursRentalContent rentalDetails={rentalDetails} />;
      case "days":
        return <DaysRentalContent rentalDetails={rentalDetails} />;
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Неизвестный тип аренды: {rentalType}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
      {/* Content */}
      <div className="p-6 pt-4 space-y-6">
        {/* Car Title and Plate */}
        <CarInfoHeader car={car} />

        <div className="flex justify-between gap-2">
          <Button variant="outline">Пауза</Button>
          <Button variant="outline">Начать поездку</Button>
        </div>

        {/* Car Controls Slider */}
        <CarControlsSlider onLock={handleLock} onUnlock={handleUnlock} />

        {/* More Button */}
        <Button
          variant="outline"
          onClick={() => setShowMore(!showMore)}
          className="w-full"
        >
          {showMore ? "Скрыть детали" : "Подробнее"}
        </Button>

        {/* Expandable Content based on Rental Type */}
        {showMore && renderRentalTypeContent()}

        <Button onClick={handleEndRental} variant="secondary">
          Завершить аренду
        </Button>
      </div>
    </div>
  );
};
