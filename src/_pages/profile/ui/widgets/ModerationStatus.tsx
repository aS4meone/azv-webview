"use client";

import { IUser, UserRole } from "@/shared/models/types/user";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { UploadDocumentsButton } from "./UploadDocumentsButton";

interface ModerationStatusProps {
  user: IUser;
  getUser: () => void;
}

export const ModerationStatus = ({ user, getUser }: ModerationStatusProps) => {
  const t = useTranslations("profile");

  // Проверяем новые статусы модерации
  const isPendingToFirst = user.role === UserRole.PENDINGTOFIRST;
  const isPendingToSecond = user.role === UserRole.PENDINGTOSECOND;
  const isAnyPending = isPendingToFirst || isPendingToSecond;

  // Проверяем статусы отклонения
  const isRejected = user.role === UserRole.REJECTFIRSTDOC || 
                    user.role === UserRole.REJECTFIRST || 
                    user.role === UserRole.REJECTSECOND;

  // Если нет pending статусов или есть reject статусы, не показываем компонент
  if (!isAnyPending || isRejected) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <div className="flex-1 text-center">
          <h3 className="text-yellow-800 text-lg font-semibold mb-2">
            {t("moderationInProgress")}
          </h3>
          <p className="text-yellow-700 text-sm mb-4">
            {t("moderationDescription")}
          </p>
          {/* Показываем кнопку только для PENDINGTOFIRST, не для PENDINGTOSECOND */}
          {isPendingToFirst && (
            <UploadDocumentsButton user={user} getUser={getUser} />
          )}
        </div>
      </div>
    </div>
  );
};
