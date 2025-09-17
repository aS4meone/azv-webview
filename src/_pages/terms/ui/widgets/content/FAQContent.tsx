"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  popular?: boolean;
}

export const FAQContent = () => {
  const t = useTranslations("terms.faqs");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs: FAQItem[] = [
    {
      question: t("questions.1.question"),
      answer: t("questions.1.answer"),
      category: "technicalSupport",
      popular: true,
    },
    {
      question: t("questions.2.question"),
      answer: t("questions.2.answer"),
      category: "documents",
      popular: false,
    },
    {
      question: t("questions.3.question"),
      answer: t("questions.3.answer"),
      category: "technicalSupport",
      popular: true,
    },
    {
      question: t("questions.4.question"),
      answer: t("questions.4.answer"),
      category: "technicalSupport",
      popular: false,
    },
    {
      question: t("questions.5.question"),
      answer: t("questions.5.answer"),
      category: "payment",
      popular: true,
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="min-h-screen">
      <div >
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4 mt-10">
              <h1 className="text-3xl font-bold text-[#191919]">
                {t("title")}
              </h1>
            </div>
            <p className="text-[#666666] text-lg">
              {t("content")}
            </p>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-[#191919] focus:ring-[#191919]/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="text-sm bg-[#191919]/10 text-[#191919] border border-[#191919]/20 hover:bg-[#191919] hover:text-white transition-all duration-200"
              >
                {t(`categories.${category}`)}
              </Badge>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden bg-white border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
                <button
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-[#191919]" />
                        {faq.popular && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-[#191919] text-white"
                          >
                            {t("popular")}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-xs border-[#191919] text-[#191919]"
                        >
                          {t(`categories.${faq.category}`)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-[#191919] text-lg">
                        {faq.question}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-[#666666]" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-0 pb-6">
                        <div className="bg-[#191919]/5 p-4 rounded-lg border border-[#191919]/10">
                          <p className="text-[#191919]/80 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#191919]/10 flex items-center justify-center">
                <HelpCircle className="w-10 h-10 text-[#191919]" />
              </div>
              <h3 className="text-lg font-medium text-[#191919] mb-2">
                {t("noQuestionsFound")}
              </h3>
              <p className="text-[#666666]">
                {t("noQuestionsDescription")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
