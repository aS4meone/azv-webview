import TermsViewCard from "../widgets/TermsViewCard";
import { useTranslations } from "next-intl";
import { HiDocumentText, HiQuestionMarkCircle, HiInformationCircle, HiShieldCheck, HiCreditCard } from "react-icons/hi2";

const TermsPage = () => {
  const t = useTranslations();
  const docs = [
    {
      title: t("terms.faqs.title"),
      contentKey: "faqs",
      icon: HiQuestionMarkCircle,
      description: t("terms.faqs.description") || "Ответы на часто задаваемые вопросы",
    },
    {
      title: t("terms.about.title"),
      contentKey: "about",
      icon: HiInformationCircle,
      description: t("terms.about.description") || "Информация о приложении",
    },
    {
      title: t("terms.offer.title"),
      contentKey: "offer",
      icon: HiDocumentText,
      description: t("terms.offer.description") || "Пользовательское соглашение",
    },
    {
      title: t("terms.personal.title"),
      contentKey: "personal",
      icon: HiShieldCheck,
      description: t("terms.personal.description") || "Политика обработки персональных данных",
    },
    {
      title: t("terms.payment.title"),
      contentKey: "payment",
      icon: HiCreditCard,
      description: t("terms.payment.description") || "Условия онлайн оплаты",
    },
  ];
  return (
    <div className="min-h-screen">
      <div >
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            
            <div>
              <h1 className="text-2xl font-bold text-[#191919] mb-1">
                {t("terms.title")}
              </h1>
              <p className="text-[#666666] text-sm">
                Документы и условия использования
              </p>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="space-y-3">
          {docs.map((doc) => (
            <TermsViewCard 
              key={doc.contentKey} 
              {...doc} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
