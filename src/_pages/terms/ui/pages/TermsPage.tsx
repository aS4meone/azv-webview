import TermsViewCard from "../widgets/TermsViewCard";
import { useTranslations } from "next-intl";

const TermsPage = () => {
  const t = useTranslations();
  const docs = [
    {
      title: t("faqs"),
      contentKey: "faqs",
    },
    {
      title: t("aboutApp"),
      contentKey: "about",
    },
    {
      title: t("userOffer"),
      contentKey: "offer",
    },
    {
      title: t("personalData"),
      contentKey: "personal",
    },
    {
      title: t("onlinePayment"),
      contentKey: "payment",
    },
  ];
  return (
    <section>
      <h2 className="text-[24px] font-semibold text-[#191919] mb-6">
        Условия и Политика
      </h2>
      <div className="flex flex-col gap-4">
        {docs.map((doc) => (
          <TermsViewCard key={doc.contentKey} {...doc} />
        ))}
      </div>
    </section>
  );
};

export default TermsPage;
