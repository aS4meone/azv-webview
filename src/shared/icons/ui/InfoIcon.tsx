import React from "react";
import { IIcon } from "../types/IIcon";

const InfoIcon = ({ color = "#494949" }: IIcon) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <circle cx="10" cy="10" r="7.5" stroke={color} />
      <path
        d="M10.4168 6.25016C10.4168 6.48028 10.2303 6.66683 10.0002 6.66683C9.77004 6.66683 9.5835 6.48028 9.5835 6.25016C9.5835 6.02004 9.77004 5.8335 10.0002 5.8335C10.2303 5.8335 10.4168 6.02004 10.4168 6.25016Z"
        fill={color}
        stroke={color}
      />
      <path d="M10 14.1668V8.3335" stroke={color} />
    </svg>
  );
};

export default InfoIcon;
