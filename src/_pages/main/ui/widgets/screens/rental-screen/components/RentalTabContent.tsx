import React from "react";
import { ICar } from "@/shared/models/types/car";
import { RENTAL_CONFIG, CostCalculation } from "../hooks/usePricingCalculator";
import { DurationSelector } from "./DurationSelector";
import { PricingDetails } from "./PricingDetails";
import { AdditionalInfo } from "./AdditionalInfo";
import { RentalType } from "@/shared/models/dto/rent.dto";

interface RentalTabContentProps {
  rentalType: RentalType;
  car: ICar;
  duration: number;
  totalCost: number;
  costCalculation?: CostCalculation;
  onIncrement: () => void;
  onDecrement: () => void;
  onDurationChange?: (duration: number) => void;
}

export const RentalTabContent = ({
  rentalType,
  car,
  duration,
  totalCost,
  costCalculation,
  onIncrement,
  onDecrement,
  onDurationChange,
}: RentalTabContentProps) => {
  const config = RENTAL_CONFIG[rentalType];
  const pricePerUnit = car[config.priceKey] as number;
  const isMinutesMode = rentalType === "minutes";
  const description = config.getDescription
    ? config.getDescription(car)
    : config.description;

  return (
    <div className="space-y-4">
      <h2 className="text-[16px] font-semibold text-[#191919]">
        {config.title}
      </h2>
      <p className="text-[#191919] text-[16px]">{description}</p>

      {!isMinutesMode ? (
        <DurationSelector
          duration={duration}
          maxDuration={config.maxDuration}
          getUnitText={config.getUnitText}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onDurationChange={onDurationChange}
        />
      ) : null}

      {/* Pricing */}
      <PricingDetails
        config={config}
        car={car}
        pricePerUnit={pricePerUnit}
        totalCost={totalCost}
        costCalculation={costCalculation}
      />

      {/* Additional Info */}
      <AdditionalInfo rentalType={rentalType} car={car} />
    </div>
  );
};
