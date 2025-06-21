"use client";

import DeleteAccount from "../widgets/DeleteAccount";
import Logout from "../widgets/Logout";
import GetUserData from "../widgets/GetUserData";
import { useEffect } from "react";

import { useUserStore } from "@/shared/stores/userStore";

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useUserStore();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <GetUserData user={user} getUser={refreshUser} isLoading={isLoading} />

      <div className=" py-6 space-y-4 ">
        <DeleteAccount />
        <Logout />
      </div>
    </>
  );
}
