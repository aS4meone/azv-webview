"use client";
import { Button } from "@/shared/ui";
import { ChatIcon } from "@/shared/icons";
import { Drawer } from "../widgets/drawer";
import { MapComponent } from "../widgets/map/Map";
import { FooterBtns } from "../widgets/footer-btns";
import SearchIcon from "@/shared/icons/ui/SearchIcon";
import { useUserStore } from "@/shared/stores/userStore";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { useEffect, useRef, useState } from "react";
import { useModal } from "@/shared/ui/modal";
import { RentalStatus } from "@/shared/models/types/current-rental";
import { UserRole } from "@/shared/models/types/user";
import { CarStatus } from "@/shared/models/types/car";
import { handleCarInteraction } from "../../utils/car-interaction";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { webviewDebugger } from "@/shared/utils/webview-debug";

import { SupportPage } from "@/_pages/support";
import SearchPage from "@/_pages/search";

export default function GoogleMapsPage() {
  const { refreshUser, user } = useUserStore();
  const { currentDeliveryVehicle } = useVehiclesStore();
  const { showModal, hideModal, isModalOpen } = useModal();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStatusRef = useRef<RentalStatus | null>(null);

  const [currentComponent, setCurrentComponent] = useState<string | null>(null);
  const components = [
    {
      key: "search",
      component: <SearchPage onClose={() => setCurrentComponent(null)} />,
    },
    {
      key: "support",
      component: <SupportPage />,
    },
  ];

  useEffect(() => {
    webviewDebugger.logRequest("MainPage", "refreshUser в первом useEffect");
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user?.current_rental) {
      const currentStatus = user.current_rental.rental_details.status;

      // Если статус изменился и модалка открыта, обновляем её
      if (
        previousStatusRef.current !== null &&
        previousStatusRef.current !== currentStatus &&
        isModalOpen
      ) {
        console.log(
          `[MainPage] Status changed from ${previousStatusRef.current} to ${currentStatus}, switching modal`
        );

        // Закрываем текущую модалку
        hideModal();

        // Небольшая задержка для плавного перехода
        setTimeout(() => {
          // Показываем новую модалку соответствующую новому статусу
          const content = handleCarInteraction({
            user,
            notRentedCar: user.current_rental!.car_details,
            hideModal: () => {
              hideModal();
            },
          });

          if (content) {
            console.log(
              `[MainPage] Showing new modal for status: ${currentStatus}`
            );
            showModal({
              children: content,
            });
          } else {
            console.log(
              `[MainPage] No modal needed for status: ${currentStatus}`
            );
          }
        }, 100);
      }

      // Обновляем предыдущий статус
      previousStatusRef.current = currentStatus;
    } else {
      // Если аренды нет, сбрасываем предыдущий статус
      previousStatusRef.current = null;
    }
  }, [user?.current_rental, user, showModal, hideModal, isModalOpen]);

  // Интервал для обновления пользователя с разной частотой в зависимости от статуса
  useEffect(() => {
    if (user?.current_rental) {
      // Очищаем предыдущий интервал если он был
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Определяем частоту обновления в зависимости от статуса
      const isDelivering =
        user.current_rental.rental_details.status === "delivering";
      const intervalTime = isDelivering ? 10000 : 60000; // 10 сек для доставки, 60 сек для остальных

      // Запускаем интервал с нужной частотой
      intervalRef.current = setInterval(() => {
        webviewDebugger.logRequest(
          "MainPage",
          `refreshUser в интервале (${intervalTime}ms)`
        );
        refreshUser();
      }, intervalTime);
    } else {
      // Очищаем интервал если аренды нет
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Очистка при размонтировании компонента
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.current_rental, refreshUser]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapComponent />

      <Drawer />
      
      {user?.current_rental === null &&
      !(
        user?.role === UserRole.MECHANIC &&
        currentDeliveryVehicle &&
        currentDeliveryVehicle.id !== 0 &&
        currentDeliveryVehicle.status !== CarStatus.free
      ) ? (
        <Button
          variant="icon"
          className="absolute top-10 right-20 h-14 w-14 rounded-full bg-white shadow-lg hover:bg-gray-50 z-10"
          onClick={() => {
            setCurrentComponent("search");
          }}
        >
          <SearchIcon />
        </Button>
      ) : null}
      <Button
        variant="icon"
        className="absolute top-10 right-4 h-14 w-14 rounded-full bg-white shadow-lg hover:bg-gray-50 z-10"
        onClick={() => {
          setCurrentComponent("support");
        }}
      >
        <ChatIcon />
      </Button>

      <CustomPushScreen
        isOpen={!!currentComponent}
        onClose={() => {
          setCurrentComponent(null);
        }}
        direction="right"
        height="auto"
      >
        {components.find((c) => c.key === currentComponent)?.component}
      </CustomPushScreen>
      <FooterBtns />
    </div>
  );
}
