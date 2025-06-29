"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  DollarSign,
  Shield,
  Phone,
  Target,
  Users,
  Award,
  MapPin,
} from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface StatCard {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export const AboutContent = () => {
  const features: FeatureCard[] = [
    {
      title: "Быстрая аренда",
      description:
        "Оформление аренды занимает всего несколько минут через приложение",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: "Гибкие тарифы",
      description:
        "Выбирайте удобный тариф: поминутный, почасовой или посуточный",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "Поддержка 24/7",
      description: "Наша служба поддержки всегда готова помочь",
      icon: <Phone className="w-6 h-6" />,
    },
  ];

  const stats: StatCard[] = [
    {
      value: "10,000+",
      label: "Довольных клиентов",
      icon: <Users className="w-5 h-5" />,
    },
    {
      value: "500+",
      label: "Автомобилей в парке",
      icon: <MapPin className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Badge className="text-sm px-4 py-2 bg-[#1D77FF] text-white">
            О компании AZV Motors
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-black">
          Современный сервис аренды автомобилей
        </h1>
        <p className="text-xl text-black/60 max-w-3xl mx-auto leading-relaxed">
          AZV Motors - это современный сервис аренды автомобилей, который делает
          процесс аренды максимально простым и удобным. Мы предлагаем широкий
          выбор автомобилей и гибкие условия аренды.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-[#1D77FF]/10 rounded-full text-[#1D77FF]">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-black mb-2">
                {stat.value}
              </div>
              <div className="text-black/60">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-black/60">
            Мы предлагаем лучшие условия аренды и высокое качество сервиса
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="h-full hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="p-3 w-fit rounded-lg bg-[#1D77FF]/10 text-[#1D77FF]">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/60">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission */}
      <Card className="border-[#1D77FF] bg-[#1D77FF]/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#1D77FF]" />
            <CardTitle className="text-black">Наша миссия</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-black text-lg leading-relaxed">
            Сделать аренду автомобилей доступной и удобной для каждого,
            предоставляя качественный сервис и современные технологические
            решения. Мы стремимся к тому, чтобы каждая поездка с нами была
            комфортной, безопасной и доступной по цене.
          </p>
        </CardContent>
      </Card>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="p-3 bg-[#1D77FF]/10 rounded-full w-fit mx-auto mb-4">
              <Shield className="w-6 h-6 text-[#1D77FF]" />
            </div>
            <h3 className="font-semibold text-black mb-2">Безопасность</h3>
            <p className="text-black/60 text-sm">
              Все автомобили проходят регулярное техническое обслуживание
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="p-3 bg-[#1D77FF]/10 rounded-full w-fit mx-auto mb-4">
              <Users className="w-6 h-6 text-[#1D77FF]" />
            </div>
            <h3 className="font-semibold text-black mb-2">
              Клиентоориентированность
            </h3>
            <p className="text-black/60 text-sm">
              Мы всегда готовы помочь и решить любые вопросы
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="p-3 bg-[#1D77FF]/10 rounded-full w-fit mx-auto mb-4">
              <Award className="w-6 h-6 text-[#1D77FF]" />
            </div>
            <h3 className="font-semibold text-black mb-2">Качество</h3>
            <p className="text-black/60 text-sm">
              Высокие стандарты обслуживания и современный автопарк
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
