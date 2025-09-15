import { RentalDetails } from "@/shared/models/types/current-rental";
import { useMinutesTimer } from "../hooks/useMinutesTimer";
import { useTranslations } from "next-intl";

export const MinutesRentalContent = ({
  rentalDetails,
  car,
}: {
  rentalDetails: RentalDetails;
  car: {
    price_per_minute: number;
    open_price: number;
  };
}) => {
  const t = useTranslations();
  const { elapsedTime, currentCost } = useMinutesTimer(
    rentalDetails.start_time,
    car.price_per_minute,
    car.open_price
  );

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <p className="text-[16px] text-[#191919]">{t("widgets.modals.rentalContent.rentalTime")}</p>
      <p className="text-[16px] font-semibold text-[#191919]">
        {elapsedTime} <span className="font-normal ">/ {currentCost} ₸</span>
      </p>
    </div>
  );
};
