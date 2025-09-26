"use client";

import { IUser, UserRole } from "@/shared/models/types/user";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, XCircle } from "lucide-react";
import { useState } from "react";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { GuarantorPage } from "@/_pages/guarantor";
import { HelpModal } from "@/_pages/guarantor/ui/components/HelpModal";

interface FinancialRejectionProps {
  user: IUser;
}

export const FinancialRejection = ({ user }: FinancialRejectionProps) => {
  const t = useTranslations("profile");
  const [showGuarantorModal, setShowGuarantorModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Проверяем новые статусы отклонения
  const isFinancialRejection = user.role === UserRole.REJECTFIRST;
  const isDocumentRejection = user.role === UserRole.REJECTFIRSTDOC;
  const isMvdRejection = user.role === UserRole.REJECTSECOND;

  // Показываем компонент только если есть статус отклонения
  if (!isFinancialRejection && !isDocumentRejection && !isMvdRejection) {
    return null;
  }

  const handleGuarantorClick = () => {
    setShowGuarantorModal(true);
    // Автоматически открываем HelpModal после открытия GuarantorPage
    setTimeout(() => {
      setShowHelpModal(true);
    }, 100);
  };

  // Определяем контент в зависимости от типа отклонения
  const getRejectionContent = () => {
    if (isMvdRejection) {
      return {
        icon: <XCircle className="w-6 h-6 text-red-600" />,
        title: t("mvdRejectionTitle"),
        message: t("mvdRejectionMessage"),
        showButton: false
      };
    }
    
    if (isDocumentRejection) {
      return {
        icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
        title: t("documentRejectionTitle"),
        message: t("documentRejectionMessage"),
        showButton: false
      };
    }
    
    if (isFinancialRejection) {
      return {
        icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
        title: t("financialRejectionTitle"),
        message: t("financialRejectionMessage"),
        showButton: true
      };
    }
    
    return null;
  };

  const rejectionContent = getRejectionContent();
  if (!rejectionContent) return null;

  return (
    <>
      <div className={`bg-gradient-to-r ${isMvdRejection ? 'from-red-50 to-pink-50 border-red-200' : isDocumentRejection ? 'from-orange-50 to-yellow-50 border-orange-200' : 'from-red-50 to-pink-50 border-red-200'} border rounded-2xl p-6 mb-6 shadow-sm`}>
        <div className="flex flex-col items-start gap-4">
          <div className={`w-12 h-12 ${isMvdRejection ? 'bg-red-100' : isDocumentRejection ? 'bg-orange-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
            {rejectionContent.icon}
          </div>
          <div className="flex-1">
            <h3 className={`${isMvdRejection ? 'text-red-800' : isDocumentRejection ? 'text-orange-800' : 'text-red-800'} font-semibold text-lg mb-3`}>
              {rejectionContent.title}
            </h3>
            <p className={`${isMvdRejection ? 'text-red-700' : isDocumentRejection ? 'text-orange-700' : 'text-red-700'} text-sm leading-relaxed mb-4`}>
              {rejectionContent.message}
            </p>
            {/* Показываем причину отказа, если она есть */}
            {user.application?.reason && (
              <div className={`${isMvdRejection ? 'bg-red-100 border-red-200' : isDocumentRejection ? 'bg-orange-100 border-orange-200' : 'bg-red-100 border-red-200'} border rounded-lg p-3 mb-4`}>
                <p className={`${isMvdRejection ? 'text-red-800' : isDocumentRejection ? 'text-orange-800' : 'text-red-800'} text-sm font-medium mb-1`}>
                  {t("rejectionReason")}:
                </p>
                <p className={`${isMvdRejection ? 'text-red-700' : isDocumentRejection ? 'text-orange-700' : 'text-red-700'} text-sm`}>
                  {user.application.reason}
                </p>
              </div>
            )}
            {rejectionContent.showButton && (
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleGuarantorClick}
              >
                {t("goToGuarantor")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Guarantor Modal */}
      <CustomPushScreen
        isOpen={showGuarantorModal}
        onClose={() => setShowGuarantorModal(false)}
        direction="right"
        fullScreen={true}
      >
        <GuarantorPage />
      </CustomPushScreen>

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </>
  );
};
