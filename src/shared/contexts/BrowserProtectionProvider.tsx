"use client";

import React, { ReactNode } from "react";
import { useBrowserProtection } from "@/shared/hooks/useBrowserProtection";

interface BrowserProtectionProviderProps {
  children: ReactNode;
}

/**
 * 🔒 Провайдер браузерной защиты для Next.js
 * Автоматически инициализирует защиту для всего приложения
 */
export const BrowserProtectionProvider: React.FC<
  BrowserProtectionProviderProps
> = ({ children }) => {
  // Инициализируем защиту браузера
  // ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ РАЗРАБОТКИ
  // useBrowserProtection();

  return <>{children}</>;
};
