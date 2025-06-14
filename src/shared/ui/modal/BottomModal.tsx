"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface BottomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnScroll?: boolean;
}

export const BottomModal = ({
  isOpen,
  onClose,
  children,
  closeOnScroll = false,
}: BottomModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!closeOnScroll || !onClose || !isOpen) return;

    let startY = 0;
    let currentY = 0;
    let isSwipeStarted = false;
    let startScrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isSwipeStarted = true;

      // Запоминаем начальную позицию скролла
      const scrollableElement = document.querySelector(
        ".overflow-y-auto, .overflow-scroll"
      );
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
      const scrollableElement = document.querySelector(
        ".overflow-y-auto, .overflow-scroll"
      );
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
  }, [closeOnScroll, onClose, isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-20"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            className="fixed left-0 right-0 bottom-0 z-20"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!isBrowser) {
    return null;
  }

  return createPortal(modalContent, document.body);
};
