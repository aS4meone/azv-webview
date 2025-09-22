import React, { InputHTMLAttributes, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showClearButton?: boolean;
  onClear?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  showClearButton = false,
  onClear,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const showClear = showClearButton && value && !props.disabled;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#191919] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full px-4 py-3
            bg-white border-2 rounded-xl
            text-[#191919] text-base
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400
            placeholder:text-gray-400 placeholder:text-base
            transition-all duration-200 ease-in-out
            ${error 
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
              : isFocused
                ? "border-[#191919] focus:border-[#191919] focus:ring-2 focus:ring-gray-100"
                : "border-gray-200 hover:border-gray-300"
            }
            ${showClear ? "pr-12" : props.type === "date" ? "pr-12" : ""}
            ${className}
          `}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        
        {/* Clear button */}
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
