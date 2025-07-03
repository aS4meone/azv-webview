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
import { CreditCard, Clock, Calendar, Timer, Info, Shield } from "lucide-react";

interface PaymentMethod {
  name: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

interface PriceItem {
  service: string;
  price: string;
  note?: string;
  icon: React.ReactNode;
  recommended?: boolean;
}

export const PaymentContent = () => {
  const paymentMethods: PaymentMethod[] = [
    {
      name: "Банковская карта",
      description: "Visa, Mastercard, МИР",
      icon: <CreditCard className="w-6 h-6" />,
      popular: true,
    },
  ];

  const prices: PriceItem[] = [
    {
      service: "Поминутная аренда",
      price: "от 60 ₸/мин",
      note: "Минимум 15 минут",
      icon: <Timer className="w-5 h-5" />,
    },
    {
      service: "Почасовая аренда",
      price: "от 4000 ₸/час",
      note: "Минимум 1 час",
      icon: <Clock className="w-5 h-5" />,
      recommended: true,
    },
    {
      service: "Суточная аренда",
      price: "от 10000 ₸/сутки",
      note: "Полные сутки",
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-black">Оплата и тарифы</h1>
        <p className="text-black/60">
          Удобные способы оплаты и гибкие тарифы для любых задач
        </p>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#1D77FF]" />
            Способы оплаты
          </CardTitle>
          <CardDescription className="text-black/60">
            Выберите удобный способ оплаты из доступных вариантов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="relative p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
              >
                {method.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-[#1D77FF]">
                    Популярно
                  </Badge>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1D77FF]/10 rounded-lg group-hover:bg-[#1D77FF]/20 transition-colors text-[#1D77FF]">
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">{method.name}</h4>
                    <p className="text-sm text-black/60">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#1D77FF]" />
            Тарифы
          </CardTitle>
          <CardDescription className="text-black/60">
            Выберите подходящий тариф в зависимости от продолжительности поездки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prices.map((item, index) => (
              <div
                key={index}
                className={`relative p-6 border rounded-lg transition-all hover:shadow-lg ${
                  item.recommended
                    ? "border-[#1D77FF] bg-[#1D77FF]/5"
                    : "hover:border-black/30"
                }`}
              >
                {item.recommended && (
                  <Badge className="absolute -top-2 -right-2 bg-[#1D77FF]">
                    Рекомендуем
                  </Badge>
                )}
                <div className="text-center space-y-3">
                  <div className="p-3 bg-white rounded-lg w-fit mx-auto text-[#1D77FF]">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">{item.service}</h4>
                    <p className="text-2xl font-bold text-[#1D77FF] mt-1">
                      {item.price}
                    </p>
                    {item.note && (
                      <p className="text-sm text-black/50 mt-1">{item.note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Info */}
      <Card className="border-[#1D77FF] bg-[#1D77FF]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Info className="w-5 h-5 text-[#1D77FF]" />
            Важная информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#1D77FF] mt-0.5" />
              <div>
                <h4 className="font-medium text-black">
                  Автоматическая оплата
                </h4>
                <p className="text-sm text-black/70">
                  Оплата списывается до началы аренды. Пост оплата только в
                  поминутном тарифе,при условии что баланс приложения позволяет
                  вам начать поминутную поездку
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#1D77FF] mt-0.5" />
              <div>
                <h4 className="font-medium text-black">Депозит</h4>
                <p className="text-sm text-black/70">
                  При бронировании замораживается сумма депозита
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
