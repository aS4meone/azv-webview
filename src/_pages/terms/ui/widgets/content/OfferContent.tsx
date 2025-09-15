"use client";

import type React from "react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Users, Car, Shield, Calendar } from "lucide-react";

interface Section {
  title: string;
  content: string[];
  icon: React.ReactNode;
}

export const OfferContent = () => {
  const t = useTranslations("terms.offer");
  
  const sections: Section[] = [
    {
      title: t("sections.generalProvisions.title"),
      content: [
        t("sections.generalProvisions.item1"),
        t("sections.generalProvisions.item2"),
        t("sections.generalProvisions.item3"),
        t("sections.generalProvisions.item4"),
        t("sections.generalProvisions.item5"),
      ],
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: t("sections.contractSubject.title"),
      content: [
        t("sections.contractSubject.item1"),
        t("sections.contractSubject.item2"),
        t("sections.contractSubject.item3"),
        t("sections.contractSubject.item4"),
      ],
      icon: <Car className="w-5 h-5" />,
    },
    {
      title: t("sections.rightsAndObligations.title"),
      content: [
        t("sections.rightsAndObligations.item1"),
        t("sections.rightsAndObligations.item2"),
        t("sections.rightsAndObligations.item3"),
        t("sections.rightsAndObligations.item4"),
        t("sections.rightsAndObligations.item5"),
      ],
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-[#1D77FF]/10 rounded-full">
            <FileText className="w-8 h-8 text-[#1D77FF]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-black">{t("mainTitle")}</h1>
        <p className="text-black/60 max-w-2xl mx-auto">
          {t("description")}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-[#1D77FF]/10 text-[#1D77FF]"
          >
            <Calendar className="w-3 h-3" />
            {t("effectiveFrom")} {new Date().toLocaleDateString("ru-RU")}
          </Badge>
          <Badge variant="outline" className="border-[#1D77FF] text-[#1D77FF]">
            {t("version")}
          </Badge>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-[#1D77FF]/10 rounded-lg text-[#1D77FF]">
                  {section.icon}
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.content.map((paragraph, pIndex) => (
                  <div key={pIndex}>
                    {paragraph.startsWith("-") ? (
                      <div className="flex items-start gap-2 ml-4">
                        <div className="w-1.5 h-1.5 bg-[#1D77FF] rounded-full mt-2 flex-shrink-0" />
                        <p className="text-black/60">
                          {paragraph.substring(2)}
                        </p>
                      </div>
                    ) : (
                      <p
                        className={`${
                          paragraph.match(/^\d+\.\d+\./)
                            ? "font-medium text-black"
                            : "text-black/70"
                        }`}
                      >
                        {paragraph}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Terms */}
      <Card className="border-[#1D77FF] bg-[#1D77FF]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Shield className="w-5 h-5 text-[#1D77FF]" />
            {t("additionalTerms.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-black mb-2">{t("additionalTerms.insurance.title")}</h4>
              <p className="text-sm text-black/80">
                {t("additionalTerms.insurance.description")}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-black mb-2">{t("additionalTerms.techSupport.title")}</h4>
              <p className="text-sm text-black/80">
                {t("additionalTerms.techSupport.description")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-[#1D77FF]/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-black/60">
              {t("footer.downloadText")}
            </p>
            <p className="text-sm text-black/60">
              {t("footer.supportText")}
            </p>
            <Separator className="my-4" />
            <p className="text-xs text-black/50">
              {t("footer.copyright")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
