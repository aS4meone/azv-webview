"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { zIndexManager } from "@/shared/utils/z-index-manager";

export type VehicleActionType = "takeKey" | "giveKey" | "lock" | "unlock";

interface VehicleActionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: VehicleActionType;
}

const successConfig = {
  takeKey: {
    title: "Пауза",
    description: "Автомобиль поставлен на паузу",
  },
  giveKey: {
    title: "Поездка начата",
    description: "Можете начинать поездку",
  },
  lock: {
    title: "Автомобиль заблокирован",
    description: "Автомобиль заблокирован",
  },
  unlock: {
    title: "Автомобиль разблокирован",
    description: "Автомобиль разблокирован",
  },
};

export const VehicleActionSuccessModal = ({
  isOpen,
  onClose,
  actionType,
}: VehicleActionSuccessModalProps) => {
  const config = successConfig[actionType];
  const [zIndex, setZIndex] = useState(zIndexManager.current());

  useEffect(() => {
    if (isOpen) {
      setZIndex(zIndexManager.increment());
    }
    return () => {
      if (isOpen) {
        zIndexManager.decrement();
      }
    };
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            style={{ zIndex: zIndex - 1 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 m-auto rounded-t-[24px] p-8 flex items-center justify-center"
            style={{ zIndex }}
          >
            <div className="text-[18px] mb-8 text-white text-center">
              {config.title}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
