"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

/**
 * Хук для безопасной работы с переводами без проблем гидратации
 * Предотвращает различия между серверным и клиентским рендерингом
 */
export function useClientTranslations() {
  const [isClientMounted, setIsClientMounted] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Возвращаем функцию-обертку для безопасного получения переводов
  const safeT = (key: string, fallback = "") => {
    if (!isClientMounted) {
      return fallback;
    }

    try {
      return t(key);
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return fallback;
    }
  };

  // Возвращаем функцию для получения сырых данных переводов
  const safeRaw = (key: string, fallback: any = []) => {
    if (!isClientMounted) {
      return fallback;
    }

    try {
      return t.raw(key);
    } catch (error) {
      console.warn(`Raw translation missing for key: ${key}`);
      return fallback;
    }
  };

  return {
    t: safeT,
    raw: safeRaw,
    isClientMounted,
  };
}
