import { ICar } from "@/shared/models/types/car";
import React from "react";

interface CarInfoHeaderProps {
  car: ICar;
  showPlateNumber?: boolean;
}

export const CarInfoHeader = ({
  car,
  showPlateNumber = true,
}: CarInfoHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-[#191919]">{car.name}</h1>
      {showPlateNumber && (
        <span className="text-base font-medium text-[#191919] border border-[#B9B9B9] rounded-lg px-3 py-1">
          {car.plate_number}
        </span>
      )}
    </div>
  );
};
