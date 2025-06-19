"use client";

import React, { useContext } from "react";
import { BottomModal } from "./BottomModal";
import { ModalContext } from "./ModalContext";

export const ModalPortal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    return null;
  }

  const { isModalOpen, modalConfig, handleClose } = context;

  if (!modalConfig) {
    return null;
  }

  return (
    <BottomModal
      isOpen={isModalOpen}
      onClose={handleClose}
      closeOnScroll={true}
    >
      {modalConfig.children}
    </BottomModal>
  );
};
