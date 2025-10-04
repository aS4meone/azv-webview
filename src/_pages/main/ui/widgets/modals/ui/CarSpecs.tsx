import { ICar, TransmissionType } from "@/shared/models/types/car";
import { DriveTypeIcon, EngineVolumeIcon, FuelIcon, LightningIcon, BatteryIcon, TransmissionIconPNG } from "@/shared/icons";
import React from "react";
import { useTranslations } from "next-intl";

interface CarSpecsProps {
  car: ICar;
  className?: string;
}

export const CarSpecs = ({ car, className = "" }: CarSpecsProps) => {
  const t = useTranslations("mechanic");
  
  const returnDriveType = () => {
    switch (car.drive_type) {
      case 1:
        return t("carSpecs.driveType.rwd");
      case 2:
        return t("carSpecs.driveType.fwd");
      case 3:
        return t("carSpecs.driveType.awd");
      default:
        return "";
    }
  };

  const returnTransmissionType = () => {
    switch (car.transmission_type) {
      case "manual":
        return t("carSpecs.transmission.manual");
      case "automatic":
        return t("carSpecs.transmission.automatic");
      case "cvt":
        return t("carSpecs.transmission.cvt");
      case "semi_automatic":
        return t("carSpecs.transmission.semi_automatic");
      default:
        return t("carSpecs.transmission.automatic"); // По умолчанию АКПП
    }
  };

  const isElectric = car.body_type === "ELECTRIC";

  const specs = [
    { 
      icon: isElectric ? <BatteryIcon /> : <FuelIcon />, 
      value: isElectric ? `${car.fuel_level || 0}%` : `${car.fuel_level || 0} ${t("carSpecs.fuelUnit")}` 
    },
    {
      icon: isElectric ? <LightningIcon /> : <EngineVolumeIcon />,
      value: isElectric ? t("carSpecs.electric") : (car.engine_volume ? car.engine_volume.toFixed(1) : "0.0"),
    },
    {
      icon: <DriveTypeIcon type={car.drive_type || 0} />,
      value: returnDriveType(),
    },
    {
      icon: <TransmissionIconPNG type={car.transmission_type} />,
      value: returnTransmissionType(),
    },
    { value: `${t("carSpecs.class")}: A` }, // Класс авто
    { value: car.year ? car.year.toString() : "0" },
  ];

  return (
    <div className={`flex items-center gap-4 overflow-x-auto flex-wrap ${className}`}>
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
