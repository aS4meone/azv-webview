"use client";

import { cn } from "@/shared/utils/cn";
import React, { createContext, useContext, useState } from "react";

// Context for tab state management
interface TabsContextType {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a Tabs component");
  }
  return context;
};

// Main Tabs component that provides context
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const activeTab = value ?? internalValue;
  const handleTabChange = (tab: string) => {
    if (onValueChange) {
      onValueChange(tab);
    } else {
      setInternalValue(tab);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

// TabsList component - container for tab triggers
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "rounded" | "pills";
}

export const TabsList = ({
  children,
  className,
  variant = "default",
}: TabsListProps) => {
  const variantClasses = {
    default: "flex bg-[#F4F4F4] rounded-full gap-2 p-1",
    rounded: "flex bg-gray-100 rounded-xl p-1",
    pills: "flex gap-2",
  };

  return (
    <div className={cn(variantClasses[variant], className)}>{children}</div>
  );
};

// TabsTrigger component - individual tab button
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TabsTrigger = ({
  value,
  children,
  className,
  disabled = false,
}: TabsTriggerProps) => {
  const { activeTab, onTabChange } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => !disabled && onTabChange(value)}
      disabled={disabled}
      className={cn(
        "flex-1 py-3 px-6 rounded-full text-base transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#191919] focus:ring-opacity-20",
        isActive
          ? "bg-[#191919] text-white transform scale-[0.98]"
          : "bg-transparent text-[#191919] hover:bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        className
      )}
    >
      {children}
    </button>
  );
};

// TabsContent component - content container for each tab
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export const TabsContent = ({
  value,
  children,
  className,
  forceMount = false,
}: TabsContentProps) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      className={cn(
        "focus:outline-none",
        !isActive && forceMount && "hidden",
        className
      )}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
};
