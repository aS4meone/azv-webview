"use client";

import { useState } from "react";
import { IUser } from "@/shared/models/types/user";
import { useTranslations } from "next-intl";
import { userApi } from "@/shared/api/routes/user";
import { useUserStore } from "@/shared/stores/userStore";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface EditNameProps {
  user: IUser;
}

export const EditName = ({ user }: EditNameProps) => {
  const t = useTranslations("profile");
  const { refreshUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() && !lastName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await userApi.updateName({
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      });
      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#191919]">
            {t("personalInfo")}
          </h3>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="text-xs w-[200px]"
          >
            {t("edit")}
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] text-[#454545] mb-1">
              {t("firstName")}
            </label>
            <div className="text-[16px] text-[#191919]">
              {user.first_name || "-"}
            </div>
          </div>
          <div>
            <label className="block text-[14px] text-[#454545] mb-1">
              {t("lastName")}
            </label>
            <div className="text-[16px] text-[#191919]">
              {user.last_name || "-"}
            </div>
          </div>
          <div>
            <label className="block text-[14px] text-[#454545] mb-1">
              {t("phoneNumber")}
            </label>
            <div className="text-[16px] text-[#191919] flex items-center gap-2">
              <span>{user.phone_number || "-"}</span>
              <span className="text-[12px] text-[#666666] bg-[#F5F5F5] px-2 py-1 rounded">
                {t("readOnly")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#191919]">
          {t("editPersonalInfo")}
        </h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-[14px] text-[#454545] mb-1">
            {t("firstName")}
          </label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t("enterFirstName")}
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-[14px] text-[#454545] mb-1">
            {t("lastName")}
          </label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t("enterLastName")}
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-[14px] text-[#454545] mb-1">
            {t("phoneNumber")}
          </label>
          <div className="relative">
            <Input
              value={user.phone_number || ""}
              disabled
              className="bg-[#F5F5F5] text-[#666666] cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#666666] bg-white px-2 py-1 rounded border">
              {t("readOnly")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isLoading || (!firstName.trim() && !lastName.trim())}
            className="flex-1"
          >
            {isLoading ? t("saving") : t("save")}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
};
