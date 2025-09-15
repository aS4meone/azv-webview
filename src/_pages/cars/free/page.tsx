"use client";
import React, { useEffect, useState } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { webviewDebugger } from "@/shared/utils/webview-debug";
import { CarTypeSelection } from "./ui/CarTypeSelection";
import { FilteredCarsList } from "./ui/FilteredCarsList";
import { ICar } from "@/shared/models/types/car";
import { CarBodyType } from "@/shared/models/types/car";
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

type ViewState = 'type-selection' | 'filtered-cars';

const FreeCarsPage = ({ onClose }: { onClose: () => void }) => {
  const { fetchAllVehicles, allVehicles, isLoadingAll } = useVehiclesStore();
  const { t } = useClientTranslations();
  const [currentView, setCurrentView] = useState<ViewState>('type-selection');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');

  useEffect(() => {
    webviewDebugger.logRequest("FreeCarsPage", "fetchAllVehicles");
    fetchAllVehicles();
  }, [fetchAllVehicles]);

  const handleTypeSelectAction = (bodyType: string) => {
    setSelectedBodyType(bodyType);
    setCurrentView('filtered-cars');
  };

  const handleBackToTypesAction = () => {
    setCurrentView('type-selection');
    setSelectedBodyType('');
  };

  const getFilteredCars = (): ICar[] => {
    if (selectedBodyType === CarBodyType.ELECTRIC) {
      // Показываем все электромобили (engine_volume === 0.0)
      return allVehicles.filter(car => car.engine_volume === 0.0);
    } else {
      // Показываем машины по типу кузова
      return allVehicles.filter(car => car.body_type === selectedBodyType);
    }
  };

  if (isLoadingAll) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center py-4 text-[#191919] text-[16px]">
          {t('cars.loading')}
        </div>
      </div>
    );
  }

  if (allVehicles.length === 0) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center py-4 text-[#191919] text-[16px]">
          {t('cars.nothingFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full">
      {currentView === 'type-selection' ? (
        <CarTypeSelection
          cars={allVehicles}
          onTypeSelectAction={handleTypeSelectAction}
          onBackAction={onClose}
        />
      ) : (
        <FilteredCarsList
          cars={getFilteredCars()}
          selectedBodyType={selectedBodyType}
          onCarClickAction={onClose}
          onBackAction={handleBackToTypesAction}
        />
      )}
    </div>
  );
};

export default FreeCarsPage;
