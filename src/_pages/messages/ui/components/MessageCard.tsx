"use client";

import React from "react";
import { IMessage } from "@/shared/models/types/message";
import { cn } from "@/shared/utils/cn";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "next-intl";

interface MessageCardProps {
  message: IMessage;
  onMarkAsRead?: (id: number) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onMarkAsRead }) => {
  const t = useTranslations("messages");
  const locale = useLocale();

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
        message.isRead
          ? "bg-white border-gray-200"
          : "bg-gray-100 border-gray-300 shadow-sm"
      )}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={cn(
                "text-base font-medium truncate",
                message.isRead ? "text-gray-900" : "text-gray-800"
              )}
            >
              {message.title}
            </h3>
            {!message.isRead && (
              <Badge
                variant="secondary"
                className="bg-gray-800 text-white text-xs"
              >
                {t("new")}
              </Badge>
            )}
          </div>

          <p
            className={cn(
              "text-sm leading-5 mb-3",
              message.isRead ? "text-gray-600" : "text-gray-700"
            )}
          >
            {message.description}
          </p>

          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs",
                message.isRead ? "text-gray-400" : "text-gray-600"
              )}
            >
              {formatTime(message.time)}
            </span>

            {!message.isRead && (
              <button
                className="text-xs text-gray-700 hover:text-gray-900 font-medium transition-colors"
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

export default MessageCard;
