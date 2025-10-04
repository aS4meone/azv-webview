"use client";
import React from "react";
import { ICar } from "@/shared/models/types/car";
import { CarCard } from "@/entities/car-card";
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

interface OccupiedCarsListProps {
  cars: ICar[];
  onCarClick?: (car: ICar) => void;
  onBackAction: () => void;
}

export const OccupiedCarsList = ({ cars, onCarClick, onBackAction }: OccupiedCarsListProps) => {
  const { t } = useClientTranslations();

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="py-4 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={onBackAction}
            className="mr-3 p-2 -ml-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{t('cars.occupiedCars', 'Занятые машины')}</h1>
        </div>
      </div>

      {/* Cars List */}
      <div className="py-4">
        {cars.length > 0 ? (
          <div className="space-y-4">
            {cars.map((car, index) => (
              <div key={`${car.id}-${index}`} className="bg-gray-50 rounded-lg p-4 cursor-not-allowed opacity-75">
                <div className="flex items-start space-x-4">
                {/* Car Photo - Only first photo */}
                <div className="flex-shrink-0">
                  {car.photos && car.photos.length > 0 ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                      <img
                        src={car.photos[0]}
                        alt={car.name}
                        className="!w-full !h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
                  
                  {/* Car Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{car.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t(`cars.statuses.${car.status}`, car.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">{car.plate_number}</p>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-4">{car.year} год</span>
                      <span className="mr-4">{car.body_type}</span>
                      {car.engine_volume > 0 && (
                        <span>{car.engine_volume}л</span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Занята</span>
                      </div>
                      
                      <div className="text-sm font-medium text-gray-900">
                        {car.price_per_minute} ₸/мин
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('cars.noOccupiedCars', 'Нет занятых машин')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('cars.noOccupiedCarsDescription', 'В данный момент все машины свободны')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
