"use client";

import type React from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("terms.userAgreement");

  const sections: Section[] = [
    {
      title: t("sections.generalProvisions.title"),
      content: t("sections.generalProvisions.content").split('\n'),
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: t("sections.serviceDescription.title"),
      content: t("sections.serviceDescription.content").split('\n'),
      icon: <Car className="w-5 h-5" />,
    },
    {
      title: t("sections.userObligations.title"),
      content: [t("sections.userObligations.content")],
      icon: <Users className="w-5 h-5" />,
      items: t("sections.userObligations.items").split('\n'),
    },
    {
      title: t("sections.costAndPayment.title"),
      content: t("sections.costAndPayment.content").split('\n'),
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      title: t("sections.insuranceAndLiability.title"),
      content: t("sections.insuranceAndLiability.content").split('\n'),
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  const requirements = [
    {
      label: t("requirements.age.label"),
      value: t("requirements.age.value"),
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      label: t("requirements.experience.label"),
      value: t("requirements.experience.value"),
      icon: <Car className="w-4 h-4" />,
    },
    {
      label: t("requirements.documents.label"),
      value: t("requirements.documents.value"),
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: t("requirements.violations.label"),
      value: t("requirements.violations.value"),
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  const rules = t("rules").split('\n');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("mainTitle")}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("description")}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {t("effectiveFrom")} {new Date().toLocaleDateString("ru-RU")}
          </Badge>
          <Badge variant="outline">{t("version")}</Badge>
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
            {t("requirements.title")}
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
            {t("rules.title")}
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
                {t("footer.agreementText")}
              </p>
              <p className="text-sm text-gray-600">
                {t("footer.supportText")}
              </p>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-gray-500">
              {t("footer.copyright")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
