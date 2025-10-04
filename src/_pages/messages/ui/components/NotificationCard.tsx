"use client";

import React from "react";
import { IMessage } from "@/shared/models/types/message";
import { cn } from "@/shared/utils/cn";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { 
  getNotificationColorScheme, 
  getNotificationCategory,
  NotificationStatus 
} from "@/shared/types/notification";

interface NotificationCardProps {
  message: IMessage;
  onMarkAsRead?: (id: number) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ message, onMarkAsRead }) => {
  const t = useTranslations("messages");
  const locale = useLocale();

  // Получаем цветовую схему на основе статуса уведомления
  const colorScheme = message.status 
    ? getNotificationColorScheme(message.status)
    : {
        background: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-800",
        icon: "text-gray-600",
        badge: "bg-gray-100 text-gray-800",
      };

  // Получаем категорию для дополнительной информации
  const category = message.status ? getNotificationCategory(message.status) : null;

  const formatTime = (timeStr: string) => {
    // Добавляем 5 часов к времени сервера для приведения к местному времени
    const serverDate = new Date(timeStr);
    const localDate = new Date(serverDate.getTime() + 5 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = now.getTime() - localDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return t("timeFormatting.justNow");
    if (diffMinutes < 60) return `${diffMinutes} ${t("timeFormatting.minutesAgo")}`;
    if (diffHours < 24) return `${diffHours} ${t("timeFormatting.hoursAgo")}`;
    if (diffDays < 7) return `${diffDays} ${t("timeFormatting.daysAgo")}`;
    
    // For dates older than 7 days, use locale-specific formatting
    if (locale === "ru") {
      return localDate.toLocaleDateString("ru-RU");
    } else if (locale === "kz") {
      return localDate.toLocaleDateString("kz-KZ");
    } else {
      return localDate.toLocaleDateString("en-US");
    }
  };

  const handleMarkAsRead = () => {
    if (!message.isRead && onMarkAsRead) {
      onMarkAsRead(message.id);
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer",
        colorScheme.background,
        colorScheme.border,
        message.isRead ? "opacity-75" : "shadow-sm"
      )}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h3
              className={cn(
                "text-base font-medium truncate",
                colorScheme.text
              )}
            >
              {message.title}
            </h3>
            
            {/* Категория уведомления */}
            {category && (
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", colorScheme.badge)}
                >
                  {t(`categories.${category}`)}
                </Badge>
                {!message.isRead && (
                  <Badge
                    variant="secondary"
                    className="bg-gray-800 text-white text-xs"
                  >
                    {t("new")}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <p
            className={cn(
              "text-sm leading-5 mb-3",
              colorScheme.text,
              message.isRead ? "opacity-70" : "opacity-90"
            )}
          >
            {message.description}
          </p>

          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs text-gray-600",
                message.isRead ? "opacity-50" : "opacity-70"
              )}
            >
              {formatTime(message.time)}
            </span>

            {!message.isRead && (
              <button
                className={cn(
                  "text-xs font-medium transition-colors hover:opacity-80",
                  colorScheme.text
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead();
                }}
              >
                {t("markAsRead")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
