import React from "react";

interface ArrowLocationIconProps {
  color?: string;
  className?: string;
}

const ArrowLocationIcon = ({
  color = "#222222",
  className,
}: ArrowLocationIconProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20.6819 12.0235C21.1681 11.8379 21.657 12.2483 21.589 12.7396L21.5675 12.8394L17.9224 25.3895L17.9218 25.3903C17.741 26.0166 16.8868 26.0283 16.6588 25.4669L16.6221 25.3468L15.4608 20.0017L15.4616 20.0023C15.3238 19.3544 14.8164 18.8552 14.1761 18.7212L14.0466 18.6989L8.62503 17.98C7.93668 17.8887 7.8224 16.9342 8.47236 16.6842L20.6811 12.0229L20.6819 12.0235Z"
        stroke={color}
        fill="none"
      />
    </svg>
  );
};

export { ArrowLocationIcon };
