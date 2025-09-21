import React from "react";

interface TransmissionIconProps {
  type: string | null;
  className?: string;
}

export const TransmissionIcon: React.FC<TransmissionIconProps> = ({ 
  type, 
  className = "w-4 h-4" 
}) => {
  const getIconPath = () => {
    switch (type) {
      case "MANUAL":
        // Иконка для МКПП - стилизованная коробка передач
        return (
          <g>
            <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor"/>
            <rect x="4" y="10" width="16" height="2" rx="1" fill="currentColor"/>
            <rect x="4" y="14" width="16" height="2" rx="1" fill="currentColor"/>
            <circle cx="7" cy="9" r="1" fill="currentColor"/>
            <circle cx="7" cy="13" r="1" fill="currentColor"/>
            <circle cx="17" cy="9" r="1" fill="currentColor"/>
            <circle cx="17" cy="13" r="1" fill="currentColor"/>
          </g>
        );
      case "AUTOMATIC":
        // Иконка для АКПП - буква A
        return (
          <g>
            <path d="M7 8l2 6h2l2-6h-2l-1 3h-2l-1-3h-2zm4 4h-2l1-2.5L11 12z" fill="currentColor"/>
          </g>
        );
      case "CVT":
        // Иконка для CVT - буква C
        return (
          <g>
            <path d="M8 8c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.1 0 2.1-.4 2.8-1.2l-1.4-1.4c-.4.4-1 .6-1.4.6-1.1 0-2-.9-2-2s.9-2 2-2c.4 0 .8.2 1.1.5l1.4-1.4C10.1 8.4 9.1 8 8 8z" fill="currentColor"/>
          </g>
        );
      case "SEMI_AUTOMATIC":
        // Иконка для РКПП - комбинация M и A
        return (
          <g>
            <path d="M6 8h2v6h-2V8zm4 0h2v6h-2V8zm4 0h2v6h-2V8zm-8 8h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="currentColor"/>
          </g>
        );
      default:
        // По умолчанию - буква A (АКПП)
        return (
          <g>
            <path d="M7 8l2 6h2l2-6h-2l-1 3h-2l-1-3h-2zm4 4h-2l1-2.5L11 12z" fill="currentColor"/>
          </g>
        );
    }
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {getIconPath()}
    </svg>
  );
};
