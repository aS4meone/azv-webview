import { IUser } from "@/shared/models/types/user";
import { formatPhone } from "@/shared/utils/formatPhone";
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
          +7 {formatPhone(user.phone_number)}
        </div>
      </div>
    </div>
  );
};
