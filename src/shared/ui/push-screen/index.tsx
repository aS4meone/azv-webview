"use client";
import { ArrowLeftIcon } from "@/shared/icons";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";

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
  closeOnScroll = false,
}: PushScreenProps) => {
  useEffect(() => {
    if (!closeOnScroll || !onClose) return;

    let startY = 0;
    let currentY = 0;
    let isSwipeStarted = false;
    let startScrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isSwipeStarted = true;

      // Запоминаем начальную позицию скролла
      const scrollableElement = document.querySelector(".overflow-y-auto");
      startScrollTop = scrollableElement?.scrollTop || window.scrollY || 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipeStarted) return;
      currentY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (!isSwipeStarted) return;

      const deltaY = currentY - startY;

      // Проверяем, был ли скролл во время свайпа
      const scrollableElement = document.querySelector(".overflow-y-auto");
      const currentScrollTop =
        scrollableElement?.scrollTop || window.scrollY || 0;
      const scrolledDuringSwipe =
        Math.abs(currentScrollTop - startScrollTop) > 10;

      // Закрываем только если:
      // 1. Свайп вниз больше 100px
      // 2. Не было скролла во время свайпа
      // 3. Скролл находится в самом верху (scrollTop близко к 0)
      if (deltaY > 100 && !scrolledDuringSwipe && startScrollTop < 50) {
        onClose();
      }

      isSwipeStarted = false;
      startY = 0;
      currentY = 0;
    };

    // Добавляем слушатели на body, чтобы ловить touch события везде
    document.body.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.body.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    document.body.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    return () => {
      document.body.removeEventListener("touchstart", handleTouchStart);
      document.body.removeEventListener("touchmove", handleTouchMove);
      document.body.removeEventListener("touchend", handleTouchEnd);
    };
  }, [closeOnScroll, onClose]);

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
          className="fixed inset-0 z-50 bg-white"
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
        className="fixed inset-0 z-[9999] bg-white px-8 py-10 overflow-y-auto"
        style={{ pointerEvents: "auto" }}
      >
        <div className="min-h-screen">
          {withCloseButton && (
            <div className="flex items-center h-[48px]">
              <button onClick={onClose} className="text-[#007AFF]">
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
