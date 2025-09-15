import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { ResponseBottomModalProps } from "@/shared/ui/modal";
import { CustomResponseModal } from "@/components/ui/custom-response-modal";

interface MechanicCarIsFreeModalProps {
  car: ICar;
  onClose: () => void;
}

export const MechanicCarIsFreeModal = ({
  car,
  onClose,
}: MechanicCarIsFreeModalProps) => {
  const t = useTranslations();
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalProps | null>(null);

  const handleClose = () => {
    setResponseModal(null);
    onClose();
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 overflow-scroll">
      <CarImageCarousel car={car} rounded={true} />

      <CustomResponseModal
        isOpen={responseModal?.isOpen || false}
        onClose={responseModal?.onClose || (() => {})}
        title={responseModal?.title || ""}
        description={responseModal?.description || ""}
        buttonText={responseModal?.buttonText || ""}
        onButtonClick={responseModal?.onButtonClick || (() => {})}
      />

      {/* Content */}
      <div className="p-6 pt-4 space-y-6">
        {/* Car Title and Plate */}
        <CarInfoHeader car={car} />

        {/* Car Specs */}
        <CarSpecs car={car} />

        <div className=" text-[#191919]">{t("mechanic.vehicle.isFree")}</div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="secondary" onClick={handleClose}>
            {t("mechanic.vehicle.close")}
          </Button>
        </div>
      </div>
    </div>
  );
};
