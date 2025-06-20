"use client";
import React, { useState } from "react";
import {
  RoadIcon,
  UserIcon,
  CheckIcon,
  TruckIcon,
  ClockIcon,
} from "@/shared/icons";
import { UserRole } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { Button } from "@/shared/ui";
import FooterHaveCar from "./FooterHaveCar";
import FooterDeliveryCar from "./FooterDeliveryCar";
import { ICar } from "@/shared/models/types/car";
import FooterTrackingCar from "./FooterTracking";
import { CarStatus } from "@/shared/models/types/car";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import FreeCarsPage from "@/_pages/cars/free/page";
import FreqUsedCarsPage from "@/_pages/cars/freq-used/page";
import MyCarsPage from "@/_pages/cars/my/page";
import MechanicPendingPage from "@/_pages/mechanic/pending/page";
import MechanicDeliveryPage from "@/_pages/mechanic/delivery/page";
import MechanicInRentPage from "@/_pages/mechanic/in-rent/page";

enum ServiceButtonType {
  CHECK = "check",
  DELIVERING = "delivering",
  RENT = "rent",
}

const FooterBtns = () => {
  const { user } = useUserStore();
  const {
    allMechanicVehicles,

    currentDeliveryVehicle,
  } = useVehiclesStore();

  const [activeServiceButton, setActiveServiceButton] =
    useState<ServiceButtonType | null>(null);
  const [currentComponent, setCurrentComponent] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  const trackingCarId = localStorage.getItem("tracking_car_id");

  const components = [
    {
      key: "my_cars",
      component: <MyCarsPage onClose={() => setCurrentComponent(null)} />,
      title: "Мои машины",
    },
    {
      key: "free_cars",
      component: <FreeCarsPage onClose={() => setCurrentComponent(null)} />,
      title: "Свободно",
    },
    {
      key: "freq_used_cars",
      component: <FreqUsedCarsPage onClose={() => setCurrentComponent(null)} />,
      title: "Часто используемые",
    },
    {
      key: "mechanic_pending",
      component: (
        <MechanicPendingPage onClose={() => setCurrentComponent(null)} />
      ),
      title: "Проверка",
    },
    {
      key: "mechanic_delivery",
      component: (
        <MechanicDeliveryPage onClose={() => setCurrentComponent(null)} />
      ),
      title: "Доставка",
    },
    {
      key: "mechanic_in_rent",
      component: (
        <MechanicInRentPage onClose={() => setCurrentComponent(null)} />
      ),
      title: "В аренде",
    },
  ];

  let trackingCar: ICar | undefined = undefined;
  if (trackingCarId) {
    trackingCar = allMechanicVehicles.find(
      (car) => car.id === Number(trackingCarId)
    );
  }

  if (!user) return null;

  // ИСПРАВЛЕНИЕ: Дебаунсинг для предотвращения двойных кликов
  const clickDebounceTime = 300;

  const handleServiceButtonClick = (buttonType: ServiceButtonType) => {
    const currentTime = Date.now();

    // Дебаунсинг для предотвращения двойных кликов
    if (currentTime - lastClickTime < clickDebounceTime) {
      return;
    }
    setLastClickTime(currentTime);

    if (activeServiceButton === buttonType) {
      // Already active, show component
      switch (buttonType) {
        case ServiceButtonType.CHECK:
          setCurrentComponent("mechanic_pending");
          break;
        case ServiceButtonType.DELIVERING:
          setCurrentComponent("mechanic_delivery");
          break;
        case ServiceButtonType.RENT:
          setCurrentComponent("mechanic_in_rent");
          break;
      }
    } else {
      // Not active yet, just activate
      setActiveServiceButton(buttonType);
    }
  };

  if (trackingCarId && trackingCar) {
    return <FooterTrackingCar user={user} car={trackingCar} />;
  }

  // Если у пользователя есть текущая аренда - показываем FooterHaveCar
  if (user.current_rental != null && user.current_rental) {
    return <FooterHaveCar user={user} />;
  }

  // Если это механик и у него есть текущая доставка - показываем FooterHaveCar
  if (
    user.role === UserRole.MECHANIC &&
    currentDeliveryVehicle &&
    currentDeliveryVehicle.id !== 0 &&
    currentDeliveryVehicle.status !== CarStatus.reserved &&
    currentDeliveryVehicle.status !== CarStatus.free
  ) {
    return <FooterDeliveryCar car={currentDeliveryVehicle} user={user} />;
  }

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
          hover:shadow-lg active:scale-95 service-button
          ${isActive ? "w-[170px] px-4" : "w-[55px] px-2"}
        `}
        style={{
          touchAction: "manipulation",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
          pointerEvents: "auto",
        }}
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
            onClick={() => setCurrentComponent("my_cars")}
            className="flex items-center gap-2 justify-center border-[#E8E8E8] text-[#191919] font-medium text-[16px]"
          >
            <UserIcon />
            <span>Мои машины</span>
          </Button>
          <Button
            onClick={() => setCurrentComponent("free_cars")}
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
            onClick={() => setCurrentComponent("freq_used_cars")}
            className="flex items-center gap-2 justify-center border-[#E8E8E8] text-[#191919] font-medium text-[16px]"
          >
            <UserIcon />
            <span>Часто используемые</span>
          </Button>
          <Button
            onClick={() => setCurrentComponent("free_cars")}
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
    <>
      <footer className="absolute bottom-4 left-4 right-4">
        {getFooterBtns()}
      </footer>

      <CustomPushScreen
        isOpen={!!currentComponent}
        onClose={() => {
          setCurrentComponent(null);
        }}
        direction="right"
        height="auto"
        title={components.find((c) => c.key === currentComponent)?.title}
      >
        {components.find((c) => c.key === currentComponent)?.component}
      </CustomPushScreen>
    </>
  );
};

export default FooterBtns;
