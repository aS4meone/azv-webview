import { MyCar } from "@/shared/models/types/my-auto";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslations } from "next-intl";

interface OwnedCarCardProps {
  car: MyCar;
  onCarClick?: (car: MyCar) => void;
  index?: number;
  isTooltipOpen?: boolean;
  onTooltipHover?: (index: number | null) => void;
  navigateToMap?: boolean;
}

const OwnedCarCard = ({ 
  car, 
  onCarClick, 
  index = 0, 
  isTooltipOpen = false, 
  onTooltipHover, 
  navigateToMap = true 
}: OwnedCarCardProps) => {
  const router = useRouter();
  const [touchHandled, setTouchHandled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations("entities.carCard");

  const handleClick = () => {
    if (navigateToMap) {
      router.push(
        `${ROUTES.MAIN}?carId=${car.id}&lat=${car.latitude}&lng=${car.longitude}`
      );
    }
    if (onCarClick) {
      onCarClick(car);
    }
  };

  const handleTimerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(!isModalOpen);
  };

  const handleTimerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTouchHandled(true);
    setIsModalOpen(!isModalOpen);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Close tooltip when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModalOpen) {
        const target = event.target as Element;
        // Don't close if clicking on the tooltip itself
        if (!target.closest('.tooltip-container')) {
          setIsModalOpen(false);
        }
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const isAvailableMinutesGood = car.available_minutes >= 21600; // 15 days = 21,600 minutes
  const firstPhoto = car.photos && car.photos.length > 0 ? car.photos[0] : null;

  // Format minutes to days and hours
  const formatAvailableTime = (minutes: number) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const remainingMinutes = minutes % 60;
    
    if (days > 0) {
      return `${days}д ${hours}ч`;
    } else if (hours > 0) {
      return `${hours}ч ${remainingMinutes}м`;
    } else {
      return `${remainingMinutes}м`;
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4 cursor-pointer hover:shadow-md transition-shadow mb-3 relative"
        onClick={handleClick}
      >
        <div className="flex items-center gap-4">
          {/* Car Photo - Left Side */}
          {firstPhoto ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 image-container flex items-center justify-center bg-gray-100">
              <img
                src={`https://api.azvmotors.kz${firstPhoto}`}
                alt={car.name || 'Автомобиль'}
                className="my-cars-image"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <div className="text-gray-400 text-2xl">🚗</div>
            </div>
          )}
          
          {/* Car Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#2D2D2D] mb-1">
              {car.name || 'Неизвестная модель'}
            </h3>
            <p className="text-sm text-[#666666] mb-2">
              {car.plate_number || 'Нет номера'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888888]">{t("availabilityForRental")}</span>
              <span className={`text-sm font-medium ${
                isAvailableMinutesGood ? 'text-[#2E7D32]' : 'text-[#D32F2F]'
              }`}>
                {(car.available_minutes || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Available Minutes Badge */}
          <div className="flex-shrink-0 relative">
            <div
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105 ${
                isAvailableMinutesGood ? 'bg-[#2E7D32]' : 'bg-[#D32F2F]'
              }`}
              onClick={handleTimerClick}
              onTouchStart={handleTimerTouchStart}
            >
              <span className="text-sm font-bold leading-none">
                {(car.available_minutes || 0).toLocaleString()}
              </span>
              <span className="text-[10px] opacity-90 mt-1">
                {t("minutes")}
              </span>
            </div>
            
            {/* Tooltip positioned relative to the circle */}
            {isModalOpen && (
              <div className={`absolute right-0 translate-x-2 z-50 tooltip-container ${
                index === 0 
                  ? 'top-full mt-2' 
                  : 'bottom-full mb-2'
              }`}>
                <div 
                  className="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 w-80 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <p className="font-medium mb-1 text-sm">{t("availabilityForRental")}</p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {t("availabilityDescription")}
                    </p>
                    <p className="text-gray-300 mt-1 text-xs">
                      {t("currentTime")} {(car.available_minutes || 0).toLocaleString()} {t("minutes")}
                    </p>
                  </div>
                  {/* Arrow pointing to the timer */}
                  <div className={`absolute right-4 w-0 h-0 border-l-4 border-r-4 border-transparent ${
                    index === 0 
                      ? 'top-0 -mt-1 border-b-4 border-b-gray-900' 
                      : 'bottom-0 -mb-1 border-t-4 border-t-gray-900'
                  }`}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default OwnedCarCard;
