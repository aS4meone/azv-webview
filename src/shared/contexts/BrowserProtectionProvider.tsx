"use client";

import React, { ReactNode } from "react";

interface BrowserProtectionProviderProps {
  children: ReactNode;
}

export const BrowserProtectionProvider: React.FC<
  BrowserProtectionProviderProps
> = ({ children }) => {
  return <>{children}</>;
};
