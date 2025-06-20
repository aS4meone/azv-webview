"use client";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import { useTranslations } from "next-intl";
import DeleteAccount from "../widgets/DeleteAccount";
import Logout from "../widgets/Logout";
import GetUserData from "../widgets/GetUserData";
import { useEffect } from "react";

import { useUserStore } from "@/shared/stores/userStore";
import { DrawerDemo } from "@/shared/test";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { user, isLoading, refreshUser } = useUserStore();

  useEffect(() => {
    refreshUser();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <article className="flex flex-col min-h-screen bg-white py-10 pb-14">
      <CustomAppBar backHref={ROUTES.MAIN} title={t("title")} />
      <GetUserData user={user} getUser={refreshUser} isLoading={isLoading} />
      <DrawerDemo />
      <div className="px-4 py-6 space-y-4 ">
        <DeleteAccount />
        <Logout />
      </div>
    </article>
  );
}
