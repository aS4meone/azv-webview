import { ArrowRightIcon } from "@/shared/icons";
import { RentalType } from "@/shared/models/dto/rent.dto";
import { Button } from "@/shared/ui";
import { ViewPdfTrigger } from "@/widgets/pdf-viewer";
import React from "react";

interface AdditionalInfoProps {
  rentalType: RentalType;
}

export const AdditionalInfo = ({ rentalType }: AdditionalInfoProps) => {
  const returnTarrif = () => {
    switch (rentalType) {
      case "days":
        return "/docs/about_day.pdf";
      case "hours":
        return "/docs/about_hour.pdf";
      case "minutes":
        return "/docs/about_minute.pdf";

      default:
        return "/docs/about_minute.pdf";
    }
  };

  return (
    <div className="space-y-3 pt-2 flex flex-col items-start">
      <ViewPdfTrigger url={returnTarrif()}>
        <Button
          asChild
          variant="outline"
          className="flex items-center rounded-[10px] w-auto text-[14px] px-2 py-1 h-auto"
        >
          <span>О тарифе</span>
          <ArrowRightIcon />
        </Button>
      </ViewPdfTrigger>

      <ViewPdfTrigger url="/docs/user_agreement.pdf" className="w-full">
        <Button
          asChild
          className="rounded-none items-center flex justify-between w-full"
        >
          <span className="text-[#191919] font-medium">Договор аренды</span>
          <ArrowRightIcon />
        </Button>
      </ViewPdfTrigger>
    </div>
  );
};
