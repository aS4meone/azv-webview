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
  isCloseable = true,
}: CustomPushScreenProps) {
  const [zIndex, setZIndex] = useState(zIndexManager.current());
  const [mounted, setMounted] = useState(false);
  const isVertical = direction === "bottom" || direction === "top";
  const dragThreshold = 150;

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
            onClick={onClose}
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
            drag={isVertical ? "y" : "x"}
            dragDirectionLock
            dragConstraints={
              direction === "right"
                ? { top: 0, bottom: 0, left: 0, right: window.innerWidth }
                : direction === "left"
                ? { top: 0, bottom: 0, left: -window.innerWidth, right: 0 }
                : direction === "bottom"
                ? { top: 0, bottom: window.innerHeight, left: 0, right: 0 }
                : direction === "top"
                ? { top: -window.innerHeight, bottom: 0, left: 0, right: 0 }
                : { top: 0, bottom: 0, left: 0, right: 0 }
            }
            dragElastic={0}
            onDragEnd={(e, info) => {
              const offset = isVertical ? info.offset.y : info.offset.x;
              const threshold =
                dragThreshold *
                (direction === "left" || direction === "top" ? -1 : 1);
              if (
                (isCloseable && direction === "right" && offset > threshold) ||
                (isCloseable && direction === "left" && offset < threshold) ||
                (isCloseable && direction === "bottom" && offset > threshold) ||
                (isCloseable && direction === "top" && offset < threshold)
              ) {
                onClose();
              }
            }}
          >
            {withHeader &&
              (direction === "bottom" ? (
                <>
                  <Button
                    onClick={onClose}
                    variant="icon"
                    className="ml-auto absolute right-4 top-10 z-10"
                  >
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
                </>
              ) : (
                <header className="flex items-center justify-between px-6 pt-12 pb-4 transition-shadow duration-200">
                  <div className="flex items-center">
                    <Button onClick={onClose} variant="icon" className="mr-2">
                      <ArrowLeftIcon color="black" />
                    </Button>
                  </div>

                  {title && <h1 className="text-xl mr-4">{title}</h1>}
                  <LogoIcon isBlack />
                </header>
              ))}

            <div
              ref={(el) => {
                if (el) {
                  el.scrollTop = 0;
                }
              }}
              className={cn(
                "flex-1 overflow-y-auto px-6",
                direction === "bottom" && "pb-10",
                className
              )}
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
