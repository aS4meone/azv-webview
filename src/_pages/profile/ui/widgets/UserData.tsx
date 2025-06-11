import { IUser } from "@/shared/models/types/user";

import { useTranslations } from "next-intl";

export const UserData = ({ user }: { user: IUser }) => {
  const t = useTranslations("profile");
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[14px] text-[#454545] mb-1">
          {t("fullName")}
        </label>
        <div className="text-[16px] text-[#191919]">
          {user.full_name || "-"}
        </div>
      </div>
      <div>
        <label className="block text-sm text-[#454545] mb-1">
          {t("phoneNumber")}
        </label>
        <div className="text-[16px] text-[#191919]">
          {formatPhone(user.phone_number)}
        </div>
      </div>
    </div>
  );
};

export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if we have a valid length
  if (cleaned.length !== 11) {
    return phone;
  }

  // Format the number in the desired pattern
  return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(
    4,
    7
  )} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
};
