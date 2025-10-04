"use client";

import { cn } from "@/shared/utils/cn";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../button";
import { AnimatePresence, motion } from "framer-motion";

export interface ResponseBottomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  type?: "success" | "error";
}

export interface ResponseBottomModalContentProps {
  type: "success" | "error";
  title?: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export const ResponseBottomModal = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText,
  onButtonClick,
  type = "success",
}: ResponseBottomModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={onClose}
          />

          <ResponseBottomModalContent
            type={type}
            title={title}
            description={description}
            buttonText={buttonText}
            onButtonClick={onButtonClick}
          />
        </>
      )}
    </AnimatePresence>
  );

  if (!isBrowser) {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export const ResponseBottomModalContent = ({
  type,
  title,
  description,
  buttonText,
  onButtonClick,
}: ResponseBottomModalContentProps) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 200,
      }}
      className="fixed left-0 right-0 bottom-0 bg-white rounded-t-[40px] p-8 z-[9999]"
      data-response-modal="true"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100,
            delay: 0.2,
          }}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-6",
            type === "success" ? "bg-[#34C759]" : "bg-[#FF3B30]"
          )}
        >
          {type === "success" ? (
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.path
                d="M20 6L9 17L4 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </motion.svg>
          ) : (
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <motion.path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM15 9l-6 6M9 9l6 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </motion.svg>
          )}
        </motion.div>

        {/* Content with animation */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-[18px] font-medium mb-2 text-[#191919]"
        >
          {title ?? ""}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-[18px] mb-8 text-[#191919] whitespace-pre-line"
        >
          {typeof description === 'string' ? description : JSON.stringify(description)}
        </motion.p>

        {/* Button with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="w-full"
        >
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              onButtonClick();
            }}
          >
            {buttonText}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResponseBottomModal;
