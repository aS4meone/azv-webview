import React from "react";
import { ICar } from "@/shared/models/types/car";
import { CostCalculation } from "../hooks/usePricingCalculator";

interface RentalConfig {
  hasOpeningFee: boolean;
  openingFeeKey?: keyof ICar;
  unit: string;
}

interface PricingDetailsProps {
  config: RentalConfig;
  car: ICar;
  pricePerUnit: number;
  totalCost: number;
  costCalculation?: CostCalculation;
}

export const PricingDetails = ({
  config,
  pricePerUnit,
  totalCost,
  costCalculation,
}: PricingDetailsProps) => {
  const hasDiscount =
    costCalculation?.discountPercent && costCalculation.discountPercent > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-[18px] font-medium text-[#191919]">Стоимость</h3>
      <div className="space-y-2 border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[16px] text-[#191919]">
            <span className="font-medium">Тариф: </span>
            {pricePerUnit.toLocaleString()} ₸ {config.unit}
          </p>
        </div>
      </div>

      {!config.hasOpeningFee &&
        costCalculation?.totalCost &&
        costCalculation?.totalCost > 0 && (
          <div className="pt-3">
            <div className="text-3xl font-bold text-[#191919] transition-all duration-300">
              Итог: {totalCost.toLocaleString()} ₸
              {hasDiscount === true && (
                <div className="text-sm font-normal text-green-600 mt-1">
                  Экономия {costCalculation?.discountAmount?.toLocaleString()} ₸
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};
