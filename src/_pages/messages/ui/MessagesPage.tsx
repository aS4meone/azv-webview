"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IMessage } from "@/shared/models/types/message";
import MessageCard from "./components/MessageCard";

const MessagesPage = () => {
  const t = useTranslations("messages");

  // Состояние для сообщений
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Примеры сообщений для демонстрации
  useEffect(() => {
    const mockMessages: IMessage[] = [
      {
        id: 1,
        title: "Успешная бронь автомобиля",
        description:
          "Ваша бронь автомобиля Toyota Camry на 2 часа подтверждена. Автомобиль готов к использованию.",
        time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 минут назад
        isRead: false,
      },
      {
        id: 2,
        title: "Пополнение баланса",
        description:
          "Ваш баланс успешно пополнен на 50,000 ₸. Теперь вы можете бронировать автомобили.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 часа назад
        isRead: false,
      },
      {
        id: 3,
        title: "Завершение поездки",
        description:
          "Поездка на BMW X5 завершена. Общая стоимость: 15,750 ₸. Спасибо за использование нашего сервиса!",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 день назад
        isRead: true,
      },
      {
        id: 4,
        title: "Напоминание о документах",
        description:
          "Пожалуйста, загрузите недостающие документы для верификации аккаунта в разделе 'Профиль'.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 дня назад
        isRead: true,
      },
      {
        id: 5,
        title: "Акция: Бесплатный час аренды",
        description:
          "Специальное предложение! Получите бесплатный час аренды при следующем бронировании. Акция действует до конца месяца.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 дня назад
        isRead: true,
      },
    ];

    setMessages(mockMessages);
  }, []);

  // Функция для отметки сообщения как прочитанное
  const handleMarkAsRead = (messageId: number) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId ? { ...message, isRead: true } : message
      )
    );
  };

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

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {t("title")}
        </h1>
        {messages.length > 0 && (
          <p className="text-sm text-gray-500">
            {messages.filter((m) => !m.isRead).length} новых сообщений
          </p>
        )}
      </header>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message) => (
            <MessageCard
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
