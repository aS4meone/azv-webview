import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import TermsViewCard from "../widgets/TermsViewCard";
import { useTranslations } from "next-intl";

const TermsPage = () => {
  const t = useTranslations();
  const docs = [
    {
      title: t("faqs"),
      url: "/docs/freq_ques.pdf",
    },
    {
      title: t("aboutApp"),
      url: "/docs/about.pdf",
    },
    {
      title: t("userOffer"),
      url: "/docs/offer.pdf",
    },
    {
      title: t("personalData"),
      url: "/docs/personal.pdf",
    },
    {
      title: t("onlinePayment"),
      url: "/docs/online_payment.pdf",
    },
  ];
  return (
    <article className="flex flex-col min-h-screen bg-white pt-10">
      <CustomAppBar backHref={ROUTES.MAIN} />
      <section className="px-8 pt-5">
        <h2 className="text-[24px] font-semibold text-[#191919] mb-6">
          {t("terms")}
        </h2>
        <div className="flex flex-col gap-4">
          {docs.map((doc) => (
            <TermsViewCard key={doc.title} {...doc} />
          ))}
        </div>
      </section>
    </article>
  );
};

export default TermsPage;
