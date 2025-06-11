"use client";

import React, { ReactNode, MouseEvent, useRef } from "react";

interface SplashProps {
  children: ReactNode;
  splashColor?: string;
  className?: string;
}

export const Splash = ({
  children,
  splashColor = "rgba(0,0,0,0.2)",
  className = "",
}: SplashProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const ripple = document.createElement("span");
    const rect = container.getBoundingClientRect();

    const size = Math.max(container.clientWidth, container.clientHeight);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.pointerEvents = "none";
    ripple.style.background = splashColor;
    ripple.style.opacity = "0.5";
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.style.transform = "scale(0)";
    ripple.style.animation = "splash-ripple 0.6s linear";

    container.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ display: "inline-block" }}
    >
      {children}
      <style jsx>{`
        @keyframes splash-ripple {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
