"use client";
import { Button } from "@/shared/ui";
import { ChatIcon } from "@/shared/icons";
import { Drawer } from "../widgets/drawer";
import { MapComponent } from "../widgets/map/Map";
import { FooterBtns } from "../widgets/footer-btns";
import SearchIcon from "@/shared/icons/ui/SearchIcon";
import { useUserStore } from "@/shared/stores/userStore";
import { useEffect, useRef, useState } from "react";
import { RentalStatus } from "@/shared/models/types/current-rental";
import { handleCarInteraction } from "../../utils/car-interaction";
import { usePushScreenActions } from "@/shared/hooks/usePushScreenActions";
import { webviewDebugger } from "@/shared/utils/webview-debug";

import { SupportPage } from "@/_pages/support";
import SearchPage from "@/_pages/search";

export default function MainPageWithPushScreens() {
  const { refreshUser, user } = useUserStore();
  const { openBottomSheet, closePushScreen, closeAllPushScreens } =
    usePushScreenActions();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStatusRef = useRef<RentalStatus | null>(null);
  const [currentModalId, setCurrentModalId] = useState<string | null>(null);

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

  // Function to show modal using push screen system
  const showCarModal = (content: React.ReactNode) => {
    // Close any existing modal first
    if (currentModalId) {
      closePushScreen(currentModalId);
    }

    // Open new modal
    const id = openBottomSheet(content, {
      onClose: () => {
        setCurrentModalId(null);
      },
    });
    setCurrentModalId(id);
  };

  useEffect(() => {
    if (user?.current_rental) {
      const currentStatus = user.current_rental.rental_details.status;

      // Если статус изменился и модалка открыта, обновляем её
      if (
        previousStatusRef.current !== null &&
        previousStatusRef.current !== currentStatus &&
        currentModalId
      ) {
        // Закрываем текущую модалку
        if (currentModalId) {
          closePushScreen(currentModalId);
          setCurrentModalId(null);
        }

        // Небольшая задержка для плавного перехода
        setTimeout(() => {
          // Показываем новую модалку соответствующую новому статусу
          const content = handleCarInteraction({
            user,
            notRentedCar: user.current_rental!.car_details,
            hideModal: () => {
              if (currentModalId) {
                closePushScreen(currentModalId);
                setCurrentModalId(null);
              }
            },
          });

          if (content) {
            showCarModal(content);
          }
        }, 100);
      }

      // Обновляем предыдущий статус
      previousStatusRef.current = currentStatus;
    } else {
      // Если аренды нет, сбрасываем предыдущий статус и закрываем модалку
      previousStatusRef.current = null;
      if (currentModalId) {
        closePushScreen(currentModalId);
        setCurrentModalId(null);
      }
    }
  }, [user?.current_rental, user, currentModalId, closePushScreen]);

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

  // Function to open push screens for components
  const openPushScreenComponent = (key: string) => {
    setCurrentComponent(key);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapComponent />

      <Drawer />
      {user?.current_rental === null ? (
        <Button
          variant="icon"
          className="absolute top-10 right-20 h-14 w-14 rounded-full bg-white shadow-lg hover:bg-gray-50 z-10"
          onClick={() => {
            openPushScreenComponent("search");
          }}
        >
          <SearchIcon />
        </Button>
      ) : null}
      <Button
        variant="icon"
        className="absolute top-10 right-4 h-14 w-14 rounded-full bg-white shadow-lg hover:bg-gray-50 z-10"
        onClick={() => {
          openPushScreenComponent("support");
        }}
      >
        <ChatIcon />
      </Button>

      {/* Using push screen system for components */}
      {currentComponent &&
        (() => {
          const component = components.find((c) => c.key === currentComponent);
          if (component) {
            const id = openBottomSheet(component.component, {
              direction: "right",
              height: "auto",
              onClose: () => {
                setCurrentComponent(null);
              },
            });
            return null; // The component is rendered by the push screen system
          }
          return null;
        })()}

      <FooterBtns />
    </div>
  );
}
