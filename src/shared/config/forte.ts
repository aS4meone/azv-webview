// Ключи для разных режимов
const FORTE_KEYS = {
  // Тестовый ключ из документации Forte Bank (гарантированно работает)
  TEST: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvIeU9CjZ/6cedPKYw3DnUljSdA3Qx75ysisIDTzMxaPNFBN9WuRhPq6TBAoibwclVZuQ5CLWSj4SOY3ifUtzF22DCUUt+XoceVS0dl9HG7HfVOxv+tD/zzP86N+yyjNiJl7sY48TcNzjSoqdQGIL+YAqGJpi3x+5UuXQI1x3XbGTpzhe20BPHMMx4Jpr8T04v0R+KabNTDrPUVBvCEFafXEW5hVoDVb27QfdKyrR2kwfMmaIVl/IcS6GXArWX9EMwmTqMUtNQBeI+VJSokmsZbVAhz5Zypr59vs2GjoPQYa3owJNBKFqV3tGLG5DFNv/Qeb8Kr+f7qWMiAnvGp4jhQIDAQAB",

  // ВАЖНО: Замените на ваш реальный продакшн ключ из личного кабинета Forte Bank
  PRODUCTION:
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvH5smH8pcWLou9w5W4qXns8SHt+8JB8xPCshtuo5HG5poR1EhncWep8P4Q3euPy7ez1bNYVKRTrJsgWFMGI7uyhTggcoG7EpDKydIVYZoYC1qNtPNx4+yFvIFWnkat1iXh5hoOdDQx6ZLD6a3/qq/dxOp5y8mmwjANufT7+MZhNk7bE0m33JVJ2I5aYn/1Tx64VbKKNVT/uvNY8gH/SvGS9ErTzTi8ypTPunKjZMlg2pXEfVgn2+6NYKFIN02uhHoYd5nQUZA/YwF+u36rVjViGE0kVcQWvqd/k4Tm3UQdXiQOahmKUm6X2cNGqkVmJZjt0nJH1qgk1S7xxk9aTv+QIDAQAB",
} as const;

// Конфигурация Forte Bank Payment
export const FORTE_CONFIG = {
  // Автоматический выбор ключа в зависимости от режима
  PUBLIC_KEY:
    process.env.NODE_ENV === "production"
      ? FORTE_KEYS.PRODUCTION
      : FORTE_KEYS.TEST,

  // URL для платежей
  CHECKOUT_URL: "https://securepayments.fortebank.com",

  // Настройки среды
  IS_TEST: process.env.NODE_ENV !== "production", // true для разработки, false для продакшена

  // Настройки для WebView
  FROM_WEBVIEW: true,

  // Валюта по умолчанию
  DEFAULT_CURRENCY: "KZT" as const,

  // Стандартные суммы для пополнения (в минимальных единицах - тенге)
  TOP_UP_AMOUNTS: [
    10000, // 10,000 ₸
    25000, // 25,000 ₸
    50000, // 50,000 ₸
    100000, // 100,000 ₸
    200000, // 200,000 ₸
    500000, // 500,000 ₸
  ],
} as const;

// Типы для TypeScript
export type ForteConfig = typeof FORTE_CONFIG;
export type Currency = typeof FORTE_CONFIG.DEFAULT_CURRENCY;
export type TopUpAmount = (typeof FORTE_CONFIG.TOP_UP_AMOUNTS)[number];

// Утилиты для работы с суммами
export const formatAmount = (
  amount: number,
  currency: Currency = "KZT"
): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Конвертация для Forte Bank
// Forte ожидает сумму в минимальных единицах валюты (тиын для KZT)
// 1 тенге = 100 тиын
export const convertToMinorUnits = (
  amount: number,
  currency: string = "KZT"
): number => {
  if (currency === "KZT") {
    return Math.round(amount * 100); // тенге -> тиын
  }
  return amount;
};

export const generateTrackingId = (prefix: string = "payment"): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
