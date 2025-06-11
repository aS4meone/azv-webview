import { ICar } from "@/shared/models/types/car";
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui";
import React from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../modals/ui";
import { usePricingCalculator, RentalData } from "./hooks/usePricingCalculator";
import { RentalTabContent } from "./components";

interface RentalPageProps {
  car: ICar;
  onBack: () => void;
  onRent: (rentalData: RentalData) => void;
}

export const RentalPage = ({ car, onBack, onRent }: RentalPageProps) => {
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
    <article className="bg-white min-h-screen">
      {/* Header with car image */}
      <CarImageCarousel car={car} height="h-80" onBack={onBack} />

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Car Info */}
        <CarInfoHeader car={car} />

        {/* Car Specs */}
        <CarSpecs car={car} />

        {/* Rental Type Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="minutes">Минуты</TabsTrigger>
            <TabsTrigger value="hours">Часы</TabsTrigger>
            <TabsTrigger value="days">Дни</TabsTrigger>
          </TabsList>

          {/* Rental Details for each tab */}
          <TabsContent value="minutes" className="mt-6">
            <RentalTabContent
              rentalType="minutes"
              car={car}
              duration={duration}
              totalCost={calculateCost("minutes").totalCost}
              onIncrement={incrementDuration}
              onDecrement={decrementDuration}
              onDurationChange={setDurationDirect}
            />
          </TabsContent>

          <TabsContent value="hours" className="mt-6">
            <RentalTabContent
              rentalType="hours"
              car={car}
              duration={duration}
              totalCost={calculateCost("hours").totalCost}
              onIncrement={incrementDuration}
              onDecrement={decrementDuration}
              onDurationChange={setDurationDirect}
            />
          </TabsContent>

          <TabsContent value="days" className="mt-6">
            <RentalTabContent
              rentalType="days"
              car={car}
              duration={duration}
              totalCost={calculateCost("days").totalCost}
              onIncrement={incrementDuration}
              onDecrement={decrementDuration}
              onDurationChange={setDurationDirect}
            />
          </TabsContent>
        </Tabs>

        {/* Rent Button */}
        <div className="pt-4">
          <Button variant="secondary" onClick={handleRent}>
            Забронировать
          </Button>
        </div>
      </div>
    </article>
  );
};
