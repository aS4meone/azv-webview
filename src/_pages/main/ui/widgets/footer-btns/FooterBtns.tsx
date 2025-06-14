"use client";
import {
  RoadIcon,
  UserIcon,
  CheckIcon,
  TruckIcon,
  ClockIcon,
} from "@/shared/icons";
import { UserRole } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { Button } from "@/shared/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FooterHaveCar from "./FooterHaveCar";
import { ROUTES } from "@/shared/constants/routes";
import { useCurrentDelivery } from "@/shared/hooks/useCurrentDelivery";
import FooterDelivery from "./FooterDelivery";

enum ServiceButtonType {
  CHECK = "check",
  DELIVERING = "delivering",
  RENT = "rent",
}

const FooterBtns = () => {
  const { user } = useUserStore();
  const router = useRouter();
  const [activeServiceButton, setActiveServiceButton] =
    useState<ServiceButtonType>(ServiceButtonType.CHECK);

  const { deliveryData } = useCurrentDelivery();

  if (!user) return null;

  if (deliveryData) {
    return <FooterDelivery deliveryData={deliveryData} user={user} />;
  }

  if (user.current_rental != null && user.current_rental) {
    return <FooterHaveCar user={user} />;
  }

  const handleServiceButtonClick = (buttonType: ServiceButtonType) => {
    if (activeServiceButton === buttonType) {
      // Already active, navigate
      switch (buttonType) {
        case ServiceButtonType.CHECK:
          router.push(ROUTES.MECHANIC_PENDING);
          break;
        case ServiceButtonType.DELIVERING:
          router.push(ROUTES.MECHANIC_DELIVERY);
          break;
        case ServiceButtonType.RENT:
          router.push(ROUTES.MECHANIC_IN_RENT);
          break;
      }
    } else {
      // Not active yet, just activate
      setActiveServiceButton(buttonType);
    }
  };

  const renderServiceButton = (
    buttonType: ServiceButtonType,
    icon: React.ReactNode,
    label: string
  ) => {
    const isActive = activeServiceButton === buttonType;

    return (
      <button
        key={buttonType}
        onClick={() => handleServiceButtonClick(buttonType)}
        className={`
          flex items-center justify-center
          bg-white border border-[#E8E8E8] rounded-full
          font-medium text-base text-[#191919]
          min-w-[55px] h-12 cursor-pointer overflow-hidden
          transition-all duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
          hover:shadow-lg active:scale-95
          ${isActive ? "w-[170px] px-4" : "w-[55px] px-2"}
        `}
      >
        <div
          className={`
            flex items-center justify-center
            transition-transform duration-250 ease-out
            ${isActive ? "scale-110" : "scale-100"}
          `}
        >
          {icon}
        </div>
        <span
          className={`
            whitespace-nowrap overflow-hidden
            transition-all duration-250 ease-out
            ${
              isActive
                ? "opacity-100 max-w-[120px] ml-2"
                : "opacity-0 max-w-0 ml-0"
            }
          `}
        >
          {label}
        </span>
      </button>
    );
  };

  const getFooterBtns = () => {
    if (user.owned_cars.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          <Button
            link={ROUTES.CARS_MY}
            className="flex items-center gap-2 justify-center border-[#E8E8E8] text-[#191919] font-medium text-[16px]"
          >
            <UserIcon />
            <span>Мои машины</span>
          </Button>
          <Button
            link={ROUTES.CARS_FREE}
            className="flex items-center gap-2 justify-center border-[#E8E8E8] text-[#191919] font-medium text-[16px]"
          >
            <RoadIcon />
            <span>Свободно</span>
          </Button>
        </div>
      );
    }

    if (user.role === UserRole.MECHANIC) {
      return (
        <div className="flex justify-between items-center gap-3">
          {renderServiceButton(
            ServiceButtonType.CHECK,
            <CheckIcon />,
            "Проверка"
          )}
          {renderServiceButton(
            ServiceButtonType.DELIVERING,
            <TruckIcon />,
            "Доставка"
          )}
          {renderServiceButton(
            ServiceButtonType.RENT,
            <ClockIcon />,
            "В аренде"
          )}
        </div>
      );
    }

    if (
      user.role === UserRole.USER ||
      user.role === UserRole.PENDING ||
      user.role === UserRole.FIRST
    ) {
      return (
        <div className="flex flex-col gap-2">
          <Button
            link={ROUTES.CARS_FREQ_USED}
            className="flex items-center gap-2 justify-center border-[#E8E8E8] text-[#191919] font-medium text-[16px]"
          >
            <UserIcon />
            <span>Часто используемые</span>
          </Button>
          <Button
            link={ROUTES.CARS_FREE}
            className="flex items-center gap-2 justify-center border-[#E8E8E8] text-[#191919] font-medium text-[16px]"
          >
            <RoadIcon />
            <span>Свободно</span>
          </Button>
        </div>
      );
    }
  };

  return (
    <footer className="absolute bottom-4 left-4 right-4">
      {getFooterBtns()}
    </footer>
  );
};

export default FooterBtns;
