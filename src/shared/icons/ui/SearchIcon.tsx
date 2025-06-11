import React from "react";
import { IIcon } from "../types/IIcon";

const SearchIcon = ({ className }: IIcon) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="11" cy="11" r="6" stroke="#222222" strokeWidth="1.5" />
      <path
        d="M20 20L17 17"
        stroke="#222222"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SearchIcon;
