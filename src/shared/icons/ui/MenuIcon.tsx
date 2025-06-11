import React from "react";
import { IIcon } from "../types/IIcon";

const MenuIcon = ({ className, color }: IIcon) => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.8335 8.16675H22.1668"
        stroke={color || "#222222"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 14H19"
        stroke={color || "#222222"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.8335 19.8333H22.1668"
        stroke={color || "#222222"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export { MenuIcon };
