"use client";

import type React from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("terms.personal");

  const sections: PolicySection[] = [
    {
      title: t("sections.dataCollection.title"),
      items: [
        t("sections.dataCollection.item1"),
        t("sections.dataCollection.item2"),
        t("sections.dataCollection.item3"),
        t("sections.dataCollection.item4"),
        t("sections.dataCollection.item5"),
      ],
      icon: <Database className="w-5 h-5" />,
      color: "[#1D77FF]",
    },
    {
      title: t("sections.dataUsage.title"),
      items: [
        t("sections.dataUsage.item1"),
        t("sections.dataUsage.item2"),
        t("sections.dataUsage.item3"),
        t("sections.dataUsage.item4"),
        t("sections.dataUsage.item5"),
      ],
      icon: <UserCheck className="w-5 h-5" />,
      color: "[#1D77FF]",
    },
    {
      title: t("sections.dataProtection.title"),
      items: [
        t("sections.dataProtection.item1"),
        t("sections.dataProtection.item2"),
        t("sections.dataProtection.item3"),
        t("sections.dataProtection.item4"),
      ],
      icon: <Lock className="w-5 h-5" />,
      color: "[#1D77FF]",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-[#1D77FF]/10 rounded-full">
            <Shield className="w-8 h-8 text-[#1D77FF]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-black">
          {t("mainTitle")}
        </h1>
        <p className="text-black/60 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-[#1D77FF]/10">
                <div className="text-[#1D77FF]">{section.icon}</div>
              </div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1D77FF] mt-2 flex-shrink-0" />
                    <span className="text-sm text-black/60">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#1D77FF] bg-[#1D77FF]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Eye className="w-5 h-5 text-[#1D77FF]" />
            {t("rights.title")}
          </CardTitle>
          <CardDescription className="text-black/70">
            {t("rights.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-black">{t("rights.access.title")}</h4>
              <p className="text-sm text-black/70">
                {t("rights.access.description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-black">{t("rights.correction.title")}</h4>
              <p className="text-sm text-black/70">
                {t("rights.correction.description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-black">{t("rights.deletion.title")}</h4>
              <p className="text-sm text-black/70">
                {t("rights.deletion.description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-black">{t("rights.support.title")}</h4>
              <p className="text-sm text-black/70 flex items-center gap-1">
                <Phone className="w-4 h-4 text-[#1D77FF]" />
                {t("rights.support.description")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Badge
          variant="outline"
          className="text-sm border-[#1D77FF] text-[#1D77FF]"
        >
          {t("lastUpdated")} {new Date().toLocaleDateString("ru-RU")}
        </Badge>
      </div>
    </div>
  );
};
