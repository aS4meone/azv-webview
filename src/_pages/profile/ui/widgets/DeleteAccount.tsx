import { userApi } from "@/shared/api/routes/user";
import { ROUTES } from "@/shared/constants/routes";

import { Button } from "@/shared/ui/button";
import { clearTokens } from "@/shared/utils/tokenStorage";
import { callFlutterLogout } from "@/shared/utils/flutterLogout";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import React, { useState } from "react";
import { TrashIcon } from "@/shared/icons";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { ResponseBottomModalContent } from "@/shared/ui/modal/ResponseBottomModal";

const DeleteAccount = () => {
  const router = useRouter();
  const t = useTranslations();
  const t2 = useTranslations("profile");
  const [responseModal, setResponseModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;
    buttonText: string;
    onButtonClick: () => void;
  } | null>(null);

  const handleLogoutAndRedirect = async () => {
    try {
      // Clear FCM token first
      await callFlutterLogout();
      console.log("FCM token cleared successfully");
    } catch (error) {
      console.error("Error clearing FCM token:", error);
    }

    // Clear local tokens
    clearTokens();

    // Navigate to onboarding
    router.push(ROUTES.ONBOARDING);
  };

  const handleDelete = async () => {
    const res = await userApi.deleteUser();
    if (res.status === 200) {
      setResponseModal({
        type: "success",
        title: t2("actionCompleted"),
        description: t2("accountDeleted"),
        buttonText: t("modal.success.button"),
        isOpen: true,
        onButtonClick: handleLogoutAndRedirect,
      });
    } else {
      setResponseModal({
        type: "error",
        title: t("error"),
        description: res.data.detail,
        buttonText: t("modal.error.button"),
        isOpen: true,
        onButtonClick: handleLogoutAndRedirect,
      });
    }
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
            setResponseModal(null);
          }}
        />
      </CustomPushScreen>
      <Button
        variant="danger"
        onClick={() => {
        setResponseModal({
          type: "error",
          title: t2("areYouSure"),
          description: t2("areYouSureDeleteAccount"),
          buttonText: t2("yesDelete"),
          isOpen: true,
          onButtonClick: handleDelete,
        });
        }}
        className="w-full flex items-center justify-center gap-2 py-6 bg-transparent"
      >
        <TrashIcon />
        <span className="ml-2 text-[18px] text-[#E56D6D]">
          {t2("deleteAccount")}
        </span>
      </Button>
    </>
  );
};

export default DeleteAccount;
