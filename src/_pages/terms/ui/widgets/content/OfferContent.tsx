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
    <div className="min-h-screen">
      <div >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-6 mt-10">
              
              <div>
                <h1 className="text-3xl font-bold text-[#191919] mb-2">{t("mainTitle")}</h1>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#191919]/10 text-[#191919] border border-[#191919]/20"
                  >
                    <Calendar className="w-3 h-3" />
                    {t("effectiveFrom")} {new Date().toLocaleDateString("ru-RU")}
                  </Badge>
                  <Badge variant="outline" className="border-[#191919] text-[#191919]">
                    {t("version")}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-[#666666] max-w-2xl mx-auto text-lg">
              {t("description")}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className="bg-white border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[#191919]">
                    <div className="p-2 bg-[#191919]/10 rounded-lg text-[#191919] border border-[#191919]/20">
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
                            <div className="w-1.5 h-1.5 bg-[#191919] rounded-full mt-2 flex-shrink-0" />
                            <p className="text-[#666666]">
                              {paragraph.substring(2)}
                            </p>
                          </div>
                        ) : (
                          <p
                            className={`${
                              paragraph.match(/^\d+\.\d+\./)
                                ? "font-medium text-[#191919]"
                                : "text-[#191919]/70"
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
          <Card className="border-[#191919] bg-[#191919]/5 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[#191919]">
                <div className="w-10 h-10 rounded-xl bg-[#191919] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                {t("additionalTerms.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-[#191919] mb-2">{t("additionalTerms.insurance.title")}</h4>
                  <p className="text-sm text-[#191919]/80">
                    {t("additionalTerms.insurance.description")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[#191919] mb-2">{t("additionalTerms.techSupport.title")}</h4>
                  <p className="text-sm text-[#191919]/80">
                    {t("additionalTerms.techSupport.description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card className="bg-[#191919]/5 border border-[#191919]/10">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-[#666666]">
                  {t("footer.downloadText")}
                </p>
                <p className="text-sm text-[#666666]">
                  {t("footer.supportText")}
                </p>
                <Separator className="my-4" />
                <p className="text-xs text-[#999999]">
                  {t("footer.copyright")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
