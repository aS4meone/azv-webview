"use client";

import { useEffect } from "react";
import { initLocalStorageCleanup } from "@/shared/utils/cleanupLocalStorage";

/**
 * Component that initializes localStorage cleanup on mount
 * Should be used once in the root layout
 */
export function LocalStorageCleanup() {
  useEffect(() => {
    initLocalStorageCleanup();
  }, []);

  return null;
}

