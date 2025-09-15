import TermsViewCard from "../widgets/TermsViewCard";
import { useTranslations } from "next-intl";

const TermsPage = () => {
  const t = useTranslations();
  const docs = [
    {
      title: t("terms.faqs.title"),
      contentKey: "faqs",
    },
    {
      title: t("terms.about.title"),
      contentKey: "about",
    },
    {
      title: t("terms.offer.title"),
      contentKey: "offer",
    },
    {
      title: t("terms.personal.title"),
      contentKey: "personal",
    },
    {
      title: t("terms.payment.title"),
      contentKey: "payment",
    },
  ];
  return (
    <section>
      <h2 className="text-[24px] font-semibold text-[#191919] mb-6">
        {t("terms.title")}
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
