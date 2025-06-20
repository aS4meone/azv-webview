"use client";
import { ArrowLeftIcon } from "@/shared/icons";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface PushScreenProps {
  onClose?: () => void;
  children: React.ReactNode;
  withOutStyles?: boolean;
  withCloseButton?: boolean;
  closeOnScroll?: boolean;
  direction?: "left" | "bottom";
}

const PushScreen = ({
  onClose,
  children,
  withOutStyles = false,
  withCloseButton = false,
  closeOnScroll = true,
  direction = "bottom",
}: PushScreenProps) => {
  const [, setIsClosing] = useState(false);

  const wrappedOnClose = () => {
    console.log("PushScreen: starting close animation");
    setIsClosing(true);

    // Блокируем другие touch события на время анимации
    document.body.setAttribute("data-push-screen-closing", "true");

    // Задержка для анимации (400ms как в transition)
    setTimeout(() => {
      document.body.removeAttribute("data-push-screen-closing");
      if (onClose) onClose();
    }, 100); // Небольшая задержка, чтобы заблокировать события
  };

  useEffect(() => {
    if (closeOnScroll !== true || !onClose) {
      console.log("PushScreen: closeOnScroll disabled or no onClose", {
        closeOnScroll,
        hasOnClose: !!onClose,
      });
      return;
    }

    console.log("PushScreen: setting up touch events for closeOnScroll");

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let initialScrollTop = 0;
    let currentScrollTop = 0;
    let hasMoved = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Проверяем, что touch начался внутри PushScreen, но НЕ в модалях
      const target = e.target as Element;
      const pushScreen = target.closest('[data-push-screen="true"]');
      const bottomModal = target.closest('[data-bottom-modal="true"]');
      const responseModal = target.closest('[data-response-modal="true"]');

      // Игнорируем touch события в модалях (они имеют более высокий приоритет)
      if (bottomModal || responseModal) {
        console.log("PushScreen: ignoring touch - modal has higher priority");
        return;
      }

      if (!pushScreen) return;

      // Ищем скроллируемый элемент
      const scrollableElement =
        (pushScreen.querySelector(
          ".overflow-y-auto, .overflow-auto, .overflow-scroll"
        ) as HTMLElement) ||
        (pushScreen.scrollHeight > pushScreen.clientHeight ? pushScreen : null);

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      hasMoved = false;

      // Запоминаем начальную позицию скролла
      if (scrollableElement) {
        initialScrollTop = scrollableElement.scrollTop;
        currentScrollTop = scrollableElement.scrollTop;
      } else {
        initialScrollTop = 0;
        currentScrollTop = 0;
      }

      console.log("PushScreen: touch start", {
        startX,
        startY,
        scrollTop: initialScrollTop,
        hasScrollableElement: !!scrollableElement,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      hasMoved = true;

      // Обновляем текущую позицию скролла
      const target = e.target as Element;
      const pushScreen = target.closest('[data-push-screen="true"]');
      const bottomModal = target.closest('[data-bottom-modal="true"]');
      const responseModal = target.closest('[data-response-modal="true"]');

      // Игнорируем touch события в модалях (они имеют более высокий приоритет)
      if (bottomModal || responseModal) return;
      if (!pushScreen) return;

      const scrollableElement =
        (pushScreen.querySelector(
          ".overflow-y-auto, .overflow-auto, .overflow-scroll"
        ) as HTMLElement) ||
        (pushScreen.scrollHeight > pushScreen.clientHeight ? pushScreen : null);

      if (scrollableElement) {
        currentScrollTop = scrollableElement.scrollTop;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Проверяем, что touch закончился внутри PushScreen, но НЕ в модалях
      const target = e.changedTouches[0].target as Element;
      const pushScreen = target.closest('[data-push-screen="true"]');
      const bottomModal = target.closest('[data-bottom-modal="true"]');
      const responseModal = target.closest('[data-response-modal="true"]');

      // Игнорируем touch события в модалях (они имеют более высокий приоритет)
      if (bottomModal || responseModal) {
        console.log(
          "PushScreen: ignoring touch end - modal has higher priority"
        );
        return;
      }

      if (!pushScreen) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      const scrollDelta = Math.abs(currentScrollTop - initialScrollTop);

      // Условия для закрытия PushScreen:
      // 1. Был ли реальный свайп (движение)
      // 2. Свайп вниз больше 80px
      // 3. Свайп достаточно быстрый (меньше 700мс)
      // 4. Нет значительного скролла (меньше 30px)
      // 5. Скролл в самом верху (меньше 20px) или нет скроллируемого контента
      const scrollableElement =
        (pushScreen.querySelector(
          ".overflow-y-auto, .overflow-auto, .overflow-scroll"
        ) as HTMLElement) ||
        (pushScreen.scrollHeight > pushScreen.clientHeight ? pushScreen : null);

      const isValidSwipe =
        hasMoved &&
        deltaTime < 700 &&
        scrollDelta < 30 &&
        (currentScrollTop < 20 || !scrollableElement) &&
        ((direction === "bottom" && deltaY > 80) ||
          (direction === "left" && deltaX < -80));

      console.log("PushScreen: touch end", {
        startX,
        startY,
        endX,
        endY,
        deltaX,
        deltaY,
        deltaTime,
        scrollDelta,
        currentScrollTop,
        initialScrollTop,
        hasMoved,
        hasScrollableElement: !!scrollableElement,
        isValidSwipe,
      });

      if (isValidSwipe) {
        console.log(
          `PushScreen: CLOSING due to valid swipe ${
            direction === "bottom" ? "down" : "left"
          }`
        );
        wrappedOnClose();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      console.log("PushScreen: cleaning up touch events");
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [closeOnScroll, onClose, wrappedOnClose, direction]);

  const handleTouchEvents = {};

  const getInitialAnimation = () => {
    return direction === "bottom"
      ? { opacity: 0, y: "100%" }
      : { opacity: 0, x: "100%" };
  };

  const getExitAnimation = () => {
    return direction === "bottom"
      ? { opacity: 0, y: "100%" }
      : { opacity: 0, x: "100%" };
  };

  if (withOutStyles != null && withOutStyles) {
    return (
      <AnimatePresence>
        <motion.div
          initial={getInitialAnimation()}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={getExitAnimation()}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className={`fixed inset-0 z-30 bg-white push-screen-container ${
            direction === "left"
              ? "border-l border-gray-200"
              : "rounded-t-[24px]"
          }`}
          data-push-screen="true"
          {...handleTouchEvents}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {/* Основной контент */}
      <motion.div
        initial={getInitialAnimation()}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={getExitAnimation()}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className={`fixed inset-0 z-30 bg-white px-8 py-10 overflow-y-auto push-screen-container ${
          direction === "left" ? "border-l border-gray-200" : "rounded-t-[24px]"
        }`}
        style={{ pointerEvents: "auto" }}
        data-push-screen="true"
        {...handleTouchEvents}
      >
        <div className="min-h-screen">
          {withCloseButton && (
            <div className="flex items-center h-[48px]">
              <button onClick={wrappedOnClose} className="text-[#007AFF]">
                <ArrowLeftIcon className="w-7 h-7" />
              </button>
            </div>
          )}
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PushScreen;
