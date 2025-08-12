"use client";
import { convertToMinorUnits } from "@/shared/config/forte";

// Типы для Forte BeGateway
interface FortePaymentResult {
  status: string;
  trackingId: string;
  amount?: number;
  currency?: string;
}

interface ForteErrorResult {
  status: string;
  trackingId: string;
  message?: string;
}

// Расширяем глобальный интерфейс Window для TypeScript
declare global {
  interface Window {
    BeGateway: new (params: Record<string, unknown>) => {
      createWidget: () => void;
    };
  }
}

interface FortePaymentWidgetProps {
  amount: number; // сумма в тенге (минимальные единицы)
  currency?: string;
  description: string;
  trackingId: string;
  publicKey: string;
  isTest?: boolean;
  onSuccess?: (result: FortePaymentResult) => void;
  onError?: (error: ForteErrorResult | string) => void;
  onClose?: (status: string | null) => void;
  fromWebview?: boolean;
  language?: string;
}

// Это не React компонент, а утилитарная функция для создания платежного виджета
export const createFortePayment = ({
  amount,
  currency = "KZT",
  description,
  trackingId,
  publicKey,
  isTest = true,
  onSuccess,
  onError,
  onClose,
  fromWebview = true,
  language = "ru",
}: FortePaymentWidgetProps) => {
  const initiatePayment = () => {
    if (typeof window === "undefined" || !window.BeGateway) {
      console.error("Forte BeGateway is not available");
      onError?.("Forte BeGateway is not available");
      return;
    }

    const params = {
      checkout_url: "https://securepayments.fortebank.com",
      fromWebview: fromWebview,
      payment_method: {
        excluded_types: ["google_pay", "samsung_pay", "apple_pay"],
      },
      checkout: {
        iframe: true,
        test: isTest,
        transaction_type: "payment",
        public_key: publicKey,
        attempts: 1, // Ограничиваем количество попыток
        order: {
          amount: convertToMinorUnits(amount, currency), // Конвертируем тенге в тиын (минимальные единицы)
          currency: currency,
          description: description,
          tracking_id: trackingId,
        },
        settings: {
          language: language, // Язык интерфейса (ru, en, kz)
        },
      },
      closeWidget: function (status: string | null) {
        console.log("Payment widget closed with status:", status);

        // Возможные значения status:
        // successful - операция успешна
        // failed - операция не успешна
        // pending - ожидаем результат/подтверждение операции
        // redirected - пользователь отправлен на внешнюю платежную систему
        // error - ошибка (в параметрах/сети и тд)
        // null - виджет закрыли без запуска оплаты

        switch (status) {
          case "successful":
            onSuccess?.({ status, trackingId });
            break;
          case "failed":
          case "error":
            onError?.({ status, trackingId });
            break;
          default:
            onClose?.(status);
        }
      },
    };

    try {
      new window.BeGateway(params).createWidget();

      // Дополнительная логика для скрытия альтернативных способов оплаты
      setTimeout(() => {
        const hideAlternativePayments = () => {
          const selectors = [
            ".google-pay-button",
            ".samsung-pay-button",
            ".apple-pay-button",
            ".alternative-payment-methods",
            ".alternative-payments",
            ".wallet-payments",
            ".digital-wallets",
            ".card-page__methods",
            ".payment-methods",
            ".payment-methods__item",
            ".google-pay-button__container",
            ".samsung-pay-button__container",
            ".apple-pay-button__container",
            '[data-payment-method="google_pay"]',
            '[data-payment-method="samsung_pay"]',
            '[data-payment-method="apple_pay"]',
            ".payment-method-google",
            ".payment-method-samsung",
            ".payment-method-apple",
            // Более специфичные селекторы для Forte
            '.payment-option[data-method="google_pay"]',
            '.payment-option[data-method="samsung_pay"]',
            '.payment-option[data-method="apple_pay"]',
          ];

          selectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
              (element as HTMLElement).style.display = "none";
            });
          });
        };

        hideAlternativePayments();

        // Повторяем каждые 500ms в течение первых 3 секунд
        const interval = setInterval(hideAlternativePayments, 500);
        setTimeout(() => clearInterval(interval), 3000);
      }, 100);
    } catch (error) {
      console.error("Error creating Forte payment widget:", error);
      onError?.(error);
    }
  };

  return {
    initiatePayment,
  };
};

const FortePaymentWidget = createFortePayment;

export default FortePaymentWidget;
