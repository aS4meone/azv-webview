import { ArrowLeftIcon } from "@/shared/icons";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface PushScreenProps {
  onClose?: () => void;
  children: React.ReactNode;
  withOutStyles?: boolean;
}

const PushScreen = ({
  onClose,
  children,
  withOutStyles = false,
}: PushScreenProps) => {
  if (withOutStyles != null && withOutStyles) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="fixed inset-0 bg-white z-50 overflow-scroll"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="fixed inset-0 bg-white z-50 px-8 py-10"
      >
        <div className="min-h-screen">
          <div className="flex items-center h-[48px]">
            <button onClick={onClose} className="text-[#007AFF]">
              <ArrowLeftIcon className="w-7 h-7" />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PushScreen;
