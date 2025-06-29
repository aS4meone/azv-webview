"use client";

import { usePushScreen } from "../contexts/PushScreenContext";
import { ReactNode } from "react";

interface OpenPushScreenOptions {
  direction?: "bottom" | "top" | "left" | "right";
  withHeader?: boolean;
  fullScreen?: boolean;
  height?: string;
  title?: string;
  className?: string;
  isCloseable?: boolean;
  onClose?: () => void;
}

export function usePushScreenActions() {
  const {
    openPushScreen,
    closePushScreen,
    closeAllPushScreens,
    updatePushScreen,
  } = usePushScreen();

  const openModal = (
    children: ReactNode,
    options: OpenPushScreenOptions = {}
  ) => {
    return openPushScreen({
      children,
      direction: "bottom",
      fullScreen: false,
      height: "auto",
      withHeader: false,
      isCloseable: true,
      ...options,
    });
  };

  const openFullScreen = (
    children: ReactNode,
    options: OpenPushScreenOptions = {}
  ) => {
    return openPushScreen({
      children,
      direction: "right",
      fullScreen: true,
      withHeader: true,
      isCloseable: true,
      ...options,
    });
  };

  const openBottomSheet = (
    children: ReactNode,
    options: OpenPushScreenOptions = {}
  ) => {
    return openPushScreen({
      children,
      direction: "bottom",
      fullScreen: false,
      height: "50vh",
      withHeader: false,
      isCloseable: true,
      ...options,
    });
  };

  const openSidebar = (
    children: ReactNode,
    options: OpenPushScreenOptions = {}
  ) => {
    return openPushScreen({
      children,
      direction: "left",
      fullScreen: false,
      height: "300px",
      withHeader: true,
      isCloseable: true,
      ...options,
    });
  };

  return {
    // Raw methods
    openPushScreen,
    closePushScreen,
    closeAllPushScreens,
    updatePushScreen,

    // Convenience methods
    openModal,
    openFullScreen,
    openBottomSheet,
    openSidebar,
  };
}
