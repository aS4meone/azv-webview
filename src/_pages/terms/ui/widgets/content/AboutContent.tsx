"use client";

import type React from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("terms.about");
  
  const features: FeatureCard[] = [
    {
      title: t("features.quickRental.title"),
      description: t("features.quickRental.description"),
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: t("features.flexibleRates.title"),
      description: t("features.flexibleRates.description"),
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: t("features.support24_7.title"),
      description: t("features.support24_7.description"),
      icon: <Phone className="w-6 h-6" />,
    },
  ];

  const stats: StatCard[] = [
    {
      value: t("stats.satisfiedClients"),
      label: t("stats.satisfiedClientsLabel"),
      icon: <Users className="w-5 h-5" />,
    },
    {
      value: t("stats.carsInFleet"),
      label: t("stats.carsInFleetLabel"),
      icon: <MapPin className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Badge className="text-sm px-4 py-2 bg-[#1D77FF] text-white">
            {t("badge")}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-black">
          {t("mainTitle")}
        </h1>
        <p className="text-xl text-black/60 max-w-3xl mx-auto leading-relaxed">
          {t("description")}
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
            {t("features.title")}
          </h2>
          <p className="text-black/60">
            {t("features.description")}
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
            <CardTitle className="text-black">{t("mission.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-black text-lg leading-relaxed">
            {t("mission.description")}
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
            <h3 className="font-semibold text-black mb-2">{t("values.security.title")}</h3>
            <p className="text-black/60 text-sm">
              {t("values.security.description")}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="p-3 bg-[#1D77FF]/10 rounded-full w-fit mx-auto mb-4">
              <Users className="w-6 h-6 text-[#1D77FF]" />
            </div>
            <h3 className="font-semibold text-black mb-2">
              {t("values.customerOriented.title")}
            </h3>
            <p className="text-black/60 text-sm">
              {t("values.customerOriented.description")}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="p-3 bg-[#1D77FF]/10 rounded-full w-fit mx-auto mb-4">
              <Award className="w-6 h-6 text-[#1D77FF]" />
            </div>
            <h3 className="font-semibold text-black mb-2">{t("values.quality.title")}</h3>
            <p className="text-black/60 text-sm">
              {t("values.quality.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
