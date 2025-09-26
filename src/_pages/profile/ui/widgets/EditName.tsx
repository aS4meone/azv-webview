"use client";

import { IUser } from "@/shared/models/types/user";
import { useTranslations } from "next-intl";

// Функция для форматирования даты рождения
const formatBirthDate = (birthDate: string | null | undefined): string => {
  if (!birthDate) return "-";
  
  try {
    const date = new Date(birthDate);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (error) {
    console.error("Error formatting birth date:", error);
    return birthDate;
  }
};

// Функция для форматирования IIN
const formatIIN = (iin: string | null | undefined): string => {
  if (!iin) return "-";
  // Форматируем IIN как XXX XXX XXX XXX
  return iin.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
};

interface EditNameProps {
  user: IUser;
}

export const EditName = ({ user }: EditNameProps) => {
  const t = useTranslations("profile");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#191919]">
          {t("personalInfo")}
        </h3>
      </div>
      
      {/* Profile Photo - Centered and larger */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {user.documents.selfie_url ? (
            <img
              src={`https://api.azvmotors.kz/${user.documents.selfie_url}`}
              alt="Profile"
              className="!w-32 !h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-gray-500 text-4xl">👤</span>
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </div>

      {/* Personal Info Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-[14px] text-[#666666] mb-2 font-medium">
              {t("firstName")}
            </label>
            <div className="text-[16px] text-[#191919] font-medium">
              {user.first_name || "-"}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-[14px] text-[#666666] mb-2 font-medium">
              {t("lastName")}
            </label>
            <div className="text-[16px] text-[#191919] font-medium">
              {user.last_name || "-"}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-[14px] text-[#666666] mb-2 font-medium">
              {t("phoneNumber")}
            </label>
            <div className="flex items-center justify-between">
              <span className="text-[16px] text-[#191919] font-medium">
                {user.phone_number || "-"}
              </span>
              <span className="text-[12px] text-[#666666] bg-[#E5E5E5] px-3 py-1 rounded-full font-medium">
                {t("readOnly")}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-[14px] text-[#666666] mb-2 font-medium">
              {t("birthDate")}
            </label>
            <div className="text-[16px] text-[#191919] font-medium">
              {formatBirthDate(user.birth_date)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-[14px] text-[#666666] mb-2 font-medium">
              {user.iin ? t("iin") : t("passportNumber")}
            </label>
            <div className="text-[16px] text-[#191919] font-medium">
              {user.iin ? formatIIN(user.iin) : (user.passport_number || "-")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};