import React from "react";
import { IUser } from "@/shared/models/types/user";
import { useWaitingTimer } from "../modals/user/hooks/useWaitingTimer";
import InfoIcon from "@/shared/icons/ui/InfoIcon";
import { useTranslations } from "next-intl";

interface WaitingTimerProps {
  user: IUser;
  className?: string;
}

export const WaitingTimer = ({ user, className = "" }: WaitingTimerProps) => {
  const t = useTranslations();
  const car = user.current_rental!.car_details;
  const reservationTime = user.current_rental!.rental_details.reservation_time;

  const { isFreePeriod, timeLeft, isPaid, paidMinutes } =
    useWaitingTimer(reservationTime);

  const calculatePaidAmount = () => {
    return (car.price_per_minute / 2) * paidMinutes;
  };

  return car.owned_car ? null : (
    <div
      className={`bg-[#1D77FF] p-3 px-4 rounded-[40px] flex flex-row justify-between items-center ${className}`}
    >
      <div className="flex flex-row gap-2 items-center text-[16px] text-white">
        {isFreePeriod ? t("widgets.timers.waiting.freeWaiting") : t("widgets.timers.waiting.paidWaiting")}{" "}
        <InfoIcon color="#fff" />
      </div>
      <span className="text-[16px] text-[#fff] font-semibold">
        {timeLeft}{" "}
        <span className="text-[14px] text-[#fff] font-normal">
          {isPaid && `/ ${calculatePaidAmount().toFixed(2)} ₸`}
        </span>
      </span>
    </div>
  );
};
