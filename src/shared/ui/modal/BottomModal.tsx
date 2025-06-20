"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CustomModal } from "@/components/ui/custom-modal";

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

  if (!isBrowser) {
    return null;
  }

  return createPortal(
    <CustomModal isOpen={isOpen} onClose={onClose} variant="bottom">
      {children}
    </CustomModal>,
    document.body
  );
};
