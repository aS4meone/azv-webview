"use client";
import React, {useEffect, useRef, useState} from "react";
import {Button} from "@/shared/ui";

import {FORTE_CONFIG, formatAmount} from "@/shared/config/forte";

interface AmountInputModalProps {
  onSubmit: (amount: number) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AmountInputModal: React.FC<AmountInputModalProps> = ({
                                                             onSubmit,
                                                             onCancel,
                                                             isLoading,
                                                           }) => {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<
    number | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // Предустановленные суммы для быстрого выбора
  const presetAmounts = FORTE_CONFIG.TOP_UP_AMOUNTS;

  const handleCustomAmountChange = (value: string) => {
    // Разрешаем только цифры
    const numericValue = value.replace(/[^\d]/g, "");
    setCustomAmount(numericValue);
    setSelectedPresetAmount(null);
  };

  const handlePresetAmountSelect = (amount: number) => {
    setSelectedPresetAmount(amount);
    setCustomAmount("");
  };

  const handleSubmit = () => {
    const amount = selectedPresetAmount || parseInt(customAmount, 10);
    if (amount && amount >= 1000) {
      // Минимум 1000 тенге
      onSubmit(amount);
    }
  };

  const getCurrentAmount = (): number => {
    return selectedPresetAmount || parseInt(customAmount, 10) || 0;
  };

  const isValidAmount = (): boolean => {
    const amount = getCurrentAmount();
    return amount >= 1000 && amount <= 1000000; // От 1,000 до 1,000,000 тенге
  };

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onFocus = () => {
      setTimeout(() => {
        el.scrollIntoView({block: "center", behavior: "smooth"});
      }, 150);
    };
    el.addEventListener("focus", onFocus);
    return () => el.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="rounded-2xl rounded-b-none overflow-hidden">
      <div
        className="
          bg-white rounded-2xl overflow-hidden
          max-h-[100svh] flex flex-col
        "
      >
        <div className="bg-white p-6 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-2xl">💳</div>
            <h2 className="text-xl font-bold text-gray-900">
              Пополнение баланса
            </h2>
          </div>

          {/* Предустановленные суммы */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Быстрый выбор:</p>
            <div className="grid grid-cols-2 gap-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePresetAmountSelect(amount)}
                  disabled={isLoading}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                  ${
                    selectedPresetAmount === amount
                      ? "border-gray-800 bg-gray-50 text-gray-900"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {formatAmount(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Кастомная сумма */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Или введите свою сумму:</p>
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="Введите сумму"
                className={`w-full text-base bg-gray-50 text-gray-900 outline-none border-2 
                     focus:bg-white placeholder:text-gray-400 p-4 rounded-2xl pr-12
                     transition-all duration-300 shadow-inner focus:shadow-lg
                     ${
                  customAmount && !isValidAmount()
                    ? "border-red-300 focus:border-red-500"
                    : "border-transparent focus:border-gray-800"
                }`}
                disabled={isLoading}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              ₸
            </span>
            </div>
            {customAmount && !isValidAmount() && (
              <p className="text-red-500 text-xs mt-2">
                Сумма должна быть от 1,000 до 1,000,000 тенге
              </p>
            )}
          </div>

          {/* Информация о выбранной сумме */}
          {getCurrentAmount() > 0 && isValidAmount() && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">К пополнению:</span>
                <span className="font-bold text-lg text-gray-900">
                {formatAmount(getCurrentAmount())}
              </span>
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div
            className="
            sticky bottom-0 left-0 right-0 bg-white
            px-6 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3
            border-t border-gray-100
          "
          >
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                variant="secondary"
                onClick={handleSubmit}
                disabled={!isValidAmount() || isLoading}
                className="flex-1"
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading && (
                    <div
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isLoading ? "Загрузка..." : "Продолжить"}</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmountInputModal;
