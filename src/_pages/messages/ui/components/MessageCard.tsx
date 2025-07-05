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
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (locale === "ru") {
      if (diffMinutes < 1) return "только что";
      if (diffMinutes < 60) return `${diffMinutes} мин назад`;
      if (diffHours < 24) return `${diffHours} ч назад`;
      if (diffDays < 7) return `${diffDays} дн назад`;
      return date.toLocaleDateString("ru-RU");
    } else {
      if (diffMinutes < 1) return "just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US");
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
          : "bg-blue-50 border-blue-200 shadow-sm"
      )}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={cn(
                "text-base font-medium truncate",
                message.isRead ? "text-gray-900" : "text-blue-900"
              )}
            >
              {message.title}
            </h3>
            {!message.isRead && (
              <Badge
                variant="secondary"
                className="bg-blue-500 text-white text-xs"
              >
                {t("new")}
              </Badge>
            )}
          </div>

          <p
            className={cn(
              "text-sm leading-5 mb-3",
              message.isRead ? "text-gray-600" : "text-blue-700"
            )}
          >
            {message.description}
          </p>

          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs",
                message.isRead ? "text-gray-400" : "text-blue-500"
              )}
            >
              {formatTime(message.time)}
            </span>

            {!message.isRead && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
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
