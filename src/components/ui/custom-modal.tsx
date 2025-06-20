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
                  : variant === "bottom" && "max-h-[85vh] touch-pan-y"
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
              drag={variant === "bottom" ? "y" : undefined}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0}
              dragDirectionLock
              dragMomentum={false}
              dragSnapToOrigin={false}
              whileDrag={{ cursor: "grabbing" }}
              onDrag={(e, info) => {
                if (variant === "bottom" && info.offset.y < 0) {
                  e.preventDefault();
                }
              }}
              onDragEnd={(e, info) => {
                if (variant === "bottom" && info.offset.y > 100) {
                  onClose();
                }
              }}
              onClick={(e) => e.stopPropagation()}
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
