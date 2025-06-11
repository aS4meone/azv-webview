import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#191919] mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2
          border-b border-[#191919]
          focus:outline-none focus:ring-0 focus:ring-none
          text-[#191919]
          disabled:bg-gray-100 disabled:cursor-not-allowed
          placeholder:text-gray-600 placeholder:text-[14px]
          ${error ? "border-red-500" : "border-gray-300"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
