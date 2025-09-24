import { ArrowRightIcon } from "@/shared/icons";
import { RentalType } from "@/shared/models/dto/rent.dto";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { TermsContent } from "@/_pages/terms/ui/widgets/TermsContent";
import { ICar } from "@/shared/models/types/car";
import { useTranslations } from "next-intl";

interface AdditionalInfoProps {
  rentalType: RentalType;
  car: ICar;
}

export const AdditionalInfo = ({ rentalType, car }: AdditionalInfoProps) => {
  const t = useTranslations();
  const [showTariff, setShowTariff] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  return (
    <div className="space-y-4">
      {rentalType === "days" && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[16px] font-medium text-green-800 mb-3">
            Скидки при длительной аренде
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">От 3 дней:</span>
              <span className="font-medium text-green-800">скидка 5%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">От 7 дней:</span>
              <span className="font-medium text-green-800">скидка 10%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">От 30 дней:</span>
              <span className="font-medium text-green-800">скидка 15%</span>
            </div>
          </div>
        </div>
      )}

      {/* Основная информация для всех тарифов */}
      <div className="space-y-3 pt-2 flex flex-col items-start">
        <Button
          variant="outline"
          className="group flex items-center gap-2 rounded-xl w-auto text-[14px] px-3 py-2 h-auto border-[#191919] text-[#191919] hover:bg-black/5 hover:shadow-sm transition-colors duration-200"
          onClick={() => setShowTariff(true)}
        >
          <span>{t("widgets.screens.rental.aboutTariff")}</span>
          <span className="ml-0.5 transition-transform group-hover:translate-x-0.5">
            <ArrowRightIcon />
          </span>
        </Button>

        <Button
          className="group rounded-2xl items-center flex justify-between w-full bg-gradient-to-r from-[#191919] to-[#0f0f0f] text-white hover:from-black hover:to-[#0a0a0a] shadow-md hover:shadow-lg transition-all duration-200 px-4 py-3"
          onClick={() => setShowAgreement(true)}
        >
          <span className="text-white font-semibold">{t("terms.userAgreement.title")}</span>
          <span className="ml-2 transition-transform group-hover:translate-x-0.5">
            <ArrowRightIcon />
          </span>
        </Button>

        <CustomPushScreen
          isOpen={showTariff}
          onClose={() => setShowTariff(false)}
          direction="bottom"
          title={t("widgets.screens.rental.aboutTariff")}
          className="pt-20"
        >
          <TermsContent contentKey="tariff" rentalType={rentalType} car={car} />
        </CustomPushScreen>

        <CustomPushScreen
          isOpen={showAgreement}
          onClose={() => setShowAgreement(false)}
          direction="bottom"
          title={t("terms.userAgreement.title")}
          className="pt-20"
        >
          <TermsContent contentKey="agreement" />
        </CustomPushScreen>
      </div>
    </div>
  );
};
