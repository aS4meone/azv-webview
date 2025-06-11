import { useState, useEffect } from "react";

interface WaitingTimerResult {
  isFreePeriod: boolean;
  timeLeft: string;
  isPaid: boolean;
  paidMinutes: number;
}

export const useWaitingTimer = (
  reservationTime: string
): WaitingTimerResult => {
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

  const timeDiff = Math.floor(
    (currentTime.getTime() - reservationDate.getTime()) / 1000
  );

  // 2 минуты = 120 секунд
  const freePeriodSeconds = 15 * 60;

  if (timeDiff < freePeriodSeconds) {
    // Бесплатный период - показываем сколько времени осталось
    const remainingSeconds = freePeriodSeconds - timeDiff;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return {
      isFreePeriod: true,
      timeLeft: `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`,
      isPaid: false,
      paidMinutes: 0,
    };
  } else {
    // Платный период - показываем общее время с начала платного ожидания
    const paidSeconds = timeDiff - freePeriodSeconds;
    const paidMinutes = Math.ceil(paidSeconds / 60); // Для расчета стоимости

    // Показываем фактическое прошедшее время в платном периоде
    const displayMinutes = Math.floor(paidSeconds / 60);
    const displaySeconds = paidSeconds % 60;

    return {
      isFreePeriod: false,
      timeLeft: `${displayMinutes.toString().padStart(2, "0")}:${displaySeconds
        .toString()
        .padStart(2, "0")}`,
      isPaid: true,
      paidMinutes,
    };
  }
};
