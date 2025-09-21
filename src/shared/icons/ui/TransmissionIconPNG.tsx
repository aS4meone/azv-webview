import React from "react";
import Image from "next/image";

interface TransmissionIconPNGProps {
  type: string | null;
  className?: string;
}

export const TransmissionIconPNG: React.FC<TransmissionIconPNGProps> = ({ 
  type, 
  className = "w-4 h-4" 
}) => {
  const getIconSrc = () => {
    switch (type) {
      case "manual":
        return "/icons/manual.png";
      case "automatic":
        return "/icons/automatic.png";
      case "cvt":
        return "/icons/automatic.png"; // Используем automatic для CVT
      case "semi_automatic":
        return "/icons/manual.png"; // Используем manual для semi_automatic
      default:
        return "/icons/automatic.png"; // По умолчанию automatic
    }
  };

  const getAltText = () => {
    switch (type) {
      case "manual":
        return "Механическая коробка передач";
      case "automatic":
        return "Автоматическая коробка передач";
      case "cvt":
        return "Вариатор";
      case "semi_automatic":
        return "Роботизированная коробка передач";
      default:
        return "Автоматическая коробка передач";
    }
  };

  return (
    <Image
      src={getIconSrc()}
      alt={getAltText()}
      width={16}
      height={16}
      className={className}
    />
  );
};