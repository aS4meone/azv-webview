import { useState, useEffect } from "react";

interface MechanicTimerResult {
  timeLeft: string;
  isExpired: boolean;
}

export const useMechanicTimer = (
  reservationTime: string
): MechanicTimerResult => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const reservationDate = new Date(reservationTime);
  // Добавляем 5 часов к времени резервации (корректировка часового пояса)
  reservationDate.setHours(reservationDate.getHours() + 5);

  // Добавляем 1 час 30 минут (90 минут)
  const targetTime = new Date(reservationDate.getTime() + 90 * 60 * 1000);

  // Считаем разность между целевым временем и текущим
  const timeDiff = Math.floor(
    (targetTime.getTime() - currentTime.getTime()) / 1000
  );

  if (timeDiff <= 0) {
    // Время истекло
    return {
      timeLeft: "00:00:00",
      isExpired: true,
    };
  }

  // Конвертируем секунды в часы, минуты и секунды
  const hours = Math.floor(timeDiff / 3600);
  const minutes = Math.floor((timeDiff % 3600) / 60);
  const seconds = timeDiff % 60;

  return {
    timeLeft: `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    isExpired: false,
  };
};
