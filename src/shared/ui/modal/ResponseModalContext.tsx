"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ResponseBottomModal } from "./ResponseBottomModal";

interface ResponseModalContextType {
  showModal: (params: {
    type: "success" | "error";
    title?: string;
    description: string;
    buttonText: string;
    onButtonClick?: () => void;
    onClose?: () => void;
  }) => void;
  hideModal: () => void;
}

const ResponseModalContext = createContext<
  ResponseModalContextType | undefined
>(undefined);

export const ResponseModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: "success" | "error";
    title?: string;
    description: string;
    buttonText: string;
    onButtonClick?: () => void;
    onClose?: () => void;
  } | null>(null);

  const showModal = (params: {
    type: "success" | "error";
    title?: string;
    description: string;
    buttonText: string;
    onButtonClick?: () => void;
    onClose?: () => void;
  }) => {
    setModalConfig(params);
    setTimeout(() => {
      setIsOpen(true);
    }, 0);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (modalConfig?.onButtonClick) {
      modalConfig.onButtonClick();
    }
    hideModal();
  };

  return (
    <ResponseModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalConfig && (
        <ResponseBottomModal
          isOpen={isOpen}
          onClose={() => {
            hideModal();
            modalConfig.onClose?.();
          }}
          type={modalConfig.type}
          title={modalConfig.title || ""}
          description={modalConfig.description}
          buttonText={modalConfig.buttonText}
          onButtonClick={handleButtonClick}
        />
      )}
    </ResponseModalContext.Provider>
  );
};

export const useResponseModal = () => {
  const context = useContext(ResponseModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ResponseModalProvider");
  }
  return context;
};
