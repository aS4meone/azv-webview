"use client";

import { createContext, useContext } from "react";

interface PushScreenData {
  id: string;
  direction?: "bottom" | "top" | "left" | "right";
  children: React.ReactNode;
  withHeader?: boolean;
  fullScreen?: boolean;
  height?: string;
  title?: string;
  className?: string;
  isCloseable?: boolean;
  onClose?: () => void;
}

interface PushScreenContextType {
  pushScreens: PushScreenData[];
  openPushScreen: (data: Omit<PushScreenData, "id">) => string;
  closePushScreen: (id: string) => void;
  closeAllPushScreens: () => void;
  updatePushScreen: (id: string, updates: Partial<PushScreenData>) => void;
}

export const PushScreenContext = createContext<
  PushScreenContextType | undefined
>(undefined);

export function usePushScreen() {
  const context = useContext(PushScreenContext);
  if (!context) {
    throw new Error("usePushScreen must be used within a PushScreenProvider");
  }
  return context;
}
