import React from "react";
import { HiX, HiQuestionMarkCircle } from "react-icons/hi";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { useTranslations } from "next-intl";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations();
  
  if (!isOpen) return null;

  return (
    <CustomPushScreen 
      isOpen={isOpen} 
      onClose={onClose}
      direction="right"
      withHeader={false}
      fullScreen={true}
    >
      <div className="relative w-full h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 mt-[48px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center">
              <HiQuestionMarkCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#191919]">
              {t("guarantor.helpModal.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#191919] transition-colors duration-200"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            overscrollBehaviorY: "auto",
          }}
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-[#191919] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#191919]"></div>
                {t("guarantor.helpModal.definition")}
              </h4>
              <p className="text-sm text-[#191919] leading-relaxed">
                {t("guarantor.helpModal.definitionText")}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#191919] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#191919]"></div>
                {t("guarantor.helpModal.howItWorks")}
              </h4>
              <ul className="text-sm text-[#191919] space-y-2">
                {t.raw("guarantor.helpModal.howItWorksItems").map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#191919] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#191919] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#191919]"></div>
                {t("guarantor.helpModal.tabs")}
              </h4>
              <div className="text-sm text-[#191919] space-y-3">
                <div className="bg-[#F8F8F8] rounded-lg p-3">
                  <strong className="text-[#191919]">{t("guarantor.tabs.iAmGuarantor")}:</strong> {t("guarantor.helpModal.iAmGuarantorTab")}
                </div>
                <div className="bg-[#F8F8F8] rounded-lg p-3">
                  <strong className="text-[#191919]">{t("guarantor.tabs.myGuarantors")}:</strong> {t("guarantor.helpModal.myGuarantorsTab")}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#191919] text-white rounded-xl hover:bg-[#333333] transition-all duration-300 font-semibold"
          >
            {t("guarantor.helpModal.understood")}
          </button>
        </div>
      </div>
    </CustomPushScreen>
  );
};
