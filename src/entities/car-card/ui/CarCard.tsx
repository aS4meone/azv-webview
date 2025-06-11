import { CarStatus, ICar } from "@/shared/models/types/car";
import React from "react";

const CarCard = ({ car }: { car: ICar }) => {
  return (
    <div className="bg-[#F7F7F7] border-[#E8E8E8] rounded-[10px] p-4">
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
    [CarStatus.delivering]: "#EF7C7C",
    [CarStatus.tracking]: "#EF7C7C",
  };
  console.log(status);
  console.log(color[status]);
  console.log(statuses[status]);

  return (
    <div
      className="px-2 py-1 rounded-[20px]"
      style={{ backgroundColor: color[status] }}
    >
      <p className="text-[#191919] text-[10px]">{statuses[status]}</p>
    </div>
  );
};
