"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import { MyCarsResponse, MyCar } from "@/shared/models/types/my-auto";
import { myAutoApi } from "@/shared/api/routes/my-auto";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { MyAutoDetailPage } from "./index";

export const MyAutoPage = () => {
  const t = useTranslations();
  const [cars, setCars] = useState<MyCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<MyCar | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await myAutoApi.getMyCars();
      const data: MyCarsResponse = response.data;
      setCars(data.cars);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleCarSelect = (car: MyCar) => {
    setSelectedCar(car);
  };

  const handleBack = () => {
    setSelectedCar(null);
  };

  if (selectedCar) {
    return (
      <CustomPushScreen
        direction="right"
        isOpen={true}
        onClose={handleBack}
      >
        <MyAutoDetailPage car={selectedCar} onBackAction={handleBack} />
      </CustomPushScreen>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {t("myAuto.title")}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t("myAuto.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("myAuto.errorTitle")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("myAuto.errorDescription")}
              </p>
              <Button onClick={fetchCars} variant="primary">
                {t("myAuto.retry")}
              </Button>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("myAuto.noCars")}
              </h3>
              <p className="text-gray-600">
                {t("myAuto.noCarsDescription")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCarSelect(car)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {car.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {car.plate_number}
                    </p>
                  </div>
                  <ArrowLeftIcon className="rotate-180 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
