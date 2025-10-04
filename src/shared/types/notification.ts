// Типы уведомлений из бэкенда
export enum NotificationStatus {
  MECHANIC_ASSIGNED = "mechanic_assigned", // Механик назначен
  CAR_DELIVERED = "car_delivered", // Машина доставлена
  DELIVERY_NEW_ORDER = "delivery_new_order", // Доставка: новый заказ
  DELIVERY_STARTED = "delivery_started", // Доставка начата
  NEW_CAR_FOR_INSPECTION = "new_car_for_inspection", // Новая машина для осмотра
  PAID_WAITING_SOON = "paid_waiting_soon", // Скоро начнётся платное ожидание
  PAID_WAITING_STARTED = "paid_waiting_started", // Началось платное ожидание
  LOW_BALANCE = "low_balance", // Низкий баланс
  BASIC_TARIFF_ENDING_SOON = "basic_tariff_ending_soon", // Скоро закончится базовый тариф
  OUT_OF_TARIFF_CHARGES = "out_of_tariff_charges", // Списания вне тарифа
  DELIVERY_CANCELLED = "delivery_cancelled", // Доставка отменена
  BALANCE_EXHAUSTED = "balance_exhausted", // Баланс исчерпан
  DELIVERY_DELAY_PENALTY = "delivery_delay_penalty", // Штраф за задержку доставки
  APPLICATION_REJECTED_FINANCIER = "application_rejected_financier", // Заявка отклонена финансистом
  APPLICATION_REJECTED_MVD = "application_rejected_mvd", // Заявка отклонена МВД
  APPLICATION_APPROVED_FINANCIER = "application_approved_financier", // Заявка одобрена финансистом
  APPLICATION_APPROVED_MVD = "application_approved_mvd", // Заявка одобрена МВД
}

// Категории уведомлений для группировки по цветам
export enum NotificationCategory {
  SUCCESS = "success", // Успешные операции
  WARNING = "warning", // Предупреждения
  ERROR = "error", // Ошибки и критические уведомления
  INFO = "info", // Информационные уведомления
  DELIVERY = "delivery", // Уведомления о доставке
  APPLICATION = "application", // Уведомления о заявках
}

// Цветовые схемы для каждой категории
export interface NotificationColorScheme {
  background: string;
  border: string;
  text: string;
  icon: string;
  badge: string;
}

// Конфигурация цветов для категорий
export const NOTIFICATION_COLORS: Record<NotificationCategory, NotificationColorScheme> = {
  [NotificationCategory.SUCCESS]: {
    background: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: "text-green-600",
    badge: "bg-green-100 text-green-800",
  },
  [NotificationCategory.WARNING]: {
    background: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-900",
    icon: "text-amber-700",
    badge: "bg-amber-200 text-amber-900",
  },
  [NotificationCategory.ERROR]: {
    background: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: "text-red-600",
    badge: "bg-red-100 text-red-800",
  },
  [NotificationCategory.INFO]: {
    background: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: "text-blue-600",
    badge: "bg-blue-100 text-blue-800",
  },
  [NotificationCategory.DELIVERY]: {
    background: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
    icon: "text-purple-600",
    badge: "bg-purple-100 text-purple-800",
  },
  [NotificationCategory.APPLICATION]: {
    background: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
    icon: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-800",
  },
};

// Маппинг типов уведомлений на категории
export const NOTIFICATION_CATEGORY_MAP: Record<NotificationStatus, NotificationCategory> = {
  // Успешные операции
  [NotificationStatus.MECHANIC_ASSIGNED]: NotificationCategory.SUCCESS,
  [NotificationStatus.CAR_DELIVERED]: NotificationCategory.SUCCESS,
  [NotificationStatus.APPLICATION_APPROVED_FINANCIER]: NotificationCategory.SUCCESS,
  [NotificationStatus.APPLICATION_APPROVED_MVD]: NotificationCategory.SUCCESS,

  // Предупреждения
  [NotificationStatus.LOW_BALANCE]: NotificationCategory.WARNING,
  [NotificationStatus.BASIC_TARIFF_ENDING_SOON]: NotificationCategory.WARNING,
  [NotificationStatus.PAID_WAITING_SOON]: NotificationCategory.WARNING,
  [NotificationStatus.PAID_WAITING_STARTED]: NotificationCategory.WARNING,
  [NotificationStatus.OUT_OF_TARIFF_CHARGES]: NotificationCategory.WARNING,
  [NotificationStatus.DELIVERY_DELAY_PENALTY]: NotificationCategory.WARNING,

  // Ошибки и критические уведомления
  [NotificationStatus.BALANCE_EXHAUSTED]: NotificationCategory.ERROR,
  [NotificationStatus.DELIVERY_CANCELLED]: NotificationCategory.ERROR,
  [NotificationStatus.APPLICATION_REJECTED_FINANCIER]: NotificationCategory.ERROR,
  [NotificationStatus.APPLICATION_REJECTED_MVD]: NotificationCategory.ERROR,

  // Информационные уведомления
  [NotificationStatus.NEW_CAR_FOR_INSPECTION]: NotificationCategory.INFO,

  // Уведомления о доставке
  [NotificationStatus.DELIVERY_NEW_ORDER]: NotificationCategory.DELIVERY,
  [NotificationStatus.DELIVERY_STARTED]: NotificationCategory.DELIVERY,
};

// Функция для получения категории уведомления
export function getNotificationCategory(status: NotificationStatus): NotificationCategory {
  return NOTIFICATION_CATEGORY_MAP[status] || NotificationCategory.INFO;
}

// Функция для получения цветовой схемы уведомления
export function getNotificationColorScheme(status: NotificationStatus): NotificationColorScheme {
  const category = getNotificationCategory(status);
  return NOTIFICATION_COLORS[category];
}

