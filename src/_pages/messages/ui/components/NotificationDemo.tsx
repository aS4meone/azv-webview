"use client";

import React from "react";
import { IMessage } from "@/shared/models/types/message";
import { NotificationStatus } from "@/shared/types/notification";
import NotificationCard from "./NotificationCard";

// Демонстрационные данные для тестирования
const demoMessages: IMessage[] = [
  {
    id: 1,
    title: "Механик назначен",
    description: "К вашему автомобилю назначен механик для проведения технического осмотра.",
    time: new Date().toISOString(),
    isRead: false,
    status: NotificationStatus.MECHANIC_ASSIGNED,
  },
  {
    id: 2,
    title: "Низкий баланс",
    description: "Ваш баланс составляет менее 1000 тенге. Пополните счет для продолжения использования сервиса.",
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    status: NotificationStatus.LOW_BALANCE,
  },
  {
    id: 3,
    title: "Машина доставлена",
    description: "Ваш заказанный автомобиль успешно доставлен по указанному адресу.",
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    status: NotificationStatus.CAR_DELIVERED,
  },
  {
    id: 4,
    title: "Баланс исчерпан",
    description: "Ваш баланс полностью исчерпан. Пожалуйста, пополните счет для продолжения аренды.",
    time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    status: NotificationStatus.BALANCE_EXHAUSTED,
  },
  {
    id: 5,
    title: "Новая машина для осмотра",
    description: "В системе появилась новая машина, требующая технического осмотра.",
    time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    status: NotificationStatus.NEW_CAR_FOR_INSPECTION,
  },
  {
    id: 6,
    title: "Доставка: новый заказ",
    description: "Поступил новый заказ на доставку автомобиля. Время доставки: 30 минут.",
    time: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    status: NotificationStatus.DELIVERY_NEW_ORDER,
  },
  {
    id: 7,
    title: "Заявка одобрена финансистом",
    description: "Ваша заявка на финансирование была одобрена. Можете приступать к оформлению документов.",
    time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    status: NotificationStatus.APPLICATION_APPROVED_FINANCIER,
  },
  {
    id: 8,
    title: "Заявка отклонена МВД",
    description: "К сожалению, ваша заявка была отклонена МВД. Обратитесь в службу поддержки для получения подробной информации.",
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    status: NotificationStatus.APPLICATION_REJECTED_MVD,
  },
];

const NotificationDemo: React.FC = () => {
  const handleMarkAsRead = (id: number) => {
    console.log(`Marking notification ${id} as read`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Демонстрация системы уведомлений
      </h2>
      
      <div className="space-y-4">
        {demoMessages.map((message) => (
          <NotificationCard
            key={message.id}
            message={message}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Цветовая схема уведомлений:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Успешные операции</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-600 rounded"></div>
            <span>Предупреждения</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Ошибки</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Информация</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Доставка</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-500 rounded"></div>
            <span>Заявки</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;
