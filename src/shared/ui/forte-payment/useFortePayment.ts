"use client";
import { useCallback } from "react";
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

interface UseFortePaymentProps {
  publicKey: string;
  isTest?: boolean;
  fromWebview?: boolean;
  language?: string;
}

interface PaymentParams {
  amount: number; // сумма в тенге (минимальные единицы)
  currency?: string;
  description: string;
  trackingId: string;
  onSuccess?: (result: FortePaymentResult) => void;
  onError?: (error: ForteErrorResult | string) => void;
  onClose?: (status: string | null) => void;
}

export const useFortePayment = ({
  publicKey,
  isTest = true,
  fromWebview = true,
  language = "ru",
}: UseFortePaymentProps) => {
  const initiatePayment = useCallback(
    ({
      amount,
      currency = "KZT",
      description,
      trackingId,
      onSuccess,
      onError,
      onClose,
    }: PaymentParams) => {
      if (typeof window === "undefined" || !window.BeGateway) {
        console.error("Forte BeGateway is not available");
        onError?.("Forte BeGateway is not available");
        return;
      }

      // Отладочная информация
      const convertedAmount = convertToMinorUnits(amount, currency);
      console.log("Forte Payment Parameters:", {
        originalAmount: amount,
        convertedAmount: convertedAmount,
        currency,
        description,
        trackingId,
        isTest,
        language,
        publicKey: publicKey.substring(0, 50) + "...", // Показываем только начало ключа
      });

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
            amount: convertedAmount, // Конвертируем тенге в тиын (минимальные единицы)
            currency: currency,
            description: description,
            tracking_id: trackingId,
          },
          settings: {
            language: language, // Язык интерфейса (ru, en, kz)
            available_languages: ["ru", "en", "kz"], // Доступные языки
          },
        },
        closeWidget: function (status: string | null) {
          console.log("Payment widget closed with status:", status);

          switch (status) {
            case "successful":
              onSuccess?.({ status, trackingId, amount, currency });
              break;
            case "failed":
            case "error":
              onError?.({ status, trackingId, message: "Payment failed" });
              break;
            case "pending":
              onClose?.(status);
              break;
            case "redirected":
              onClose?.(status);
              break;
            case null:
              onClose?.(status);
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
                (element as HTMLElement).style.visibility = "hidden";
                (element as HTMLElement).style.height = "0";
                (element as HTMLElement).style.overflow = "hidden";
              });
            });
          };

          hideAlternativePayments();

          // Повторяем каждые 500ms в течение первых 5 секунд
          const interval = setInterval(hideAlternativePayments, 500);
          setTimeout(() => clearInterval(interval), 5000);

          // Используем MutationObserver для отслеживания изменений DOM
          const observer = new MutationObserver(() => {
            hideAlternativePayments();
          });

          // Наблюдаем за изменениями во всем документе
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
          });

          // Останавливаем наблюдение через 10 секунд
          setTimeout(() => observer.disconnect(), 10000);
        }, 100);
      } catch (error) {
        console.error("Error creating Forte payment widget:", error);
        onError?.(error);
      }
    },
    [publicKey, isTest, fromWebview, language]
  );

  return {
    initiatePayment,
  };
};
