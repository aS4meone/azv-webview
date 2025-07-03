"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../button";

interface PushScreenProps {
  onClose?: () => void;
  children: React.ReactNode;
  withOutStyles?: boolean;
  withCloseButton?: boolean;
}

const PushScreen = ({
  children,
  withOutStyles = false,
  withCloseButton = false,
  onClose,
}: PushScreenProps) => {
  const wrappedOnClose = () => {
    onClose?.();
  };

  if (withOutStyles != null && withOutStyles) {
    return (
      <AnimatePresence>
        <motion.div
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className={`fixed inset-0 z-30 bg-white`}
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
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className={`fixed inset-0 z-30 bg-white px-8 py-10`}
        style={{ pointerEvents: "auto" }}
        data-push-screen="true"
      >
        <div className="min-h-screen pt-12">
          {withCloseButton && (
            <div className="absolute right-4 top-10 z-10 pt-6">
              <Button onClick={wrappedOnClose} variant="icon">
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
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PushScreen;
