import { useState, useMemo, useCallback } from "react";
import { ICar } from "@/shared/models/types/car";
import { RentalType } from "@/shared/models/dto/rent.dto";

interface RentalConfig {
  title: string;
  description: string;
  getDescription?: (car: ICar) => string;
  unit: string;
  maxDuration: number;
  priceKey: keyof ICar;
  getUnitText: (duration: number) => string;
  hasOpeningFee: boolean;
  openingFeeKey?: keyof ICar;
}

// Функция для правильного склонения русских слов
const getRussianPlural = (
  count: number,
  one: string,
  few: string,
  many: string
): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // Исключения для 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return many;
  }

  // Обычные правила
  if (lastDigit === 1) return one;
  if (lastDigit >= 2 && lastDigit <= 4) return few;
  return many;
};

export const RENTAL_CONFIG: Record<RentalType, RentalConfig> = {
  minutes: {
    title: "Поминутная аренда",
    description: "При поминутной аренде взимается доплата за открытие.",
    getDescription: (car: ICar) => {
      const openingFee = car.open_price as number;
      return `При поминутной аренде взимается доплата ${openingFee.toLocaleString()} ₸ за открытие.`;
    },
    unit: "в минуту",
    maxDuration: 120,
    priceKey: "price_per_minute",
    getUnitText: (duration: number) =>
      getRussianPlural(duration, "минута", "минуты", "минут"),
    hasOpeningFee: true,
    openingFeeKey: "open_price",
  },
  hours: {
    title: "Почасовая аренда",
    description: "",
    getDescription: (car: ICar) => {
      const openingFee = car.open_price as number;
      return `Удобный тариф для коротких поездок и дел в городе. За открытие двери автомобиля взимается доплата ${openingFee.toLocaleString()} ₸ за открытие.`;
    },
    unit: "в час",
    maxDuration: 24,
    priceKey: "price_per_hour",
    getUnitText: (duration: number) =>
      getRussianPlural(duration, "час", "часа", "часов"),
    hasOpeningFee: false,
  },
  days: {
    title: "Суточная аренда",
    description: "Выгодный тариф для длительного использования автомобиля.",
    unit: "в день",
    maxDuration: 365,
    priceKey: "price_per_day",
    getUnitText: (duration: number) =>
      getRussianPlural(duration, "день", "дня", "дней"),
    hasOpeningFee: false,
  },
} as const;

export interface RentalData {
  carId: number;
  rentalType: RentalType;
  duration: number;
}

export const usePricingCalculator = (car: ICar) => {
  const [activeTab, setActiveTab] = useState<RentalType>("minutes");
  const [duration, setDuration] = useState(1);

  const currentConfig = RENTAL_CONFIG[activeTab];

  const calculateCost = useCallback(
    (rentalType: RentalType, currentDuration: number = duration) => {
      const config = RENTAL_CONFIG[rentalType];
      const pricePerUnit = car[config.priceKey] as number;

      // Для минут считаем только доплату за открытие, время считается отдельно
      if (rentalType === "minutes") {
        const openingFee =
          config.hasOpeningFee && config.openingFeeKey
            ? (car[config.openingFeeKey] as number)
            : 0;
        return {
          baseCost: 0, // Время еще не идет
          totalCost: openingFee, // Только доплата за открытие
        };
      }

      // Для часов и дней обычный расчет
      const baseCost = pricePerUnit * currentDuration;
      const openingFee =
        config.hasOpeningFee && config.openingFeeKey
          ? (car[config.openingFeeKey] as number)
          : 0;

      return {
        baseCost,
        totalCost: baseCost + openingFee,
      };
    },
    [car, duration]
  );

  // Расчет стоимости для текущего активного таба
  const { totalCost, baseCost } = useMemo(() => {
    return calculateCost(activeTab, duration);
  }, [activeTab, duration, calculateCost]);

  const handleTabChange = useCallback((newTab: RentalType) => {
    setActiveTab(newTab);
    setDuration(1);
  }, []);

  const incrementDuration = useCallback(() => {
    if (duration < currentConfig.maxDuration) {
      setDuration((prev) => prev + 1);
    }
  }, [duration, currentConfig.maxDuration]);

  const decrementDuration = useCallback(() => {
    if (duration > 1) {
      setDuration((prev) => prev - 1);
    }
  }, [duration]);

  const setDurationDirect = useCallback(
    (newDuration: number) => {
      const clampedDuration = Math.max(
        1,
        Math.min(currentConfig.maxDuration, newDuration)
      );
      setDuration(clampedDuration);
    },
    [currentConfig.maxDuration]
  );

  const getRentalData = useCallback((): RentalData => {
    return {
      carId: car.id,
      rentalType: activeTab,
      duration,
    };
  }, [car.id, activeTab, duration, totalCost]);

  return {
    activeTab,
    duration,
    currentConfig,
    totalCost,
    baseCost,
    calculateCost,
    handleTabChange,
    incrementDuration,
    decrementDuration,
    setDurationDirect,
    getRentalData,
  };
};
