import { PhoneIcon, TelegramIcon } from "@/shared/icons";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const SupportPage = () => {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText("team@azvmotors.kz");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section>
      <h2 className="text-[24px] font-semibold text-[#191919] mb-6">
        {t("support")}
      </h2>
      <div className="container mx-auto py-8 max-w-2xl">
        <section className="mb-12">
          <h2 className="text-[16px] text-[#191919] mb-6">
            {t("emergencyNumbers")}
          </h2>
          <div className="flex flex-col gap-4">
            <a
              href="tel:102"
              className="flex items-center gap-3 px-7 py-5 rounded-full border-1 border-[#1D77FF] text-[#1D77FF] hover:bg-blue-50 transition-colors"
            >
              <PhoneIcon className="w-6 h-6" color="#1D77FF" />
              102 — {t("police")}
            </a>
            <a
              href="tel:103"
              className="flex items-center gap-3 px-7 py-5 rounded-full border-1 border-[#E34545] text-[#E34545] hover:bg-red-50 transition-colors"
            >
              <PhoneIcon className="w-6 h-6" color="#E34545" />
              103 — {t("ambulance")}
            </a>
          </div>
        </section>

        {/* Technical Support Section */}
        <section className="mb-12">
          <h2 className="text-[16px] text-[#191919] mb-6">
            {t("technicalSupport")}
          </h2>
          <a
            href="tel:+77777777777"
            className="flex items-center gap-3 px-7 py-5 border-[#E8E8E8] border text-[#191919] rounded-full bg-gray-100 hover:bg-gray-200 transition-colors justify-between"
          >
            <PhoneIcon className="w-6 h-6" color="#191919" />
            <p>+7 777 777 77 77</p>
            <div className="w-[70px]"></div>
          </a>
        </section>

        {/* Email Section */}
        <section className="mb-12">
          <h2 className="text-[16px] text-[#191919] mb-6">Email</h2>
          <button
            onClick={handleCopyEmail}
            className="flex items-center h-[66px] justify-between px-7 py-5 border-[#E8E8E8] border gap-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-[#191919] w-full mb-6"
          >
            <span>team@azvmotors.kz</span>
            <span className="text-sm text-[#1D77FF]">
              {copied ? "Скопировано!" : "Скопировать"}
            </span>
          </button>
        </section>

        {/* Telegram Section */}
        <section>
          <h2 className="text-[16px] text-[#191919] mb-6">
            {t("ourTelegram")}
          </h2>
          <a
            href="https://t.me/azv_motors_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center h-[66px] justify-between px-7 py-5 border-[#E8E8E8] border gap-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-[#191919]"
          >
            <TelegramIcon />
            Telegram
            <div className="w-[70px]"></div>
          </a>
        </section>
      </div>
    </section>
  );
};

export default SupportPage;
