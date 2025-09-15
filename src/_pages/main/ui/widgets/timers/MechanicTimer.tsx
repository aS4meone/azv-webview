import React from "react";
import { IUser } from "@/shared/models/types/user";
import { useMechanicTimer } from "../modals/user/hooks/useMechanicTimer";
import { ICar } from "@/shared/models/types/car";
import { useTranslations } from "next-intl";

interface WaitingTimerProps {
  user: IUser;
  deCar?: ICar;
  className?: string;
  deReservationTime?: string;
}

export const MechanicWaitingTimer = ({
  user,
  deCar,
  className = "",
  deReservationTime,
}: WaitingTimerProps) => {
  const t = useTranslations();
  const car = deCar != null ? deCar : user.current_rental!.car_details;
  const reservationTime =
    deReservationTime != null
      ? deReservationTime
      : user.current_rental!.rental_details!.reservation_time || "";

  const { timeLeft, isExpired } = useMechanicTimer(reservationTime);

  return car.owned_car ? null : (
    <div
      className={`${
        isExpired ? "bg-red-500" : "bg-[#1D77FF]"
      } p-3 px-4 rounded-[40px] flex flex-row justify-between items-center ${className}`}
    >
      <div className="flex flex-row gap-2 items-center text-[16px] text-white">
        {isExpired ? t("widgets.timers.mechanic.timeExpired") : t("widgets.timers.mechanic.timer")}
      </div>
      <span className="text-[16px] text-[#fff] font-semibold">{timeLeft}</span>
    </div>
  );
};
