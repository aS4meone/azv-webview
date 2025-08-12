export { default as FortePaymentWidget } from "./FortePaymentWidget";
export { useFortePayment } from "./useFortePayment";

// Типы для Forte BeGateway
export interface FortePaymentResult {
  status: string;
  trackingId: string;
  amount?: number;
  currency?: string;
}

export interface ForteErrorResult {
  status: string;
  trackingId: string;
  message?: string;
}
