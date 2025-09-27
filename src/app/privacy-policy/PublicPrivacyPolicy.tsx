"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Shield, Lock, Eye, UserCheck, Database, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PolicySection {
  title: string;
  items: string[];
  icon: React.ReactNode;
  color: string;
}

interface PublicPrivacyPolicyProps {
  locale: "ru" | "en" | "kz";
}

export default function PublicPrivacyPolicy({ locale }: PublicPrivacyPolicyProps) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Вернуться на главную</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#1D77FF] flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#191919] mb-2">
                  {t("mainTitle")}
                </h1>
                <p className="text-[#666666] max-w-2xl mx-auto sm:mx-0 text-sm sm:text-base lg:text-lg">
                  {t("description")}
                </p>
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-[#1D77FF]/10 border border-[#1D77FF]/20">
                    <div className="text-[#1D77FF]">{section.icon}</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#191919] leading-tight">{section.title}</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#1D77FF] mt-1.5 sm:mt-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-[#666666] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Rights Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border-2 border-[#191919]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#191919] flex items-center justify-center">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-[#191919]">{t("rights.title")}</h2>
                <p className="text-[#191919]/70 mt-1 text-sm sm:text-base">
                  {t("rights.description")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#191919] text-base sm:text-lg">{t("rights.access.title")}</h4>
                <p className="text-xs sm:text-sm text-[#191919]/70 leading-relaxed">
                  {t("rights.access.description")}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[#191919] text-base sm:text-lg">{t("rights.correction.title")}</h4>
                <p className="text-xs sm:text-sm text-[#191919]/70 leading-relaxed">
                  {t("rights.correction.description")}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[#191919] text-base sm:text-lg">{t("rights.deletion.title")}</h4>
                <p className="text-xs sm:text-sm text-[#191919]/70 leading-relaxed">
                  {t("rights.deletion.description")}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[#191919] text-base sm:text-lg">{t("rights.support.title")}</h4>
                <p className="text-xs sm:text-sm text-[#191919]/70 flex items-start gap-2 leading-relaxed">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-[#191919] mt-0.5 flex-shrink-0" />
                  {t("rights.support.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-full text-xs sm:text-sm text-[#191919]">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
            </div>
            <div className="text-xs sm:text-sm text-[#666666] space-y-2">
              <p>© 2024 AZV Motors. Все права защищены.</p>
              <p className="leading-relaxed">
                Если у вас есть вопросы по данной политике, свяжитесь с нами через приложение или по телефону.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
