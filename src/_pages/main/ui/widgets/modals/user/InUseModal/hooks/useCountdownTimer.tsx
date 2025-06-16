import { useEffect, useState } from "react";

export const useCountdownTimer = (
  startTime: string | null,
  duration: number | null,
  rentalType: "hours" | "days",
  pricePerMinute: number
) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!startTime || !duration) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration]);

  if (!startTime || !duration) {
    return {
      timeLeft: "00:00:00",
      isOvertime: false,
      overtimeText: "",
      overtimeMinutes: 0,
      penaltyCost: 0,
    };
  }

  const start = new Date(startTime);
  // Добавляем 5 часов к серверному времени для корректировки часового пояса
  start.setHours(start.getHours() + 5);

  // Рассчитываем время окончания
  const endTime = new Date(start);
  if (rentalType === "hours") {
    endTime.setHours(endTime.getHours() + duration);
  } else {
    endTime.setDate(endTime.getDate() + duration);
  }

  const diffMs = endTime.getTime() - currentTime.getTime();
  const isOvertime = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(absDiffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let timeDisplay;
  if (rentalType === "days") {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days === 0) {
      timeDisplay = `${remainingHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      timeDisplay = `${days} дней ${remainingHours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  } else {
    timeDisplay = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Рассчитываем штрафные минуты и стоимость
  const overtimeMinutes = isOvertime ? Math.floor(absDiffMs / (1000 * 60)) : 0;
  const penaltyCost = overtimeMinutes * pricePerMinute;

  return {
    timeLeft: timeDisplay,
    isOvertime,
    overtimeText: isOvertime ? "Штрафное время" : "Осталось времени",
    overtimeMinutes,
    penaltyCost,
  };
};
