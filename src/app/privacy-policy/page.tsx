import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import PublicPrivacyPolicy from "./PublicPrivacyPolicy";

export const metadata: Metadata = {
  title: "Политика конфиденциальности - AZV Motors",
  description: "Политика конфиденциальности и обработки персональных данных AZV Motors. Узнайте, как мы собираем, используем и защищаем вашу информацию.",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const messages = await getTranslations("terms.personal");

  return <PublicPrivacyPolicy locale={locale as "ru" | "en" | "kz"} />;
}
