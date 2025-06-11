import React from "react";
import { IIcon } from "../types/IIcon";

const ArrowLeftIcon = ({ className, width, height, color }: IIcon) => {
  return (
    <svg
      width={width || 32}
      height={height || 32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M20 8L12 16L20 24" stroke={color || "#191919"} />
    </svg>
  );
};

export { ArrowLeftIcon };
