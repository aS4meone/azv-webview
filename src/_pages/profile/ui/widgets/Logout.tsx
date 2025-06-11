import { ROUTES } from "@/shared/constants/routes";
import { LogoutIcon } from "@/shared/icons";
import { Button } from "@/shared/ui";
import { clearTokens } from "@/shared/utils/tokenStorage";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React from "react";

const Logout = () => {
  const t = useTranslations("profile");
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        clearTokens();
        router.push(ROUTES.ONBOARDING);
      }}
      variant="outline"
      className="w-full bg-[#F4F4F4] hover:bg-gray-200 border-0 flex items-center justify-center gap-2 py-6"
    >
      <LogoutIcon color="black" />
      <span>{t("logout")}</span>
    </Button>
  );
};

export default Logout;
