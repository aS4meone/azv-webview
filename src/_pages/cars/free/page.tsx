"use client";
import React, { useEffect, useState } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { webviewDebugger } from "@/shared/utils/webview-debug";
import { CarTypeSelection } from "./ui/CarTypeSelection";
import { FilteredCarsList } from "./ui/FilteredCarsList";
import { ICar } from "@/shared/models/types/car";
import { CarBodyType, CarStatus } from "@/shared/models/types/car";
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
    if (selectedBodyType === CarBodyType.OCCUPIED) {
      // Показываем все занятые машины
      const occupiedCars = allVehicles.filter(car => car.status !== CarStatus.free);
      
      // Отладочная информация
      console.log('=== Occupied Cars Debug ===');
      console.log('All vehicles count:', allVehicles.length);
      console.log('Occupied cars count:', occupiedCars.length);
      console.log('Selected body type:', selectedBodyType);
      console.log('All vehicle statuses:', allVehicles.map(car => ({ id: car.id, name: car.name, status: car.status })));
      console.log('========================');
      
      return occupiedCars;
    }
    
    // Показываем ВСЕ машины (не только свободные)
    if (selectedBodyType === CarBodyType.ELECTRIC) {
      // Показываем все электромобили (engine_volume === 0.0 или body_type === 'ELECTRIC')
      const electricCars = allVehicles.filter(car => 
        car.engine_volume === 0.0 || 
        car.body_type === 'ELECTRIC' ||
        car.body_type === CarBodyType.ELECTRIC
      );
      
      // Отладочная информация
      console.log('=== Electric Cars Debug ===');
      console.log('All vehicles count:', allVehicles.length);
      console.log('Electric cars count:', electricCars.length);
      console.log('Selected body type:', selectedBodyType);
      allVehicles.forEach((car, index) => {
        if (car.engine_volume === 0.0 || car.body_type === 'ELECTRIC' || car.body_type === CarBodyType.ELECTRIC) {
          console.log(`Electric car ${index}:`, {
            id: car.id,
            name: car.name,
            engine_volume: car.engine_volume,
            body_type: car.body_type
          });
        }
      });
      console.log('========================');
      
      return electricCars;
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
