import React from "react";
import { IIcon } from "../types/IIcon";

const PlusIcon = ({ color }: IIcon) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 6L12 18"
        stroke={color || "#F7F7F7"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 12L6 12"
        stroke={color || "#F7F7F7"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export { PlusIcon };
