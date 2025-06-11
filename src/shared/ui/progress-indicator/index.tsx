import React from "react";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  activeColor?: string;
  inactiveColor?: string;
}

const ProgressIndicator = ({
  current,
  total,
  activeColor = "white",
  inactiveColor = "#727272",
}: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 w-full my-1">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          style={{
            backgroundColor: index === current ? activeColor : inactiveColor,
          }}
          className="w-full h-[1px] transition-all duration-300"
        />
      ))}
    </div>
  );
};

export { ProgressIndicator };
