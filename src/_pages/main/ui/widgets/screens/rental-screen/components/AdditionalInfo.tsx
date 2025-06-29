import { ArrowRightIcon } from "@/shared/icons";
import { RentalType } from "@/shared/models/dto/rent.dto";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { TermsContent } from "@/_pages/terms/ui/widgets/TermsContent";
import { ICar } from "@/shared/models/types/car";

interface AdditionalInfoProps {
  rentalType: RentalType;
  car: ICar;
}

export const AdditionalInfo = ({ rentalType, car }: AdditionalInfoProps) => {
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
          className="flex items-center rounded-[10px] w-auto text-[14px] px-2 py-1 h-auto"
          onClick={() => setShowTariff(true)}
        >
          <span>О тарифе</span>
          <ArrowRightIcon />
        </Button>

        <Button
          className="rounded-none items-center flex justify-between w-full"
          onClick={() => setShowAgreement(true)}
        >
          <span className="text-[#191919] font-medium">Договор аренды</span>
          <ArrowRightIcon />
        </Button>

        <CustomPushScreen
          isOpen={showTariff}
          onClose={() => setShowTariff(false)}
          direction="bottom"
          title="О тарифе"
          className="pt-20"
        >
          <TermsContent contentKey="tariff" rentalType={rentalType} car={car} />
        </CustomPushScreen>

        <CustomPushScreen
          isOpen={showAgreement}
          onClose={() => setShowAgreement(false)}
          direction="bottom"
          title="Договор аренды"
          className="pt-20"
        >
          <TermsContent contentKey="agreement" />
        </CustomPushScreen>
      </div>
    </div>
  );
};
