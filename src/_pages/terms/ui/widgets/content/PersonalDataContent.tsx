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
    <div className="min-h-screen">
      <div >
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-6 mt-10">
              
              <div>
                <h1 className="text-3xl font-bold text-[#191919] mb-2">
                  {t("mainTitle")}
                </h1>
                <p className="text-[#666666] max-w-2xl mx-auto text-lg">
                  {t("description")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <Card key={index} className="h-full bg-white border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-[#191919]/10 border border-[#191919]/20">
                    <div className="text-[#191919]">{section.icon}</div>
                  </div>
                  <CardTitle className="text-lg text-[#191919]">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#191919] mt-2 flex-shrink-0" />
                        <span className="text-sm text-[#666666]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-[#191919] bg-[#191919]/5 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[#191919]">
                <div className="w-10 h-10 rounded-xl bg-[#191919] flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                {t("rights.title")}
              </CardTitle>
              <CardDescription className="text-[#191919]/70">
                {t("rights.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-[#191919]">{t("rights.access.title")}</h4>
                  <p className="text-sm text-[#191919]/70">
                    {t("rights.access.description")}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-[#191919]">{t("rights.correction.title")}</h4>
                  <p className="text-sm text-[#191919]/70">
                    {t("rights.correction.description")}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-[#191919]">{t("rights.deletion.title")}</h4>
                  <p className="text-sm text-[#191919]/70">
                    {t("rights.deletion.description")}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-[#191919]">{t("rights.support.title")}</h4>
                  <p className="text-sm text-[#191919]/70 flex items-center gap-1">
                    <Phone className="w-4 h-4 text-[#191919]" />
                    {t("rights.support.description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="text-sm border-[#191919] text-[#191919]"
            >
              {t("lastUpdated")} {new Date().toLocaleDateString("ru-RU")}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
