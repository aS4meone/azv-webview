"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  FileText,
  Users,
  Car,
  Shield,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface Section {
  title: string;
  content: string[];
  icon: React.ReactNode;
  items?: string[];
}

export const UserAgreementContent = () => {
  const sections: Section[] = [
    {
      title: "1. Общие положения",
      content: [
        "Настоящее Пользовательское соглашение (далее — «Соглашение») заключается между AZV Motors (далее — «Компания», «мы») и пользователем (далее — «Пользователь», «вы») наших услуг по аренде автомобилей.",
        "Использование наших услуг означает полное согласие с условиями данного соглашения.",
      ],
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: "2. Описание услуг",
      content: [
        "Мы предоставляем услуги по аренде автомобилей через наши мобильные и веб-приложения.",
        "Наши услуги включают краткосрочную аренду автомобилей поминутно, почасово или посуточно.",
      ],
      icon: <Car className="w-5 h-5" />,
    },
    {
      title: "3. Обязанности пользователя",
      content: ["Пользователь обязуется соблюдать следующие требования:"],
      icon: <Users className="w-5 h-5" />,
      items: [
        "Иметь действующее водительское удостоверение",
        "Соблюдать правила дорожного движения",
        "Поддерживать чистоту и исправное состояние автомобиля",
        "Немедленно сообщать о любых повреждениях или проблемах",
        "Своевременно возвращать автомобиль",
      ],
    },
    {
      title: "4. Стоимость и оплата",
      content: [
        "Стоимость аренды рассчитывается на основе выбранного тарифа (поминутно/почасово/посуточно).",
        "Дополнительные charges могут применяться за несвоевременный возврат, повреждения или нарушения.",
      ],
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      title: "5. Страхование и ответственность",
      content: [
        "Наши автомобили застрахованы в соответствии с местным законодательством.",
        "Пользователи несут ответственность за ущерб, причиненный по неосторожности или в результате нарушения условий.",
      ],
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  const requirements = [
    {
      label: "Возраст",
      value: "от 21 года",
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      label: "Стаж вождения",
      value: "от 2 лет",
      icon: <Car className="w-4 h-4" />,
    },
    {
      label: "Документы",
      value: "Паспорт + ВУ",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Нарушения",
      value: "Отсутствие серьезных",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  const rules = [
    "Использовать автомобиль только в пределах разрешенной территории",
    "Не передавать управление третьим лицам",
    "Не использовать автомобиль в коммерческих целях без согласования",
    "Соблюдать правила парковки и стоянки",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Пользовательское соглашение
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Условия использования сервиса аренды автомобилей AZV Motors
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Действует с {new Date().toLocaleDateString("ru-RU")}
          </Badge>
          <Badge variant="outline">Версия 3.0</Badge>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">{section.icon}</div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
                {section.items && (
                  <ul className="space-y-2 mt-4">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            6. Требования к водителю
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {requirements.map((req, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-blue-100 rounded-full">{req.icon}</div>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{req.label}</h4>
                <p className="text-sm text-gray-600">{req.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            7. Правила использования
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-amber-800">{rule}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Shield className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Принимая условия данного соглашения, вы подтверждаете, что
                ознакомились со всеми пунктами и согласны их соблюдать.
              </p>
              <p className="text-sm text-gray-600">
                При возникновении вопросов обратитесь в службу поддержки.
              </p>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-gray-500">
              © 2024 AZV Motors. Все права защищены.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
