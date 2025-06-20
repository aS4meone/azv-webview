"use client";

import * as React from "react";
import { Drawer as VaulDrawer } from "vaul";
import { cn } from "@/shared/utils/cn";

interface DrawerProps {
  children: React.ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
  trigger?: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
}

export function Drawer({
  children,
  direction = "bottom",
  trigger = <button>Open Drawer</button>,
  title,
  className,
  contentClassName,
}: DrawerProps) {
  return (
    <VaulDrawer.Root
      direction={direction}
      dismissible={true}
      shouldScaleBackground={true}
    >
      <VaulDrawer.Trigger asChild>{trigger}</VaulDrawer.Trigger>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <VaulDrawer.Content
          className={cn(
            "bg-white flex flex-col fixed z-50 overflow-hidden",
            // Base styles for different directions
            direction === "bottom" && [
              "bottom-0 left-0 right-0",
              "rounded-t-[10px]",
              "min-h-[50vh] max-h-[95vh]",
            ],
            direction === "top" && [
              "top-0 left-0 right-0",
              "rounded-b-[10px]",
              "min-h-[50vh] max-h-[95vh]",
            ],
            direction === "left" && [
              "left-0 top-0 bottom-0",
              "rounded-r-[10px]",
              "w-[90vw] max-w-[500px] h-full",
            ],
            direction === "right" && [
              "right-0 top-0 bottom-0",
              "rounded-l-[10px]",
              "w-[90vw] max-w-[500px] h-full",
            ],
            className
          )}
        >
          {/* Handle для перетаскивания */}
          {(direction === "bottom" || direction === "top") && (
            <div className="sticky top-0 pt-4 pb-2 bg-white z-50">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
            </div>
          )}

          {/* Заголовок */}
          {title && (
            <div className="sticky top-0 bg-white px-4 py-3 border-b z-50">
              <VaulDrawer.Title className="font-medium text-lg">
                {title}
              </VaulDrawer.Title>
            </div>
          )}

          {/* Контент со скроллом */}
          <div
            className={cn(
              "flex-1 overflow-y-auto overscroll-contain",
              "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
              "relative",
              contentClassName
            )}
          >
            {children}
          </div>

          {/* Кнопка закрытия */}
          <VaulDrawer.Close className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </VaulDrawer.Close>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
