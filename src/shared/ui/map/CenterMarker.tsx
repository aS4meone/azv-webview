import React, { useMemo } from "react";

export interface CenterMarkerProps {
  className?: string;
  size?: "small" | "medium" | "large";
  color?: string;
  showShadow?: boolean;
}

export const CenterMarker = ({
  className = "",
  size = "medium",
  color = "#ef4444", // red-500
  showShadow = true,
}: CenterMarkerProps) => {
  const sizeClasses = useMemo(() => {
    switch (size) {
      case "small":
        return { main: "w-6 h-6", inner: "w-2 h-2", pulse: "w-6 h-6" };
      case "large":
        return { main: "w-10 h-10", inner: "w-4 h-4", pulse: "w-10 h-10" };
      default:
        return { main: "w-8 h-8", inner: "w-3 h-3", pulse: "w-8 h-8" };
    }
  }, [size]);

  return (
    <div
      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ${className}`}
    >
      <div className="relative">
        {/* Пульсирующий круг */}
        <div
          className={`absolute inset-0 ${sizeClasses.pulse} rounded-full opacity-25 animate-ping`}
          style={{ backgroundColor: color }}
        />

        {/* Основной маркер */}
        <div
          className={`relative ${sizeClasses.main} rounded-full border-4 border-white shadow-lg flex items-center justify-center`}
          style={{ backgroundColor: color }}
        >
          <div className={`${sizeClasses.inner} bg-white rounded-full`} />
        </div>

        {/* Тень */}
        {showShadow && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black opacity-20 rounded-full blur-sm" />
        )}
      </div>
    </div>
  );
};
