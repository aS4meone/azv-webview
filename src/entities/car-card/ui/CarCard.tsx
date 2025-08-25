import { CarStatus, ICar } from "@/shared/models/types/car";
import React from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";

interface CarCardProps {
  car: ICar;
  onCarClick?: (car: ICar) => void;
}

const CarCard = ({ car, onCarClick }: CarCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(
      `${ROUTES.MAIN}?carId=${car.id}&lat=${car.latitude}&lng=${car.longitude}`
    );
    if (onCarClick) {
      onCarClick(car);
    }
  };

  return (
    <div
      className="bg-[#F7F7F7] border-[#E8E8E8] rounded-[10px] p-4 cursor-pointer hover:bg-[#F0F0F0] transition-colors"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <p className="text-[#191919] text-[16px]">{car.name}</p>
        <CarStatusBadge status={car.status} />
      </div>

      <p className="text-[#191919] text-[10px]">{car.plate_number}</p>
    </div>
  );
};

export default CarCard;

const CarStatusBadge = ({ status }: { status: CarStatus }) => {
  const statuses = {
    [CarStatus.free]: "Свободен",
    [CarStatus.inUse]: "В аренде",
    [CarStatus.service]: "В сервисе",
    [CarStatus.owner]: "У Владелеца",
    [CarStatus.pending]: "В ожидании",
    [CarStatus.failure]: "Неисправен",
    [CarStatus.reserved]: "Зарезервирован",
    [CarStatus.delivering]: "В доставке",
    [CarStatus.tracking]: "В пути",
  };

  const color = {
    [CarStatus.free]: "#BAF2AF",
    [CarStatus.inUse]: "#EF7C7C",
    [CarStatus.service]: "#FFE494",
    [CarStatus.owner]: "#AEC9F1",
    [CarStatus.pending]: "#FFE494",
    [CarStatus.failure]: "#EF7C7C",
    [CarStatus.reserved]: "#EF7C7C",
    [CarStatus.delivering]: "#FFE494",
    [CarStatus.tracking]: "#EF7C7C",
  };

  return (
    <div
      className="px-2 py-1 rounded-[20px]"
      style={{ backgroundColor: color[status] }}
    >
      <p className="text-[#191919] text-[10px]">{statuses[status]}</p>
    </div>
  );
};
