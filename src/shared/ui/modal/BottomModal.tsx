"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface BottomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomModal = ({
  isOpen,
  onClose,
  children,
}: BottomModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

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
