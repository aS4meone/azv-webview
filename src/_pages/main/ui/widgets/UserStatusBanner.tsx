"use client";

import { IUser, UserRole } from "@/shared/models/types/user";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, Clock, XCircle, Upload } from "lucide-react";
import { useState } from "react";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { GuarantorPage } from "@/_pages/guarantor";
import { HelpModal } from "@/_pages/guarantor/ui/components/HelpModal";
import { UploadDocuments } from "@/_pages/profile/ui/widgets/documents/UploadDocuments";

interface UserStatusBannerProps {
  user: IUser | null;
  getUser: () => void;
}

export const UserStatusBanner = ({ user, getUser }: UserStatusBannerProps) => {
  const t = useTranslations("profile");
  const [showGuarantorModal, setShowGuarantorModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  if (!user) return null;

  // Если пользователь уже USER, не показываем баннер
  if (user.role === UserRole.USER) return null;

  // CLIENT - не загрузил документы
  if (user.role === UserRole.CLIENT) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-blue-800 font-semibold text-sm mb-1">
                {t("uploadDocumentsToStartRenting")}
              </h3>
              <p className="text-blue-700 text-xs mb-3">
                {t("uploadDocumentsDescription")}
              </p>
              <UploadDocuments getUser={getUser} user={user} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PENDINGTOFIRST - проходит модерацию, можно менять документы
  if (user.role === UserRole.PENDINGTOFIRST) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-800 font-semibold text-sm mb-1">
                {t("moderationInProgress")}
              </h3>
              <p className="text-yellow-700 text-xs mb-3">
                {t("updateDocumentsDescription")}
              </p>
              <UploadDocuments getUser={getUser} user={user} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PENDINGTOSECOND - проходит модерацию, нельзя менять документы
  if (user.role === UserRole.PENDINGTOSECOND) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-800 font-semibold text-sm mb-1">
                {t("moderationInProgress")}
              </h3>
              <p className="text-yellow-700 text-xs">
                {t("moderationDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REJECTFIRST - отказ по финансовой части
  if (user.role === UserRole.REJECTFIRST) {
    const handleGuarantorClick = () => {
      setShowGuarantorModal(true);
      setTimeout(() => {
        setShowHelpModal(true);
      }, 100);
    };

    return (
      <>
        <div className="w-full">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold text-sm mb-1">
                  {t("financialRejectionTitle")}
                </h3>
                <p className="text-red-700 text-xs mb-3">
                  {t("financialRejectionMessage")}
                </p>
                {/* Показываем причину отказа, если она есть */}
                {user.application?.reason && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-2 mb-3">
                    <p className="text-red-800 text-xs font-medium mb-1">
                      {t("rejectionReason")}:
                    </p>
                    <p className="text-red-700 text-xs">
                      {user.application.reason}
                    </p>
                  </div>
                )}
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 text-xs font-medium"
                  onClick={handleGuarantorClick}
                >
                  {t("goToGuarantor")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <CustomPushScreen
          isOpen={showGuarantorModal}
          onClose={() => setShowGuarantorModal(false)}
          direction="right"
          fullScreen={true}
        >
          <GuarantorPage />
        </CustomPushScreen>

        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
      </>
    );
  }

  // REJECTFIRSTDOC - отказ по документам
  if (user.role === UserRole.REJECTFIRSTDOC) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-orange-800 font-semibold text-sm mb-1">
                {t("documentRejectionTitle")}
              </h3>
                <p className="text-orange-700 text-xs mb-3">
                  {t("documentRejectionMessage")}
                </p>
                {/* Показываем причину отказа, если она есть */}
                {user.application?.reason && (
                  <div className="bg-orange-100 border border-orange-200 rounded-lg p-2 mb-3">
                    <p className="text-orange-800 text-xs font-medium mb-1">
                      {t("rejectionReason")}:
                    </p>
                    <p className="text-orange-700 text-xs">
                      {user.application.reason}
                    </p>
                  </div>
                )}
              <UploadDocuments getUser={getUser} user={user} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REJECTSECOND - отказ МВД
  if (user.role === UserRole.REJECTSECOND) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold text-sm mb-1">
                {t("mvdRejectionTitle")}
              </h3>
                <p className="text-red-700 text-xs mb-3">
                  {t("mvdRejectionMessage")}
                </p>
                {/* Показываем причину отказа, если она есть */}
                {user.application?.reason && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-2">
                    <p className="text-red-800 text-xs font-medium mb-1">
                      {t("rejectionReason")}:
                    </p>
                    <p className="text-red-700 text-xs">
                      {user.application.reason}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
