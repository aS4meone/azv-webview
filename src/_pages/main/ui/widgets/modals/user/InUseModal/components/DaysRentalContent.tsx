import { RentalDetails } from "@/shared/models/types/current-rental";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import { getRentalConfig } from "../../../../screens/rental-screen/hooks/usePricingCalculator";
import { RentalType } from "@/shared/models/dto/rent.dto";
import { cn } from "@/shared/utils/cn";
import { useTranslations } from "next-intl";

export const DaysRentalContent = ({
  rentalDetails,
  car,
}: {
  rentalDetails: RentalDetails;
  car: {
    price_per_minute: number;
  };
}) => {
  const t = useTranslations();
  const { timeLeft, isOvertime, overtimeText, penaltyCost } = useCountdownTimer(
    rentalDetails.start_time,
    rentalDetails.duration,
    "days",
    car.price_per_minute
  );

  const rentalConfig = getRentalConfig(t);
  const config = rentalConfig[rentalDetails.rental_type as RentalType];

  return (
    <div className="flex items-center justify-between gap-2 flex-col w-full">
      {!isOvertime && (
        <div className="flex flex-row items-center justify-between gap-2 w-full">
          <p className="text-[16px] text-[#191919]">{overtimeText}</p>
          <p
            className={cn(
              "text-[16px] font-semibold text-center",
              "text-[#191919]"
            )}
          >
            {timeLeft}
          </p>
        </div>
      )}
      <div
        className={cn(
          "flex flex-row items-center justify-between gap-2 w-full border-t border-[#E0E0E0] pt-2",
          isOvertime && "border-t-0"
        )}
      >
        <p>{t("widgets.modals.rentalContent.tariff")}</p>
        <p>
          {rentalDetails.duration} {config.getUnitText(rentalDetails.duration!)}
        </p>
      </div>
      {isOvertime && (
        <div className="flex flex-row items-center justify-between gap-2 w-full border-t border-[#E0E0E0] pt-2 text-[16px] text-red-600">
          <p>{t("widgets.modals.rentalContent.timeOutsideTariff")}</p>
          <p className="text-red-600 font-semibold">
            {timeLeft}{" "}
            <span className="text-red-600 font-normal">/ {penaltyCost} ₸</span>
          </p>
        </div>
      )}
    </div>
  );
};
