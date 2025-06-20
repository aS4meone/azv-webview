"use client";

import { cn } from "@/shared/utils/cn";
import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode, useRef, useCallback } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "icon" | "danger";
  link?: string;
  asChild?: boolean;
}

const Button = ({
  children,
  variant = "primary",
  link,
  className,
  asChild,
  ...props
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastClickTime = useRef<number>(0);
  const CLICK_DEBOUNCE_TIME = 300;

  const disabled = props.disabled || false;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastClickTime.current < CLICK_DEBOUNCE_TIME) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      lastClickTime.current = currentTime;

      if (buttonRef.current) {
        buttonRef.current.style.pointerEvents = "none";
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.pointerEvents = "auto";
          }
        }, 300);
      }

      if (props.onClick) {
        props.onClick(e);
      }
    },
    [disabled, props.onClick]
  );

  const buttonClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-white text-black",
    secondary: "bg-black text-white",
    outline: "bg-[#F4F4F4] text-black border border-[#E8E8E8]",
    icon: "bg-white text-black rounded-full w-10 h-10 flex items-center justify-center p-0",
    danger: "bg-red-500 text-white",
  };
  if (asChild) {
    return (
      <div
        className={cn(
          "relative font-semibold select-none text-[16px] overflow-hidden px-4 py-2 rounded-full w-full h-[56px] active:scale-95 transition-all duration-300",
          buttonClasses[variant],
          disabled && "opacity-50 cursor-not-allowed active:scale-100",
          className
        )}
        style={{
          touchAction: "manipulation",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {children}
      </div>
    );
  }

  if (link) {
    return (
      <Link href={link} className="w-full">
        <button
          ref={buttonRef}
          className={cn(
            "relative select-none font-semibold text-[16px] overflow-hidden px-4 py-2 rounded-full w-full h-[56px] active:scale-95 transition-all duration-300",
            disabled && "opacity-50 cursor-not-allowed active:scale-100",
            buttonClasses[variant],
            className
          )}
          style={{
            touchAction: "manipulation",
            WebkitTouchCallout: "none",
            WebkitTapHighlightColor: "transparent",
            pointerEvents: disabled ? "none" : "auto",
          }}
          {...props}
          onClick={handleClick}
        >
          {children}
        </button>
      </Link>
    );
  }
  return (
    <button
      ref={buttonRef}
      className={cn(
        "relative select-none text-[16px] font-semibold overflow-hidden px-4 py-2 rounded-full w-full h-[56px] active:scale-95 transition-all duration-300",
        buttonClasses[variant],
        disabled && "opacity-50 cursor-not-allowed active:scale-100",
        className
      )}
      style={{
        touchAction: "manipulation",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
        pointerEvents: disabled ? "none" : "auto",
      }}
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export { Button };
