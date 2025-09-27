"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IMessage } from "@/shared/models/types/message";
import {
  notificationApi,
  INotification,
} from "@/shared/api/routes/notifications";
import { useUserStore } from "@/shared/stores/userStore";
import NotificationCard from "./components/NotificationCard";

const MessagesPage = () => {
  const t = useTranslations("messages");
  const { updateUnreadMessageCount } = useUserStore();

  // Состояние для сообщений
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Функция для преобразования API уведомлений в IMessage
  const mapNotificationToMessage = (notification: INotification): IMessage => {
    return {
      id: notification.id,
      title: notification.title,
      description: notification.body,
      time: notification.sent_at,
      isRead: notification.is_read,
      status: notification.status,
    };
  };


  // Загрузка уведомлений с API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await notificationApi.getNotifications();

        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.data) {
          const mappedMessages = result.data.notifications.map(
            mapNotificationToMessage
          );
          setMessages(mappedMessages);
          setUnreadCount(result.data.unread_count);
          // Обновляем глобальное состояние пользователя
          updateUnreadMessageCount(result.data.unread_count);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Функция для отметки сообщения как прочитанное
  const handleMarkAsRead = async (messageId: number) => {
    try {
      const result = await notificationApi.markAsRead(messageId);

      if (result.error) {
        console.error("Failed to mark as read:", result.error);
        return;
      }

      // Обновляем локальное состояние
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId ? { ...message, isRead: true } : message
        )
      );

      // Обновляем счетчик непрочитанных
      const newUnreadCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnreadCount);
      // Обновляем глобальное состояние пользователя
      updateUnreadMessageCount(newUnreadCount);
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  // Компонент загрузки
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-8 h-8 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-gray-500">{t("loading")}</p>
    </div>
  );

  // Компонент ошибки
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t("errorTitle")}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">
        {error || t("errorDescription")}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
      >
        {t("retry")}
      </button>
    </div>
  );

  // Компонент пустого состояния
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t("noMessages")}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        {t("noMessagesDescription")}
      </p>
    </div>
  );

  if (loading) {
    return (
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {t("title")}
          </h1>
        </header>
        <LoadingState />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {t("title")}
          </h1>
        </header>
        <ErrorState />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {t("title")}
        </h1>
        {messages.length > 0 && unreadCount > 0 && (
          <p className="text-sm text-gray-500">{unreadCount} {t("newMessagesCount")}</p>
        )}
      </header>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message) => (
            <NotificationCard
              key={message.id}
              message={message}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default MessagesPage;
