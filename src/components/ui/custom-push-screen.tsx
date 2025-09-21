"use client";

import { cn } from "@/lib/utils";
import { LogoIcon } from "@/shared/icons";
import { Button } from "@/shared/ui";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { zIndexManager } from "@/shared/utils/z-index-manager";

interface CustomPushScreenProps {
  isOpen: boolean;
  direction?: "bottom" | "top" | "left" | "right";
  onClose: () => void;
  children: React.ReactNode;
  withHeader?: boolean;
  fullScreen?: boolean;
  height?: string;
  title?: string;
  className?: string;
  isCloseable?: boolean;
  touchPropagation?: "block" | "bubble";
  lockBodyScroll?: boolean;
  withCloseButton?: boolean;
}

export function CustomPushScreen({
  isOpen,
  direction = "right",
  onClose,
  children,
  withHeader = true,
  fullScreen = true,
  height = "auto",
  title,
  className,
  touchPropagation = "block",
  lockBodyScroll=true,
  isCloseable = false,
  withCloseButton = true,
}: CustomPushScreenProps) {
  const [zIndex, setZIndex] = useState(zIndexManager.current());
  const [mounted, setMounted] = useState(false);
  const isVertical = direction === "bottom" || direction === "top";

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Лочим body только когда панель открыта (и если это нужно вызывающему коду)
  useEffect(() => {
    if (!mounted || !lockBodyScroll) return;
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, mounted, lockBodyScroll]);

  useEffect(() => {
    if (isOpen) setZIndex(zIndexManager.increment());
    return () => {
      if (isOpen) zIndexManager.decrement();
    };
  }, [isOpen]);

  const initialPosition = {
    bottom: { y: "100%", x: 0 },
    top: { y: "-100%", x: 0 },
    right: { x: "100%", y: 0 },
    left: { x: "-100%", y: 0 },
  }[direction];

  const exitPosition = initialPosition;

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
            onClick={
              isCloseable
                ? () => {
                    onClose();
                  }
                : undefined
            }
          />
          <motion.div
            className={cn(
              "push-screen fixed bg-white flex flex-col",
              direction === "bottom" && "rounded-t-3xl",
              fullScreen
                ? "inset-0"
                : {
                    "bottom-0 left-0 right-0": direction === "bottom",
                    "top-0 left-0 right-0": direction === "top",
                    "top-0 bottom-0 right-0": direction === "right",
                    "top-0 bottom-0 left-0": direction === "left",
                  }
            )}
            style={{
              zIndex,
              height: !fullScreen && isVertical ? height : undefined,
              width: !fullScreen && !isVertical ? height : undefined,
            }}
            initial={initialPosition}
            animate={{ x: 0, y: 0 }}
            exit={exitPosition}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {withCloseButton && (
              <div className="absolute right-4 top-10 z-10 pt-2">
                <Button onClick={onClose} variant="icon" className="shadow-sm">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </div>
            )}
            {withHeader &&
              (direction === "bottom" ? (
                <>
                  {isCloseable && (
                    <div className="absolute right-4 top-10 z-10 pt-6">
                      <Button onClick={onClose} variant="icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6 6L18 18"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <header className="flex items-center gap-6 px-6 pt-12 pb-4 mt-4 transition-shadow duration-200">
                  <LogoIcon isBlack />

                  <div className="flex items-center">
                    {isCloseable && (
                      <Button onClick={onClose} variant="icon" className="mr-2">
                        <ArrowLeftIcon color="black" />
                      </Button>
                    )}
                  </div>

                  {title && <h1 className="text-xl">{title}</h1>}
                </header>
              ))}

            <div
              className={cn(
                "flex-1 overflow-y-auto px-3",
                direction === "bottom" && "pb-10",
                className
              )}
              style={{
                touchAction: "pan-y",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
              }}
              {...(touchPropagation === "block"
                ? {
                  onTouchStart: (e) => e.stopPropagation(),
                  onTouchMove: (e) => e.stopPropagation(),
                  onTouchEnd: (e) => e.stopPropagation(),
                }
                : {})}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(content, document.body);
}
