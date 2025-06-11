// Loader.tsx or Loader.jsx
import React from "react";

const Loader = ({ color = "#007AFF" }: { color?: string }) => {
  return (
    <div className="flex justify-center items-center h-8">
      <div
        className="w-6 h-6 border-2  border-t-transparent rounded-full animate-spin"
        style={{ borderColor: color, borderTopColor: "transparent" }}
      ></div>
    </div>
  );
};

export default Loader;
