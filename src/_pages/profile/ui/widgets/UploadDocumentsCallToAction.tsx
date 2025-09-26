"use client";

import { IUser, UserRole } from "@/shared/models/types/user";
import { useTranslations } from "next-intl";
import { UploadDocumentsButton } from "./UploadDocumentsButton";

interface UploadDocumentsCallToActionProps {
  user: IUser;
  getUser: () => void;
}

export const UploadDocumentsCallToAction = ({ user, getUser }: UploadDocumentsCallToActionProps) => {
  const t = useTranslations("profile");

  // Показываем компонент если:
  // 1. Документы не загружены (CLIENT статус)
  // 2. Отклонены документы (REJECTFIRSTDOC статус)
  // 3. Ожидает одобрения финансиста (PENDINGTOFIRST статус) - можно изменить данные
  const shouldShowUpload = user.role === UserRole.CLIENT || 
                          user.role === UserRole.REJECTFIRSTDOC ||
                          user.role === UserRole.PENDINGTOFIRST;
  
  if (!shouldShowUpload) {
    return null;
  }

  // Определяем контент в зависимости от статуса
  const isDocumentRejection = user.role === UserRole.REJECTFIRSTDOC;
  const isPendingToFirst = user.role === UserRole.PENDINGTOFIRST;
  
  return (
    <div className={`bg-gradient-to-r ${isDocumentRejection ? 'from-orange-50 to-yellow-50 border-orange-200' : isPendingToFirst ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-blue-50 to-indigo-50 border-blue-200'} border rounded-2xl p-6 mb-6 shadow-sm`}>
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 ${isDocumentRejection ? 'bg-orange-100' : isPendingToFirst ? 'bg-yellow-100' : 'bg-blue-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className={`${isDocumentRejection ? 'text-orange-600' : isPendingToFirst ? 'text-yellow-600' : 'text-blue-600'} text-2xl`}>📄</span>
        </div>
        <div className="flex-1">
          <h3 className={`${isDocumentRejection ? 'text-orange-800' : isPendingToFirst ? 'text-yellow-800' : 'text-blue-800'} text-lg font-semibold mb-2`}>
            {isDocumentRejection ? t("reuploadDocumentsTitle") : isPendingToFirst ? t("updateDocumentsTitle") : t("uploadDocumentsToStartRenting")}
          </h3>
          <p className={`${isDocumentRejection ? 'text-orange-700' : isPendingToFirst ? 'text-yellow-700' : 'text-blue-700'} text-sm mb-4`}>
            {isDocumentRejection ? t("reuploadDocumentsDescription") : isPendingToFirst ? t("updateDocumentsDescription") : t("uploadDocumentsDescription")}
          </p>
          <UploadDocumentsButton user={user} getUser={getUser} />
        </div>
      </div>
    </div>
  );
};
