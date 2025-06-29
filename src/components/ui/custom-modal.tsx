"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { zIndexManager } from "@/shared/utils/z-index-manager";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: "center" | "bottom";
}

// Утилита для детекции Flutter webview
const isFlutterWebView = () => {
  return typeof window !== "undefined" && !!window.flutter_inappwebview;
};

export function CustomModal({
  isOpen,
  onClose,
  children,
  variant = "center",
}: CustomModalProps) {
  const [zIndex, setZIndex] = useState(zIndexManager.current());
  const [mounted, setMounted] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  const isWebView = isFlutterWebView();
  const threshold = 100;

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      setZIndex(zIndexManager.increment());
    }
    return () => {
      if (isOpen) {
        zIndexManager.decrement();
      }
    };
  }, [isOpen, children]);

  // Нативная обработка touch для webview
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isWebView || variant !== "bottom") return;

    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    isDragging.current = true;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isWebView || variant !== "bottom" || !isDragging.current) return;

    currentY.current = e.touches[0].clientY;
    const offset = Math.max(0, currentY.current - startY.current);
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isWebView || variant !== "bottom" || !isDragging.current) return;

    isDragging.current = false;
    const offset = currentY.current - startY.current;

    if (offset > threshold) {
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: zIndex - 1 }}
            onClick={onClose}
          />
          <div
            className={cn(
              "fixed inset-0 flex",
              variant === "center" ? "items-center justify-center" : "items-end"
            )}
            style={{ zIndex }}
            onClick={onClose}
          >
            <motion.div
              ref={modalRef}
              className={cn(
                "rounded-t-3xl relative flex flex-col overflow-hidden w-full",
                variant === "center"
                  ? "max-w-md"
                  : variant === "bottom" &&
                      "max-h-[85vh] bottom-0 left-0 right-0"
              )}
              initial={
                variant === "center"
                  ? { scale: 0.95, opacity: 0 }
                  : { y: "100%" }
              }
              animate={
                variant === "center"
                  ? { scale: 1, opacity: 1 }
                  : { y: isWebView ? dragOffset : 0 }
              }
              exit={
                variant === "center"
                  ? { scale: 0.95, opacity: 0 }
                  : { y: "100%" }
              }
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
              }}
              // Для браузера используем framer-motion drag
              drag={!isWebView && variant === "bottom" ? "y" : false}
              dragDirectionLock
              dragConstraints={
                !isWebView && variant === "bottom"
                  ? { top: 0, bottom: 200, left: 0, right: 0 }
                  : { top: 0, bottom: 0, left: 0, right: 0 }
              }
              dragElastic={0.2}
              onDragEnd={
                !isWebView
                  ? (e, info) => {
                      const offset = info.offset.y;
                      if (variant === "bottom" && offset > threshold) {
                        onClose();
                        console.log("onDragEnd", offset, threshold);
                      }
                    }
                  : undefined
              }
              // Для webview используем нативные touch события
              onTouchStart={isWebView ? handleTouchStart : undefined}
              onTouchMove={isWebView ? handleTouchMove : undefined}
              onTouchEnd={isWebView ? handleTouchEnd : undefined}
              onClick={(e) => e.stopPropagation()}
              style={{
                // Для webview добавляем transform для плавного движения
                transform:
                  isWebView && variant === "bottom"
                    ? `translateY(${dragOffset}px)`
                    : undefined,
              }}
            >
              <div className="flex-1 overflow-y-auto w-full">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(content, document.body);
}
