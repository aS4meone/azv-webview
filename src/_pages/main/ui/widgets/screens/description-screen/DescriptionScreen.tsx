import { ICar } from "@/shared/models/types/car";
import React from "react";
import PushScreen from "@/shared/ui/push-screen";
import { Button } from "@/shared/ui";
import { useTranslations } from "next-intl";

interface DescriptionScreenProps {
  car: ICar;
  onClose: () => void;
}

export const DescriptionScreen = ({ car, onClose }: DescriptionScreenProps) => {
  const t = useTranslations();
  
  return (
    <PushScreen onClose={onClose} withCloseButton={true}>
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("widgets.screens.description.carDescription")}
          </h1>
          <p className="text-gray-600">{t("widgets.screens.description.carInfo")} {car.name}</p>
        </div>

        {car.description && (
          <div className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">
            <p>{car.description}</p>
          </div>
        )}

        <Button variant="secondary" onClick={onClose} className="w-full">
          {t("widgets.screens.description.backToMap")}
        </Button>
      </div>
    </PushScreen>
  );
};
