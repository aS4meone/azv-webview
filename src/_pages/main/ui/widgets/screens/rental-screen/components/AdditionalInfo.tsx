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
  );
};
