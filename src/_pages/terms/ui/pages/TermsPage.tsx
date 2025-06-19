import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
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
    <article className="flex flex-col min-h-screen bg-white pt-10">
      <CustomAppBar backHref={ROUTES.MAIN} />
      <section className="px-8 pt-5">
        <h2 className="text-[24px] font-semibold text-[#191919] mb-6">
          Условия и Политика
        </h2>
        <div className="flex flex-col gap-4">
          {docs.map((doc) => (
            <TermsViewCard key={doc.contentKey} {...doc} />
          ))}
        </div>
      </section>
    </article>
  );
};

export default TermsPage;
