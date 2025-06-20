"use client";

import { FAQContent } from "./content/FAQContent";
import { AboutContent } from "./content/AboutContent";
import { OfferContent } from "./content/OfferContent";
import { PersonalDataContent } from "./content/PersonalDataContent";
import { PaymentContent } from "./content/PaymentContent";
import { UserAgreementContent } from "./content/UserAgreementContent";
import { TariffContent } from "./content/TariffContent";
import { RentalType } from "@/shared/models/dto/rent.dto";
import { ICar } from "@/shared/models/types/car";

interface TermsContentProps {
  contentKey: string;
  rentalType?: RentalType;
  car?: ICar;
}

export const TermsContent = ({
  contentKey,
  rentalType,
  car,
}: TermsContentProps) => {
  const renderContent = () => {
    switch (contentKey) {
      case "faqs":
        return <FAQContent />;
      case "about":
        return <AboutContent />;
      case "offer":
        return <OfferContent />;
      case "personal":
        return <PersonalDataContent />;
      case "payment":
        return <PaymentContent />;
      case "agreement":
        return <UserAgreementContent />;
      case "tariff":
        return (
          <TariffContent rentalType={rentalType || "minutes"} car={car!} />
        );
      default:
        return <div>Content not found</div>;
    }
  };

  return <div className="pt-12">{renderContent()}</div>;
};
