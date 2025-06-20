"use client";

import { cn } from "@/shared/utils/cn";
import { ButtonHTMLAttributes, ReactNode, useRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "icon" | "danger";
}

const Button = ({
  children,
  variant = "primary",

  className,

  ...props
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const disabled = props.disabled || false;

  const buttonClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-white text-black",
    secondary: "bg-black text-white",
    outline: "bg-[#F4F4F4] text-black border border-[#E8E8E8]",
    icon: "bg-white text-black rounded-full w-10 h-10 flex items-center justify-center p-0",
    danger: "bg-red-500 text-white",
  };

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
    >
      {children}
    </button>
  );
};

export { Button };
