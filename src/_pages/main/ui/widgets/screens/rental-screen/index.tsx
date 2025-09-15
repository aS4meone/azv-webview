import { ICar } from "@/shared/models/types/car";
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui";
import React from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../../modals/ui";
import { usePricingCalculator, RentalData } from "./hooks/usePricingCalculator";
import { RentalTabContent } from "./components";
import { useTranslations } from "next-intl";

interface RentalPageProps {
  car: ICar;
  onRent: (rentalData: RentalData) => void;
  isDelivery: boolean;
  deliveryAddress?: string;
}

export const RentalPage = ({
  car,
  onRent,
  isDelivery,
  deliveryAddress,
}: RentalPageProps) => {
  const t = useTranslations();
  const {
    activeTab,
    duration,
    calculateCost,
    rentalConfig,
    handleTabChange,
    incrementDuration,
    decrementDuration,
    setDurationDirect,
    getRentalData,
  } = usePricingCalculator(car);

  const handleRent = () => {
    onRent(getRentalData());
  };

  return (
    <article className="bg-white h-screen overflow-y-auto overflow-x-hidden scrollable">
      {/* Header with car image */}
      <CarImageCarousel car={car} height="h-80" />

      <div className="px-4 py-6 space-y-6 pb-20">
        {/* Car Info */}
        <CarInfoHeader car={car} />

        {/* Car Specs */}
        <CarSpecs car={car} />

        {/* Delivery Address Info */}
        {isDelivery && deliveryAddress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              {t("widgets.screens.delivery.deliveryAddress")}:
            </h3>
            <p className="text-sm text-blue-700">{deliveryAddress}</p>
          </div>
        )}

        {/* Rental Type Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList variant="rounded">
            <TabsTrigger value="minutes">{t("widgets.screens.rental.minutes")}</TabsTrigger>
            <TabsTrigger value="hours">{t("widgets.screens.rental.hours")}</TabsTrigger>
            <TabsTrigger value="days">{t("widgets.screens.rental.days")}</TabsTrigger>
          </TabsList>

          {(["minutes", "hours", "days"] as const).map((rentalType) => (
            <TabsContent key={rentalType} value={rentalType} className="mt-6">
              <RentalTabContent
                rentalType={rentalType}
                car={car}
                duration={duration}
                totalCost={calculateCost(rentalType).totalCost}
                costCalculation={calculateCost(rentalType)}
                config={rentalConfig[rentalType]}
                onIncrement={incrementDuration}
                onDecrement={decrementDuration}
                onDurationChange={setDurationDirect}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Rent Button */}
        <div className="pt-4">
          <Button
            variant="secondary"
            onClick={() => {
              console.log("handleRent");
              handleRent();
            }}
            className="w-full"
            disabled={duration <= 0}
          >
            {isDelivery ? t("widgets.screens.rental.orderDelivery") : t("widgets.screens.rental.book")}
          </Button>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
          <span className="font-medium">{t("widgets.screens.rental.attention")}</span> {t("widgets.screens.rental.waitingFee")}
        </div>
      </div>
    </article>
  );
};
