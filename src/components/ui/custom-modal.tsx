"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { zIndexManager } from "@/shared/utils/z-index-manager";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: "center" | "bottom";
}

export function CustomModal({
  isOpen,
  onClose,
  children,
  variant = "center",
}: CustomModalProps) {
  const [zIndex, setZIndex] = useState(zIndexManager.current());
  const [mounted, setMounted] = useState(false);
  const [hasSwiperContent, setHasSwiperContent] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      setZIndex(zIndexManager.increment());
      // Check if children contain Swiper elements
      setTimeout(() => {
        const swiperElements = document.querySelectorAll(
          '.swiper, [class*="swiper"]'
        );
        setHasSwiperContent(swiperElements.length > 0);
      }, 0);
    }
    return () => {
      if (isOpen) {
        zIndexManager.decrement();
      }
    };
  }, [isOpen, children]);

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
              className={cn(
                "rounded-t-3xl relative flex flex-col overflow-hidden w-full",
                variant === "center"
                  ? "max-w-md"
                  : variant === "bottom" && "max-h-[85vh]"
              )}
              initial={
                variant === "center"
                  ? { scale: 0.95, opacity: 0 }
                  : { y: "100%" }
              }
              animate={
                variant === "center" ? { scale: 1, opacity: 1 } : { y: 0 }
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
              drag={variant === "bottom" && !hasSwiperContent ? "y" : false}
              dragDirectionLock
              dragConstraints={
                variant === "bottom" && !hasSwiperContent
                  ? { top: 0, bottom: window.innerHeight, left: 0, right: 0 }
                  : { top: 0, bottom: 0, left: 0, right: 0 }
              }
              dragElastic={0}
              dragMomentum={false}
              dragSnapToOrigin={false}
              whileDrag={!hasSwiperContent ? { cursor: "grabbing" } : {}}
              onDrag={
                !hasSwiperContent
                  ? (e, info) => {
                      if (variant === "bottom") {
                        // Only prevent if it's a clearly vertical drag with significant movement
                        const isVerticalDrag =
                          Math.abs(info.offset.y) >
                          Math.abs(info.offset.x) * 1.5;
                        const hasSignificantMovement =
                          Math.abs(info.offset.y) > 20;

                        if (
                          !isVerticalDrag ||
                          !hasSignificantMovement ||
                          info.offset.y < 0
                        ) {
                          e.preventDefault();
                        }
                      }
                    }
                  : undefined
              }
              onDragEnd={
                !hasSwiperContent
                  ? (e, info) => {
                      if (variant === "bottom" && info.offset.y > 100) {
                        onClose();
                      }
                    }
                  : undefined
              }
              onClick={(e) => e.stopPropagation()}
              style={{
                touchAction: hasSwiperContent ? "pan-x pan-y" : "pan-y",
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
