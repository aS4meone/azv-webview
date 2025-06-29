"use client";

import { useState } from "react";
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs: FAQItem[] = [
    {
      question: "Закончился бензин?",
      answer:
        "Если в дороге у вас неожиданно закончился бензин, пожалуйста, свяжитесь с нашей службой поддержки. Мы оперативно направим к вам ближайшую мобильную команду с необходимым топливом, чтобы вы могли продолжить поездку как можно скорее.",
      category: "Техническая поддержка",
      popular: true,
    },
    {
      question: "Почему не одобрили доступ в аккаунт?",
      answer:
        "К сожалению, на данный момент доступ к аккаунту не был одобрен. Это может быть связано с несоответствием одного или нескольких критериев безопасности или проверки данных. Мы понимаем, что это может вызывать неудобства, и всегда готовы рассмотреть ваш запрос повторно. Пожалуйста, проверьте, чтобы все документы были загружены корректно и соответствовали требованиям, и при необходимости свяжитесь с нашей службой поддержки — мы с удовольствием подскажем, что можно сделать для повторного рассмотрения заявки.",
      category: "Документы",
    },
    {
      question: "Не удаётся открыть или закрыть автомобиль?",
      answer:
        "Пожалуйста, сначала убедитесь, что на вашем устройстве есть стабильное подключение к интернету, и попробуйте выполнить действие ещё раз. Если проблема сохраняется — свяжитесь с нашей службой поддержки. Мы оперативно проверим ситуацию и поможем вам как можно быстрее.",
      category: "Техническая поддержка",
      popular: true,
    },
    {
      question: "Не получается завершить аренду?",
      answer:
        "Пожалуйста, убедитесь, что: автомобиль полностью закрыт, все окна и двери плотно закрыты, включен режим-парковки, у вас есть стабильное интернет-соединение. Если все условия выполнены, но аренду завершить не удаётся — не беспокойтесь. Свяжитесь с нашей службой поддержки, и мы поможем оперативно решить ситуацию.",
      category: "Техническая поддержка",
    },
    {
      question: "Списались лишние деньги, что делать?",
      answer:
        "Понимаем ваше беспокойство по поводу списания дополнительных средств. Чтобы разобраться в ситуации, рекомендуем выполнить следующие шаги: 1. Проверьте выбранный тариф: Убедитесь, что списанная сумма соответствует условиям тарифа, который вы использовали. 2. Оцените время и пробег поездки: Сравните фактическое время аренды и пройденное расстояние с расчетами в приложении. 3. Проверьте наличие штрафов или дополнительных услуг: Возможны дополнительные списания за нарушения правил использования или за предоставленные дополнительные услуги. Если после этих проверок у вас остаются вопросы или вы считаете, что списание было необоснованным, рекомендуем обратиться в нашу службу поддержки.",
      category: "Оплата",
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
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-black">
          Часто задаваемые вопросы
        </h1>
        <p className="text-black/60">
          Найдите ответы на популярные вопросы о нашем сервисе
        </p>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
          <Input
            placeholder="Поиск по вопросам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="text-sm bg-[#1D77FF]/10 text-[#1D77FF]"
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <Card key={index} className="overflow-hidden">
            <button
              className="w-full p-6 text-left hover:bg-[#1D77FF]/5 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-4 h-4 text-[#1D77FF]" />
                    {faq.popular && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-[#1D77FF] text-white"
                      >
                        Популярный
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs border-[#1D77FF] text-[#1D77FF]"
                    >
                      {faq.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-black text-lg">
                    {faq.question}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-black/50" />
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
                    <div className="bg-[#1D77FF]/5 p-4 rounded-lg">
                      <p className="text-black/80 leading-relaxed">
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
          <HelpCircle className="w-12 h-12 text-black/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">
            Вопросы не найдены
          </h3>
          <p className="text-black/60">
            Попробуйте изменить поисковый запрос или обратитесь в поддержку
          </p>
        </div>
      )}
    </div>
  );
};
