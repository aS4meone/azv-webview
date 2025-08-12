# Forte Bank Payment Integration

Интеграция с платежным виджетом Forte Bank для приема платежей в приложении AZV Motors.

## Настройка

### 1. Получение ключей

1. Зарегистрируйтесь в [личном кабинете Forte Bank](https://merchant.fortebank.com/)
2. Получите публичный ключ для вашего магазина
3. Обновите `FORTE_CONFIG.PUBLIC_KEY` в файле `src/shared/config/forte.ts`

### 2. Конфигурация

Основные настройки находятся в файле `src/shared/config/forte.ts`:

```typescript
export const FORTE_CONFIG = {
  PUBLIC_KEY: "ваш_публичный_ключ", // Замените на ваш ключ
  IS_TEST: true, // false для продакшена
  FROM_WEBVIEW: true, // true для работы в WebView
  DEFAULT_CURRENCY: "KZT",
  // ... другие настройки
};
```

## Использование

### Хук useFortePayment

```typescript
import { useFortePayment } from "@/shared/ui/forte-payment";
import { FORTE_CONFIG, generateTrackingId } from "@/shared/config/forte";

const { initiatePayment } = useFortePayment({
  publicKey: FORTE_CONFIG.PUBLIC_KEY,
  isTest: FORTE_CONFIG.IS_TEST,
  fromWebview: FORTE_CONFIG.FROM_WEBVIEW,
});

// Инициация платежа
const handlePayment = () => {
  initiatePayment({
    amount: 100000, // 100,000 тенге в минимальных единицах
    currency: "KZT",
    description: "Описание платежа",
    trackingId: generateTrackingId("payment"),
    onSuccess: (result) => {
      console.log("Платеж успешен:", result);
    },
    onError: (error) => {
      console.error("Ошибка платежа:", error);
    },
    onClose: (status) => {
      console.log("Виджет закрыт со статусом:", status);
    },
  });
};
```

### Статусы платежа

Виджет возвращает следующие статусы в колбэке `closeWidget`:

- `successful` - операция успешна
- `failed` - операция не успешна
- `pending` - ожидаем результат/подтверждение операции
- `redirected` - пользователь отправлен на внешнюю платежную систему
- `error` - ошибка (в параметрах/сети и тд)
- `null` - виджет закрыли без запуска оплаты

## Безопасность

⚠️ **Важно**: При использовании публичного ключа обязательно проверяйте все параметры платежа в автоматических уведомлениях на сервере:

- `amount` (сумма)
- `currency` (валюта платежа)
- `test` (не является ли транзакция тестовой)
- `tracking_id` (идентификатор транзакции)

## Тестирование

В тестовом режиме можно использовать тестовые карты:

- **Успешная оплата**: 4200000000000000
- **Отклоненная оплата**: 4000000000000002
- **CVV**: любой трехзначный код
- **Срок действия**: любая будущая дата

## Поддержка

Документация: https://docs.fortebank.com/
Техподдержка: support@fortebank.com
