import { useEffect, useState } from "react";

export const useMinutesTimer = (
  startTime: string | null,
  pricePerMinute: number,
  openPrice: number
) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) {
    return {
      elapsedTime: "00:00:00",
      currentCost: openPrice,
    };
  }

  const start = new Date(startTime);
  // Добавляем 5 часов к серверному времени для корректировки часового пояса
  start.setHours(start.getHours() + 5);
  const diffMs = currentTime.getTime() - start.getTime();
  const elapsedMinutes = Math.floor(diffMs / (1000 * 60));
  const elapsedSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMinutes = elapsedMinutes % 60;

  const elapsedTime = `${elapsedHours
    .toString()
    .padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}:${elapsedSeconds.toString().padStart(2, "0")}`;
  const currentCost = elapsedMinutes * pricePerMinute;

  return {
    elapsedTime,
    currentCost,
  };
};
