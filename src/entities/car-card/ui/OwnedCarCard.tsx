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
  navigateToMap?: boolean; // New prop to control navigation behavior
}

const OwnedCarCard = ({ car, onCarClick, index = 0, isTooltipOpen = false, onTooltipHover, navigateToMap = true }: OwnedCarCardProps) => {
  const router = useRouter();
  const [touchHandled, setTouchHandled] = useState(false);
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

  const handleTimerMouseEnter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTooltipHover) {
      onTooltipHover(index);
    }
  };

  const handleTimerMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTooltipHover) {
      onTooltipHover(null);
    }
  };

  const handleTimerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTouchHandled(true);
    if (onTooltipHover) {
      // On mobile, toggle tooltip on touch - if it's open, close it; if closed, open it
      onTooltipHover(isTooltipOpen ? null : index);
    }
  };

  const handleTimerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double handling on mobile devices
    if (touchHandled) {
      setTouchHandled(false);
      return;
    }
    
    if (onTooltipHover) {
      // Toggle tooltip on click - if it's open, close it; if closed, open it
      onTooltipHover(isTooltipOpen ? null : index);
    }
  };

  const isAvailableMinutesGood = car.available_minutes >= 21600; // 15 days = 21,600 minutes
  const firstPhoto = car.photos && car.photos.length > 0 ? car.photos[0] : null;

  return (
    <div
      className="bg-[#F7F7F7] border-[#E8E8E8] rounded-[10px] overflow-hidden cursor-pointer hover:bg-[#F0F0F0] transition-colors"
      onClick={handleClick}
    >
      {/* Car Photo - Full Width */}
      {firstPhoto && (
        <div className="w-full h-48 image-container">
          <img
            src={`https://api.azvmotors.kz${firstPhoto}`}
            alt={car.name}
            className="car-card-full-width"
          />
        </div>
      )}
      
      {/* Car Info */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[#191919] text-[16px] font-medium truncate mb-1">
            {car.name}
          </p>
          <p className="text-[#191919] text-[12px] text-gray-600">
            {car.plate_number}
          </p>
        </div>

        {/* Available Minutes Timer */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer transition-colors ${
              isAvailableMinutesGood ? 'bg-green-500' : 'bg-red-500'
            }`}
            onMouseEnter={handleTimerMouseEnter}
            onMouseLeave={handleTimerMouseLeave}
            onTouchStart={handleTimerTouchStart}
            onClick={handleTimerClick}
          >
            <span className="text-sm">{car.available_minutes}</span>
            <span className="text-[10px]">{t("minutes")}</span>
          </div>
          
          {/* Tooltip */}
          {isTooltipOpen && (
            <div 
              className={`absolute right-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-100 ${
                index === 0 ? 'top-full mt-2' : 'bottom-full mb-2'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <p className="font-medium mb-1">{t("availabilityForRental")}</p>
                <p className="text-gray-300">
                  {t("availabilityDescription")}
                </p>
                <p className="text-gray-300 mt-1">
                  {t("currentTime")} {car.available_minutes} {t("minutes")}
                </p>
              </div>
              {/* Arrow */}
              <div className={`absolute right-4 w-0 h-0 border-l-4 border-r-4 border-transparent ${
                index === 0 
                  ? 'top-0 -mt-1 border-b-4 border-b-gray-900' 
                  : 'bottom-0 -mb-1 border-t-4 border-t-gray-900'
              }`}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnedCarCard;
