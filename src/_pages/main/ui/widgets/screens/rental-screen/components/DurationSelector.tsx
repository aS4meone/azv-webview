import React from "react";

interface DurationSelectorProps {
  duration: number;
  maxDuration: number;
  getUnitText: (duration: number) => string;
  onIncrement: () => void;
  onDecrement: () => void;
  onDurationChange?: (duration: number) => void;
}

export const DurationSelector = ({
  duration,
  maxDuration,
  getUnitText,
  onIncrement,
  onDecrement,
  onDurationChange,
}: DurationSelectorProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col justify-center items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onDecrement}
            disabled={duration <= 0}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 10H15"
                stroke="#191919"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="text-center min-w-[60px]">
            <input
              type="number"
              placeholder="0"
              inputMode="numeric"
              value={duration === 0 ? "" : duration}
              onChange={(e) => {
                const inputValue = e.target.value;

                // Если поле пустое, устанавливаем 0
                if (inputValue === "") {
                  if (onDurationChange) {
                    onDurationChange(0);
                  }
                  return;
                }

                const value = parseInt(inputValue);
                if (isNaN(value)) return;

                const clampedValue = Math.min(maxDuration, value);

                // Используем прямое изменение если доступно, иначе fallback на кнопки
                if (onDurationChange) {
                  onDurationChange(clampedValue);
                } else if (clampedValue !== duration) {
                  if (clampedValue > duration) {
                    for (let i = duration; i < clampedValue; i++) {
                      onIncrement();
                    }
                  } else {
                    for (let i = duration; i > clampedValue; i--) {
                      onDecrement();
                    }
                  }
                }
              }}
              min={0}
              max={maxDuration}
              className="text-2xl font-bold text-[#191919] bg-white border-1 border-gray-200 text-center w-full outline-none  rounded-full px-2.5 py-2 transition-all duration-200 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
            />
          </div>
          <button
            onClick={onIncrement}
            disabled={duration >= maxDuration}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 5V15M5 10H15"
                stroke="#191919"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="text-sm text-gray-500">{getUnitText(duration)}</div>
      </div>
    </div>
  );
};
