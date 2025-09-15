import { ROUTES } from "@/shared/constants/routes";
import { LogoutIcon } from "@/shared/icons";
import { Button } from "@/shared/ui";
import { ResponseBottomModalContent } from "@/shared/ui/modal/ResponseBottomModal";
import { clearTokens } from "@/shared/utils/tokenStorage";
import { callFlutterLogout } from "@/shared/utils/flutterLogout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";

const Logout = () => {
  const t = useTranslations("profile");
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [responseModal, setResponseModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;
    buttonText: string;
    onButtonClick: () => void;
  } | null>(null);

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
    <>
      <CustomPushScreen
        isOpen={!!responseModal}
        onClose={() => {
          setResponseModal(null);
        }}
        withHeader={false}
        fullScreen={false}
        direction="bottom"
        height="auto"
      >
        <ResponseBottomModalContent
          type={responseModal?.type || "success"}
          title={responseModal?.title || ""}
          description={responseModal?.description || ""}
          buttonText={responseModal?.buttonText || ""}
          onButtonClick={() => {
            handleLogout();
          }}
        />
      </CustomPushScreen>
      <Button
        onClick={() => {
          setResponseModal({
            isOpen: true,
            type: "error",
            title: t("logout"),
            description: t("logoutConfirm"),
            buttonText: t("logout"),
            onButtonClick: handleLogout,
          });
        }}
        disabled={isLoggingOut}
        variant="outline"
        className="w-full bg-[#F4F4F4] border-0 flex items-center justify-center gap-2 py-6 disabled:opacity-50"
      >
        <LogoutIcon color="black" />
        <span>{isLoggingOut ? t("loggingOut") : t("logout")}</span>
      </Button>
    </>
  );
};

export default Logout;
