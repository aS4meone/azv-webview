"use client";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import { useTranslations } from "next-intl";
import DeleteAccount from "../widgets/DeleteAccount";
import Logout from "../widgets/Logout";
import GetUserData from "../widgets/GetUserData";
import { useEffect, useState } from "react";
import { IUser } from "@/shared/models/types/user";
import { userApi } from "@/shared/api/routes/user";
import { useUserStore } from "@/shared/stores/userStore";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { user, fetchUser, isLoading, refreshUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <article className="flex flex-col min-h-screen bg-white pt-10">
      <CustomAppBar backHref={ROUTES.MAIN} title={t("title")} />
      <GetUserData user={user} getUser={refreshUser} isLoading={isLoading} />
      <div className="px-4 py-6 space-y-4">
        <DeleteAccount />
        <Logout />
      </div>
    </article>
  );
}
