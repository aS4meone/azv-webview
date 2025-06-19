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
}

const PushScreen = ({
  onClose,
  children,
  withOutStyles = false,
  withCloseButton = false,
  closeOnScroll = true,
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

      const endY = e.changedTouches[0].clientY;
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
        deltaY > 80 &&
        deltaTime < 700 &&
        scrollDelta < 30 &&
        (currentScrollTop < 20 || !scrollableElement);

      console.log("PushScreen: touch end", {
        startY,
        endY,
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
        console.log("PushScreen: CLOSING due to valid swipe down");
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
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [closeOnScroll, onClose, wrappedOnClose]);

  const handleTouchEvents = {};

  if (withOutStyles != null && withOutStyles) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="fixed inset-0 z-30 bg-white push-screen-container"
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
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="fixed inset-0 z-30 bg-white px-8 py-10 overflow-y-auto push-screen-container"
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
