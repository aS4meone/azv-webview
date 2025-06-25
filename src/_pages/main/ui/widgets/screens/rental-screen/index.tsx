import { ICar } from "@/shared/models/types/car";
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui";
import React from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../../modals/ui";
import { usePricingCalculator, RentalData } from "./hooks/usePricingCalculator";
import { RentalTabContent } from "./components";

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
  const {
    activeTab,
    duration,
    calculateCost,
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
    <article
      className="bg-white h-screen overflow-y-auto overflow-x-hidden scrollable"
      data-scrollable="true"
    >
      {/* Header with car image */}
      <CarImageCarousel car={car} height="h-80" />

      {/* Content - добавляем больше контента чтобы был скролл */}
      <div className="px-4 py-6 space-y-6 pb-20">
        {/* Car Info */}
        <CarInfoHeader car={car} />

        {/* Car Specs */}
        <CarSpecs car={car} />

        {/* Delivery Address Info */}
        {isDelivery && deliveryAddress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Адрес доставки:
            </h3>
            <p className="text-sm text-blue-700">{deliveryAddress}</p>
          </div>
        )}

        {/* Rental Type Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList variant="rounded">
            <TabsTrigger value="minutes">Минуты</TabsTrigger>
            <TabsTrigger value="hours">Часы</TabsTrigger>
            <TabsTrigger value="days">Дни</TabsTrigger>
          </TabsList>

          {(["minutes", "hours", "days"] as const).map((rentalType) => (
            <TabsContent key={rentalType} value={rentalType} className="mt-6">
              <RentalTabContent
                rentalType={rentalType}
                car={car}
                duration={duration}
                totalCost={calculateCost(rentalType).totalCost}
                costCalculation={calculateCost(rentalType)}
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
            onClick={handleRent}
            className="w-full"
            disabled={duration <= 0}
          >
            {isDelivery ? "Заказать доставку" : "Забронировать"}
          </Button>
        </div>
      </div>
    </article>
  );
};
