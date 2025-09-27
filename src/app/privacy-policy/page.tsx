import { Metadata } from "next";
import { Shield, Lock, Eye, UserCheck, Database, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности - AZV Motors",
  description: "Политика конфиденциальности и обработки персональных данных AZV Motors. Узнайте, как мы собираем, используем и защищаем вашу информацию.",
  robots: "index, follow",
  openGraph: {
    title: "Политика конфиденциальности - AZV Motors",
    description: "Политика конфиденциальности и обработки персональных данных AZV Motors",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary",
    title: "Политика конфиденциальности - AZV Motors",
    description: "Политика конфиденциальности и обработки персональных данных AZV Motors",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Static content without any dependencies
const content = {
  mainTitle: "Политика конфиденциальности",
  description: "Мы ценим ваше доверие и заботимся о защите ваших персональных данных. Ниже представлена информация о том, как мы собираем, используем и защищаем ваши данные.",
  sections: [
    {
      title: "Какие данные мы собираем",
      items: [
        "Имя, фамилия и отчество",
        "Паспортные данные",
        "Водительское удостоверение",
        "Контактный телефон и email",
        "История поездок и платежей"
      ],
    },
    {
      title: "Как мы используем ваши данные",
      items: [
        "Идентификация пользователя",
        "Оформление договора аренды",
        "Обеспечение безопасности сделок",
        "Улучшение качества сервиса",
        "Информирование о статусе аренды"
      ],
    },
    {
      title: "Защита данных",
      items: [
        "Шифрование при передаче данных",
        "Ограниченный доступ сотрудников",
        "Регулярное обновление систем безопасности",
        "Мониторинг подозрительной активности"
      ],
    },
  ],
  rights: {
    title: "Ваши права",
    description: "Мы уважаем ваши права на конфиденциальность",
    access: {
      title: "Право на доступ",
      description: "Вы можете запросить информацию о том, какие данные мы храним о вас"
    },
    correction: {
      title: "Право на исправление",
      description: "Вы можете попросить исправить неточные или неполные данные"
    },
    deletion: {
      title: "Право на удаление",
      description: "Вы можете запросить удаление ваших персональных данных"
    },
    support: {
      title: "Обращение в поддержку",
      description: "Свяжитесь с нами для реализации ваших прав"
    }
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 sm:!py-9">
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
                  {content.mainTitle}
                </h1>
                <p className="text-[#666666] max-w-2xl mx-auto sm:mx-0 text-sm sm:text-base lg:text-lg">
                  {content.description}
                </p>
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {content.sections.map((section, index) => (
              <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-[#1D77FF]/10 border border-[#1D77FF]/20">
                    {index === 0 && <Database className="w-5 h-5 text-[#1D77FF]" />}
                    {index === 1 && <UserCheck className="w-5 h-5 text-[#1D77FF]" />}
                    {index === 2 && <Lock className="w-5 h-5 text-[#1D77FF]" />}
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
                <h2 className="text-xl sm:text-2xl font-bold text-[#191919]">{content.rights.title}</h2>
                <p className="text-[#191919]/70 mt-1 text-sm sm:text-base">
                  {content.rights.description}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#191919] text-base sm:text-lg">{content.rights.access.title}</h4>
                <p className="text-xs sm:text-sm text-[#191919]/70 leading-relaxed">
                  {content.rights.access.description}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[#191919] text-base sm:text-lg">{content.rights.correction.title}</h4>
                <p className="text-xs sm:text-sm text-[#191919]/70 leading-relaxed">
                  {content.rights.correction.description}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[#191919] text-base sm:text-lg">{content.rights.deletion.title}</h4>
                <p className="text-xs sm:text-sm text-[#191919]/70 leading-relaxed">
                  {content.rights.deletion.description}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[#191919] text-base sm:text-lg">{content.rights.support.title}</h4>
                <p className="text-xs sm:text-sm text-[#191919]/70 flex items-start gap-2 leading-relaxed">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-[#191919] mt-0.5 flex-shrink-0" />
                  {content.rights.support.description}
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