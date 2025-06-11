import React from "react";
import { IIcon } from "../types/IIcon";

export const BadIcon = ({ className, width, height, color }: IIcon) => {
  const fill = color || "#E34545";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || "24"}
      height={height || "24"}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill={fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5452 5.96629L13.091 15.1873C13.0608 15.8014 12.6001 16.3065 12.0001 16.3065C11.4001 16.3065 10.9394 15.8021 10.9091 15.1873L10.4549 5.96629C10.3722 4.27724 13.6281 4.27778 13.5452 5.96629Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0001 17.1187C12.6024 17.1187 13.0909 17.6072 13.0909 18.2096C13.0909 18.812 12.6024 19.3005 12.0001 19.3005C11.3977 19.3005 10.9092 18.812 10.9092 18.2096C10.9092 17.6072 11.3977 17.1187 12.0001 17.1187Z"
        fill="white"
      />
    </svg>
  );
};
