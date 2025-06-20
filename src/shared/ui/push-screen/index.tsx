"use client";
import { ArrowLeftIcon } from "@/shared/icons";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

interface PushScreenProps {
  onClose?: () => void;
  children: React.ReactNode;
  withOutStyles?: boolean;
  withCloseButton?: boolean;
}

const PushScreen = ({
  onClose,
  children,
  withOutStyles = false,
  withCloseButton = false,
}: PushScreenProps) => {
  const wrappedOnClose = () => {};

  const handleTouchEvents = {};

  const getInitialAnimation = () => {
    return { opacity: 0, y: "100%" };
  };

  if (withOutStyles != null && withOutStyles) {
    return (
      <AnimatePresence>
        <motion.div
          initial={getInitialAnimation()}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className={`fixed inset-0 z-30 bg-white push-screen-container`}
          data-push-screen="true"
          {...handleTouchEvents}
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
        initial={getInitialAnimation()}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className={`fixed inset-0 z-30 bg-white px-8 py-10 overflow-y-auto push-screen-container`}
        style={{ pointerEvents: "auto" }}
        data-push-screen="true"
        {...handleTouchEvents}
      >
        <div className="min-h-screen">
          {withCloseButton && (
            <div className="flex items-center h-[48px]">
              <button onClick={wrappedOnClose} className="text-[#007AFF]">
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
