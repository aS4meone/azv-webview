"use client";

import { useState, useCallback, ReactNode } from "react";
import { PushScreenContext } from "./PushScreenContext";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";

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

interface PushScreenProviderProps {
  children: ReactNode;
}

export function PushScreenProvider({ children }: PushScreenProviderProps) {
  const [pushScreens, setPushScreens] = useState<PushScreenData[]>([]);

  const openPushScreen = useCallback((data: Omit<PushScreenData, "id">) => {
    const id = `push-screen-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newPushScreen: PushScreenData = {
      ...data,
      id,
    };

    setPushScreens((prev) => [...prev, newPushScreen]);
    return id;
  }, []);

  const closePushScreen = useCallback((id: string) => {
    setPushScreens((prev) => prev.filter((screen) => screen.id !== id));
  }, []);

  const closeAllPushScreens = useCallback(() => {
    setPushScreens([]);
  }, []);

  const updatePushScreen = useCallback(
    (id: string, updates: Partial<PushScreenData>) => {
      setPushScreens((prev) =>
        prev.map((screen) =>
          screen.id === id ? { ...screen, ...updates } : screen
        )
      );
    },
    []
  );

  const handleClose = useCallback(
    (id: string, customOnClose?: () => void) => {
      if (customOnClose) {
        customOnClose();
      }
      closePushScreen(id);
    },
    [closePushScreen]
  );

  return (
    <PushScreenContext.Provider
      value={{
        pushScreens,
        openPushScreen,
        closePushScreen,
        closeAllPushScreens,
        updatePushScreen,
      }}
    >
      {children}

      {/* Render all active push screens */}
      {pushScreens.map((screen) => (
        <CustomPushScreen
          key={screen.id}
          isOpen={true}
          direction={screen.direction}
          onClose={() => handleClose(screen.id, screen.onClose)}
          withHeader={screen.withHeader}
          fullScreen={screen.fullScreen}
          height={screen.height}
          title={screen.title}
          className={screen.className}
          isCloseable={screen.isCloseable}
        >
          {screen.children}
        </CustomPushScreen>
      ))}
    </PushScreenContext.Provider>
  );
}
