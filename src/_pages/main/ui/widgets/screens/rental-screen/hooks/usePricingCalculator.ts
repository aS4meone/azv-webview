import { useState, useMemo, useCallback } from "react";
import { ICar } from "@/shared/models/types/car";
import { RentalType } from "@/shared/models/dto/rent.dto";
import { useTranslations } from "next-intl";

export interface RentalConfig {
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

// Функция для получения конфигурации аренды с переводами
export const getRentalConfig = (t: any): Record<RentalType, RentalConfig> => ({
  minutes: {
    title: t("widgets.screens.rental.minutes"),
    description: t("widgets.screens.rental.minutes"),
    getDescription: (car: ICar) => {
      const openingFee = car.open_price as number;
      return `${t("widgets.screens.rental.minutes")} ${openingFee.toLocaleString()} ₸ ${t("widgets.screens.rental.minutes")}`;
    },
    unit: t("widgets.screens.rental.minutes"),
    maxDuration: 120,
    priceKey: "price_per_minute",
    getUnitText: (duration: number) =>
      getRussianPlural(duration, "минута", "минуты", "минут"),
    hasOpeningFee: true,
    openingFeeKey: "open_price",
  },
  hours: {
    title: t("widgets.screens.rental.hours"),
    description: "",
    getDescription: (car: ICar) => {
      const openingFee = car.open_price as number;
      return `${t("widgets.screens.rental.hours")} ${openingFee.toLocaleString()} ₸ ${t("widgets.screens.rental.hours")}`;
    },
    unit: t("widgets.screens.rental.hours"),
    maxDuration: 24,
    priceKey: "price_per_hour",
    getUnitText: (duration: number) =>
      getRussianPlural(duration, "час", "часа", "часов"),
    hasOpeningFee: false,
  },
  days: {
    title: t("widgets.screens.rental.days"),
    description: t("widgets.screens.rental.days"),
    unit: t("widgets.screens.rental.days"),
    maxDuration: 365,
    priceKey: "price_per_day",
    getUnitText: (duration: number) =>
      getRussianPlural(duration, "день", "дня", "дней"),
    hasOpeningFee: false,
  },
});

// Функция для расчета скидки для дневного тарифа
const calculateDaysDiscount = (
  duration: number
): {
  discountPercent: number;
  discountAmount: number;
  baseCost: number;
  finalCost: number;
} => {
  let discountPercent = 0;

  if (duration >= 30) {
    discountPercent = 15;
  } else if (duration >= 7) {
    discountPercent = 10;
  } else if (duration >= 3) {
    discountPercent = 5;
  }

  return {
    discountPercent,
    discountAmount: 0, // будет рассчитан позже
    baseCost: 0, // будет рассчитан позже
    finalCost: 0, // будет рассчитан позже
  };
};


export interface RentalData {
  carId: number;
  rentalType: RentalType;
  duration: number;
}

export interface CostCalculation {
  baseCost: number;
  totalCost: number;
  discountPercent?: number;
  discountAmount?: number;
  originalCost?: number;
}

export const usePricingCalculator = (car: ICar) => {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<RentalType>("minutes");
  const [duration, setDuration] = useState(1);

  const rentalConfig = useMemo(() => getRentalConfig(t), [t]);
  const currentConfig = rentalConfig[activeTab];

  const calculateCost = useCallback(
    (
      rentalType: RentalType,
      currentDuration: number = duration
    ): CostCalculation => {
      const config = rentalConfig[rentalType];
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

      // Для часов обычный расчет
      if (rentalType === "hours") {
        const baseCost = pricePerUnit * currentDuration;
        const openingFee =
          config.hasOpeningFee && config.openingFeeKey
            ? (car[config.openingFeeKey] as number)
            : 0;

        return {
          baseCost,
          totalCost: baseCost + openingFee,
        };
      }

      // Для дней расчет со скидками
      if (rentalType === "days") {
        const originalCost = pricePerUnit * currentDuration;
        const discountInfo = calculateDaysDiscount(currentDuration);

        const discountAmount =
          (originalCost * discountInfo.discountPercent) / 100;
        const finalCost = originalCost - discountAmount;

        return {
          baseCost: originalCost,
          totalCost: finalCost,
          discountPercent: discountInfo.discountPercent,
          discountAmount: discountAmount,
          originalCost: originalCost,
        };
      }

      // Fallback
      const baseCost = pricePerUnit * currentDuration;
      return {
        baseCost,
        totalCost: baseCost,
      };
    },
    [car, duration, rentalConfig]
  );

  // Расчет стоимости для текущего активного таба
  const costCalculation = useMemo(() => {
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
    if (duration > 0) {
      setDuration((prev) => prev - 1);
    }
  }, [duration]);

  const setDurationDirect = useCallback(
    (newDuration: number) => {
      const clampedDuration = Math.min(currentConfig.maxDuration, newDuration);
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
  }, [car.id, activeTab, duration]);

  return {
    activeTab,
    duration,
    currentConfig,
    totalCost: costCalculation.totalCost,
    baseCost: costCalculation.baseCost,
    costCalculation,
    calculateCost,
    rentalConfig,
    handleTabChange,
    incrementDuration,
    decrementDuration,
    setDurationDirect,
    getRentalData,
  };
};
