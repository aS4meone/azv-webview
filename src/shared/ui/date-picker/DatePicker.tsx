"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface DatePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  showClearButton?: boolean;
  onClear?: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  min,
  max,
  showClearButton = false,
  onClear,
}) => {
  const t = useTranslations("profile");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Обновление selectedDate при изменении value
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split("T")[0];
    const syntheticEvent = {
      target: { name, value: formattedDate }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    const syntheticEvent = {
      target: { name, value: "" }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    onClear?.();
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (min && date < new Date(min)) return true;
    if (max && date > new Date(max)) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonthIndex);
    const days = [];

    // Пустые ячейки для начала месяца
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-10" />
      );
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonthIndex, day);
      const isDisabled = isDateDisabled(date);
      const isSelected = isDateSelected(date);
      const isTodayDate = isToday(date);
      const isHovered = hoveredDate && 
        date.getDate() === hoveredDate.getDate() &&
        date.getMonth() === hoveredDate.getMonth() &&
        date.getFullYear() === hoveredDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateSelect(date)}
          onMouseEnter={() => setHoveredDate(date)}
          onMouseLeave={() => setHoveredDate(null)}
          disabled={isDisabled}
          className={`
            h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center
            ${isDisabled 
              ? "text-gray-300 cursor-not-allowed" 
              : isSelected
                ? "bg-[#191919] text-white shadow-lg"
                : isTodayDate
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                  : isHovered
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-[#191919] mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full h-14 px-4 pr-12 text-left bg-white border-2 rounded-xl transition-all duration-200
            ${error 
              ? "border-red-300 focus:border-red-500" 
              : "border-gray-200 hover:border-gray-300 focus:border-[#191919]"
            }
            ${isOpen ? "border-[#191919] shadow-lg" : "shadow-sm"}
          `}
        >
          <span className={selectedDate ? "text-[#191919]" : "text-gray-400"}>
            {selectedDate ? formatDate(selectedDate) : placeholder || "Выберите дату"}
          </span>
        </button>

        {/* Календарная иконка */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Кнопка очистки */}
        {showClearButton && selectedDate && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Выпадающий календарь */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4">
          {/* Заголовок с выпадающими списками */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Выпадающие списки для месяца и года */}
            <div className="flex items-center gap-2">
              <select
                value={currentMonthIndex}
                onChange={(e) => setCurrentMonth(new Date(currentYear, parseInt(e.target.value)))}
                className="px-3 py-2 text-sm font-semibold text-[#191919] bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:border-[#191919] focus:outline-none transition-colors duration-200"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              
              <select
                value={currentYear}
                onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonthIndex))}
                className="px-3 py-2 text-sm font-semibold text-[#191919] bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:border-[#191919] focus:outline-none transition-colors duration-200"
              >
                {Array.from({ length: 120 }, (_, i) => {
                  const year = today.getFullYear() - 100 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Календарная сетка */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  handleDateSelect(today);
                }}
                className="px-4 py-2 text-sm font-medium text-[#191919] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  setCurrentMonth(new Date(currentYear, currentMonthIndex));
                }}
                className="px-4 py-2 text-sm font-medium text-[#191919] bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
              >
                Текущий год
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#191919] transition-colors duration-200"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
