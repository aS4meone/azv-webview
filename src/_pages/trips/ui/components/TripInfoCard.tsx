import React from "react";
import { formatDate } from "@/shared/utils/formate-date";

interface TripInfoCardProps {
  rentalType: string;
  reservationTime: string;
  startTime: string;
  endTime: string;
  duration?: number;
}

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

export const TripInfoCard: React.FC<TripInfoCardProps> = ({
  rentalType,
  reservationTime,
  startTime,
  endTime,
  duration,
}) => {
  const getRentalTypeText = (type: string) => {
    switch (type) {
      case "minutes":
        return "минутный";
      case "hours":
        return "часовой";
      case "days":
        return "дневной";
      default:
        return type;
    }
  };

  const getDurationText = (duration: number, rentalType: string) => {
    switch (rentalType) {
      case "minutes":
        return duration === 1 ? "минуту" : duration < 5 ? "минуты" : "минут";
      case "hours":
        return duration === 1 ? "час" : duration < 5 ? "часа" : "часов";
      case "days":
        return duration === 1 ? "день" : duration < 5 ? "дня" : "дней";
      default:
        return "минут";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
            <ClockIcon />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Детали поездки
          </h2>
        </div>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm font-medium">Тариф</span>
          <span className="text-gray-900 font-medium capitalize">
            {getRentalTypeText(rentalType)}
          </span>
        </div>
        <div className="space-y-3 pt-2">
          <div>
            <span className="text-gray-500 text-sm font-medium block mb-1">
              Забронировано
            </span>
            <span className="text-gray-900 font-medium">
              {formatDate(reservationTime)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-sm font-medium block mb-1">
              Начато
            </span>
            <span className="text-gray-900 font-medium">
              {formatDate(startTime)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-sm font-medium block mb-1">
              Завершено
            </span>
            <span className="text-gray-900 font-medium">
              {formatDate(endTime)}
            </span>
          </div>
          {duration && (
            <div>
              <span className="text-gray-500 text-sm font-medium block mb-1">
                Продолжительность
              </span>
              <span className="text-gray-900 font-medium">
                {duration} {getDurationText(duration, rentalType)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
