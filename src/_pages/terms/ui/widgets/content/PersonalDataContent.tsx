"use client";

import type React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, UserCheck, Database, Phone } from "lucide-react";

interface PolicySection {
  title: string;
  items: string[];
  icon: React.ReactNode;
  color: string;
}

export const PersonalDataContent = () => {
  const sections: PolicySection[] = [
    {
      title: "Какие данные мы собираем",
      items: [
        "Имя, фамилия и отчество",
        "Паспортные данные",
        "Водительское удостоверение",
        "Контактный телефон и email",
        "История поездок и платежей",
      ],
      icon: <Database className="w-5 h-5" />,
      color: "blue",
    },
    {
      title: "Как мы используем ваши данные",
      items: [
        "Идентификация пользователя",
        "Оформление договора аренды",
        "Обеспечение безопасности сделок",
        "Улучшение качества сервиса",
        "Информирование о статусе аренды",
      ],
      icon: <UserCheck className="w-5 h-5" />,
      color: "green",
    },
    {
      title: "Защита данных",
      items: [
        "Шифрование при передаче данных",
        "Ограниченный доступ сотрудников",
        "Регулярное обновление систем безопасности",
        "Мониторинг подозрительной активности",
      ],
      icon: <Lock className="w-5 h-5" />,
      color: "red",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Политика конфиденциальности
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Мы ценим ваше доверие и заботимся о защите ваших персональных данных.
          Ниже представлена информация о том, как мы собираем, используем и
          защищаем ваши данные.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className={`p-2 w-fit rounded-lg bg-${section.color}-100`}>
                {section.icon}
              </div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <div
                      className={`w-2 h-2 rounded-full bg-${section.color}-500 mt-2 flex-shrink-0`}
                    />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Eye className="w-5 h-5" />
            Ваши права
          </CardTitle>
          <CardDescription className="text-green-700">
            Мы уважаем ваши права на конфиденциальность
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-900">Право на доступ</h4>
              <p className="text-sm text-green-700">
                Вы можете запросить информацию о том, какие данные мы храним о
                вас
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-900">
                Право на исправление
              </h4>
              <p className="text-sm text-green-700">
                Вы можете попросить исправить неточные или неполные данные
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-900">Право на удаление</h4>
              <p className="text-sm text-green-700">
                Вы можете запросить удаление ваших персональных данных
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-900">
                Обращение в поддержку
              </h4>
              <p className="text-sm text-green-700 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Свяжитесь с нами для реализации ваших прав
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Badge variant="outline" className="text-sm">
          Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
        </Badge>
      </div>
    </div>
  );
};
