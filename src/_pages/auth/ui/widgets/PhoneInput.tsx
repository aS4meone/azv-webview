import { formatPhone } from "@/shared/utils/formatPhone";
import { useTranslations } from "next-intl";
import React from "react";

const PhoneInput = ({
  phone,
  setPhone,
}: {
  phone: string;
  setPhone: (phone: string) => void;
}) => {
  const t = useTranslations();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");

    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }

    setPhone(digits);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    let pastedData = e.clipboardData.getData("Text").replace(/\D/g, ""); // цифры из вставки

    // Если начинается с 7 (т.е. +7) или с 8, то убираем первый символ
    if (pastedData.startsWith("7") && pastedData.length > 10) {
      pastedData = pastedData.slice(1);
    } else if (pastedData.startsWith("8") && pastedData.length > 10) {
      pastedData = pastedData.slice(1);
    }

    // Обрезаем до 10 цифр (без кода страны)
    if (pastedData.length > 10) {
      pastedData = pastedData.slice(0, 10);
    }

    setPhone(pastedData);
  };

  return (
    <div className="flex items-center gap-2 w-full bg-[#292929] rounded-[20px] h-[60px]">
      <div className="p-4 pl-6 text-[16px]">+7</div>
      <div className="h-full w-[1px] bg-[#191919]"></div>
      <input
        className="w-full outline-none bg-transparent p-4 text-[16px]"
        placeholder={t("auth.phoneNumber.placeholder")}
        value={formatPhone(phone)}
        onChange={handleChange}
        onPaste={handlePaste}
        inputMode="numeric"
        pattern="\d*"
      />
    </div>
  );
};

export { PhoneInput };
