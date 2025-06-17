import { userApi } from "@/shared/api/routes/user";
import { ROUTES } from "@/shared/constants/routes";

import { Button } from "@/shared/ui/button";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { clearTokens } from "@/shared/utils/tokenStorage";
import { callFlutterLogout } from "@/shared/utils/flutterLogout";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import React from "react";
import { TrashIcon } from "@/shared/icons";

const DeleteAccount = () => {
  const router = useRouter();
  const t = useTranslations();
  const t2 = useTranslations("profile");
  const { showModal } = useResponseModal();

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
      showModal({
        type: "success",
        title: "Действие выполнено",
        description: "Аккаунт удален",
        buttonText: t("modal.success.button"),
        onButtonClick: handleLogoutAndRedirect,
        onClose: handleLogoutAndRedirect,
      });
    } else {
      showModal({
        type: "error",
        title: t("error"),
        description: res.data.detail,
        buttonText: t("modal.error.button"),
      });
    }
  };
  return (
    <Button
      variant="danger"
      onClick={() => {
        console.log("Delete button clicked");
        showModal({
          type: "error",
          title: "Вы уверены?",
          description: "Вы уверены, что хотите удалить аккаунт?",
          buttonText: "Да, удалить",
          onButtonClick: () => {
            showModal({
              type: "error",
              title: "Вы точно уверены?",
              description:
                "Это действие необратимо. Все ваши данные будут удалены.",
              buttonText: "Да, удалить",
              onButtonClick: handleDelete,
            });
          },
        });
      }}
      className="w-full flex items-center justify-center gap-2 py-6 bg-transparent"
    >
      <TrashIcon />
      <span className="ml-2 text-[18px] text-[#E56D6D]">
        {t2("deleteAccount")}
      </span>
    </Button>
  );
};

export default DeleteAccount;
