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
      question: "Как начать пользоваться сервисом?",
      answer:
        "Для начала использования сервиса необходимо: 1) Скачать приложение AZV Motors; 2) Зарегистрироваться, указав свои данные; 3) Загрузить фото водительского удостоверения и паспорта; 4) Дождаться проверки документов (обычно занимает не более 30 минут); 5) После одобрения можно выбирать автомобиль и начинать аренду.",
      category: "Начало работы",
      popular: true,
    },
    {
      question: "Какие документы нужны для аренды?",
      answer:
        "Для аренды автомобиля вам понадобятся: 1) Удостоверение личности (паспорт); 2) Водительское удостоверение со стажем от 2 лет; 3) Банковская карта для оплаты. Все документы должны быть действительны на момент аренды.",
      category: "Документы",
      popular: true,
    },
    {
      question: "Как происходит оплата аренды?",
      answer:
        "Оплата происходит автоматически с привязанной банковской карты. При начале аренды замораживается страховой депозит. После завершения аренды с карты списывается фактическая стоимость поездки, а депозит разблокируется. Доступна оплата по минутам, часам или суткам.",
      category: "Оплата",
      popular: true,
    },
    {
      question: "Что делать при ДТП или поломке?",
      answer:
        "В случае ДТП или поломки: 1) Убедитесь в безопасности всех участников; 2) Позвоните в службу поддержки по номеру, указанному в приложении; 3) Следуйте инструкциям оператора; 4) При необходимости вызовите полицию или скорую помощь. Все автомобили застрахованы по КАСКО и ОСАГО.",
      category: "Безопасность",
    },
    {
      question: "Есть ли ограничения по пробегу?",
      answer:
        "При поминутной и почасовой аренде действует лимит 100 км в час. При суточной аренде - 300 км в сутки. За превышение лимита взимается дополнительная плата согласно тарифам. Подробные условия доступны в разделе тарифов.",
      category: "Условия аренды",
    },
    {
      question: "Можно ли завершить аренду за городом?",
      answer:
        "Завершение аренды возможно только в пределах зоны завершения аренды, обозначенной в приложении. За пределами этой зоны завершение аренды недоступно. При необходимости вы можете поставить автомобиль на паузу, тариф при этом будет снижен.",
      category: "Условия аренды",
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
