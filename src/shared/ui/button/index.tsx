"use client";

import { cn } from "@/shared/utils/cn";
import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode, useRef } from "react";

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

  const disabled = props.disabled || false;

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
          "relative select-none text-[16px] overflow-hidden px-4 py-2 rounded-full w-full h-[56px] active:scale-95 transition-all duration-300",
          buttonClasses[variant],
          disabled && "opacity-50 cursor-not-allowed active:scale-100",
          className
        )}
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
            "relative select-none text-[18px] overflow-hidden px-4 py-2 rounded-full w-full h-[56px] active:scale-95 transition-all duration-300",
            disabled && "opacity-50 cursor-not-allowed active:scale-100",
            buttonClasses[variant],
            className
          )}
          {...props}
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
        "relative select-none text-[16px] overflow-hidden px-4 py-2 rounded-full w-full h-[56px] active:scale-95 transition-all duration-300",
        buttonClasses[variant],
        disabled && "opacity-50 cursor-not-allowed active:scale-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
