"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { CustomModal } from "@/components/ui/custom-modal";
import { Button } from "@/shared/ui";
import { MdWindow, MdDoorFront } from "react-icons/md";
import { FaKey, FaWalking } from "react-icons/fa";
import { HiShoppingBag } from "react-icons/hi";

interface RentalCompletionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RentalCompletionGuideModal: React.FC<RentalCompletionGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useTranslations("uploadPhoto.rentalCompletionGuide");

  const steps = [
    { key: "closeWindows", icon: MdWindow },
    { key: "turnOffEngine", icon: FaKey },
    { key: "takeYourBelongings", icon: HiShoppingBag },
    { key: "leaveTheCar", icon: FaWalking },
    { key: "closeAllDoors", icon: MdDoorFront },
  ];

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} variant="bottom">
      <div className="bg-white rounded-t-3xl p-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#191919] text-center mb-2">
            {t("title")}
          </h2>
          <p className="text-sm text-[#666666] text-center">
            {t("description")}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.key}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl transition-all hover:bg-gray-100"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
                  <IconComponent className="text-white text-xl" />
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
                      {t("step")} {index + 1}
                    </span>
                  </div>
                  <p className="text-base font-medium text-[#191919]">
                    {t(`steps.${step.key}`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning Block */}
        <div className="mb-6 p-4 bg-gray-100 border-2 border-gray-300 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-lg font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-800 mb-2">
                {t("warning")}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {t("warningText")}
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {t("buttonText")}
        </Button>
      </div>
    </CustomModal>
  );
};

