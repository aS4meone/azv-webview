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
  closeOnScroll = true,
}: BottomModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Добавляем touch события для закрытия на свайп
  useEffect(() => {
    if (closeOnScroll !== true || !onClose || !isOpen) return;

    let startY = 0;
    let startTime = 0;
    let initialScrollTop = 0;
    let startScrollTop = 0;
    let hasMoved = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Проверяем, что PushScreen не закрывается
      if (document.body.hasAttribute("data-push-screen-closing")) {
        console.log("BottomModal: ignoring touch - PushScreen is closing");
        return;
      }

      // Проверяем, что touch начался внутри нашего модала
      const target = e.target as Element;
      const bottomModal = target.closest('[data-bottom-modal="true"]');
      if (!bottomModal) return;

      // Проверяем, что нет модалей с более высоким z-index
      const responseModal = target.closest('[data-response-modal="true"]');
      if (responseModal) {
        console.log(
          "BottomModal: ignoring touch - ResponseModal has higher priority"
        );
        return;
      }

      // Проверяем PushScreen - игнорируем только если touch ВНУТРИ PushScreen
      const pushScreen = target.closest('[data-push-screen="true"]');
      if (pushScreen && bottomModal.contains(pushScreen)) {
        console.log(
          "BottomModal: ignoring touch - touch is inside nested PushScreen"
        );
        return;
      }

      // Получаем scrollable элемент
      const scrollableElement =
        (bottomModal.querySelector(
          ".overflow-y-auto, .overflow-auto, .overflow-scroll"
        ) as HTMLElement) ||
        (bottomModal.scrollHeight > bottomModal.clientHeight
          ? bottomModal
          : null);

      startY = e.touches[0].clientY;
      startTime = Date.now();
      hasMoved = false;

      // Запоминаем начальную позицию скролла
      if (scrollableElement) {
        initialScrollTop = scrollableElement.scrollTop;
        startScrollTop = scrollableElement.scrollTop;
      } else {
        initialScrollTop = 0;
        startScrollTop = 0;
      }

      console.log("BottomModal: touch start", {
        startY,
        scrollTop: startScrollTop,
        hasScrollableElement: !!scrollableElement,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Проверяем, что PushScreen не закрывается
      if (document.body.hasAttribute("data-push-screen-closing")) return;

      hasMoved = true;

      // Обновляем текущую позицию скролла
      const target = e.target as Element;
      const bottomModal = target.closest('[data-bottom-modal="true"]');
      if (!bottomModal) return;

      // Проверяем, что нет модалей с более высоким z-index
      const responseModal = target.closest('[data-response-modal="true"]');
      if (responseModal) return;

      // Проверяем PushScreen - игнорируем только если touch ВНУТРИ PushScreen
      const pushScreen = target.closest('[data-push-screen="true"]');
      if (pushScreen && bottomModal.contains(pushScreen)) return;

      const scrollableElement =
        (bottomModal.querySelector(
          ".overflow-y-auto, .overflow-auto, .overflow-scroll"
        ) as HTMLElement) ||
        (bottomModal.scrollHeight > bottomModal.clientHeight
          ? bottomModal
          : null);

      if (scrollableElement) {
        startScrollTop = scrollableElement.scrollTop;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Проверяем, что PushScreen не закрывается
      if (document.body.hasAttribute("data-push-screen-closing")) {
        console.log("BottomModal: ignoring touch end - PushScreen is closing");
        return;
      }

      // Проверяем, что touch закончился внутри нашего модала
      const target = e.changedTouches[0].target as Element;
      const bottomModal = target.closest('[data-bottom-modal="true"]');
      if (!bottomModal) return;

      // Проверяем, что нет модалей с более высоким z-index
      const responseModal = target.closest('[data-response-modal="true"]');
      if (responseModal) {
        console.log(
          "BottomModal: ignoring touch end - ResponseModal has higher priority"
        );
        return;
      }

      // Проверяем PushScreen - игнорируем только если touch ВНУТРИ PushScreen
      const pushScreen = target.closest('[data-push-screen="true"]');
      if (pushScreen && bottomModal.contains(pushScreen)) {
        console.log(
          "BottomModal: ignoring touch end - touch is inside nested PushScreen"
        );
        return;
      }

      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      // Получаем scrollable элемент
      const scrollableElement =
        (bottomModal.querySelector(
          ".overflow-y-auto, .overflow-auto, .overflow-scroll"
        ) as HTMLElement) ||
        (bottomModal.scrollHeight > bottomModal.clientHeight
          ? bottomModal
          : null);

      const currentScrollTop = scrollableElement
        ? scrollableElement.scrollTop
        : 0;
      const scrollDelta = Math.abs(currentScrollTop - initialScrollTop);

      // Проверяем условия для закрытия:
      // 1. Был ли реальный свайп (движение)
      // 2. Свайп вниз больше 100px
      // 3. Свайп достаточно быстрый (меньше 800мс)
      // 4. Нет значительного скролла (меньше 20px)
      // 5. Скролл в самом верху (меньше 10px) или нет скроллируемого контента
      const isValidSwipe =
        hasMoved &&
        deltaY > 100 &&
        deltaTime < 800 &&
        scrollDelta < 20 &&
        (currentScrollTop < 10 || !scrollableElement);

      console.log("BottomModal: touch end", {
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
        console.log("BottomModal: closing due to valid swipe down");
        onClose();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
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
            className="fixed inset-0 bg-black/50 z-10"
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
            className="fixed left-0 right-0 bottom-0 z-10"
            data-bottom-modal="true"
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
