import { ICar } from "@/shared/models/types/car";
import { DriveTypeIcon, EngineVolumeIcon, FuelIcon } from "@/shared/icons";
import React from "react";

interface CarSpecsProps {
  car: ICar;
  className?: string;
}

export const CarSpecs = ({ car, className = "" }: CarSpecsProps) => {
  const returnDriveType = () => {
    switch (car.drive_type) {
      case 1:
        return "RWD";
      case 2:
        return "FWD";
      case 3:
        return "AWD";
      default:
        return "";
    }
  };
  const specs = [
    { icon: <FuelIcon />, value: `${car.fuel_level}л` },
    { icon: <EngineVolumeIcon />, value: car.engine_volume.toFixed(1) },
    { icon: <DriveTypeIcon type={car.drive_type} />, value: returnDriveType() },
    { value: car.year.toString() },
  ];

  return (
    <div className={`flex items-center gap-4 overflow-x-auto ${className}`}>
      {specs.map((spec, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-[#A1C7FF33] rounded-lg py-2 px-3 whitespace-nowrap"
        >
          {spec.icon && <div className="flex-shrink-0">{spec.icon}</div>}
          <span className="text-sm font-medium text-[#191919]">
            {spec.value}
          </span>
        </div>
      ))}
    </div>
  );
};
