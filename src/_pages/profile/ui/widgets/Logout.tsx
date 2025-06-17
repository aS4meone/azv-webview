import { ROUTES } from "@/shared/constants/routes";
import { LogoutIcon } from "@/shared/icons";
import { Button } from "@/shared/ui";
import { clearTokens } from "@/shared/utils/tokenStorage";
import { callFlutterLogout } from "@/shared/utils/flutterLogout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Logout = () => {
  const t = useTranslations("profile");
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // First call Flutter to clear FCM token
      await callFlutterLogout();
      console.log("FCM token cleared successfully");
    } catch (error) {
      console.error("Error clearing FCM token:", error);
      // Continue with logout even if FCM clearing fails
    }

    // Clear local tokens
    clearTokens();

    // Navigate to onboarding
    router.push(ROUTES.ONBOARDING);

    setIsLoggingOut(false);
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant="outline"
      className="w-full bg-[#F4F4F4] hover:bg-gray-200 border-0 flex items-center justify-center gap-2 py-6 disabled:opacity-50"
    >
      <LogoutIcon color="black" />
      <span>
        {isLoggingOut ? t("loggingOut") || "Logging out..." : t("logout")}
      </span>
    </Button>
  );
};

export default Logout;
