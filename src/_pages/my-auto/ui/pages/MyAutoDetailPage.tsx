"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import { MyCar, CarTripsResponse, Trip } from "@/shared/models/types/my-auto";
import { myAutoApi } from "@/shared/api/routes/my-auto";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { TripDetailPage } from "./index";

interface MyAutoDetailPageProps {
  car: MyCar;
  onBackAction: () => void;
}

export const MyAutoDetailPage = ({ car, onBackAction }: MyAutoDetailPageProps) => {
  const t = useTranslations();
  const [tripsData, setTripsData] = useState<CarTripsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchTrips = async (month: number, year: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await myAutoApi.getCarTrips(car.id, month, year);
      const data: CarTripsResponse = response.data;
      setTripsData(data);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(currentMonth, currentYear);
  }, [car.id, currentMonth, currentYear]);

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleBack = () => {
    setSelectedTrip(null);
  };

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}${t("myAuto.timeUnits.hours")} ${remainingMinutes}${t("myAuto.timeUnits.minutes")}`;
    }
    return `${minutes}${t("myAuto.timeUnits.minutes")}`;
  };

  const formatRentalType = (type: string) => {
    return t(`myAuto.rentalTypes.${type as "minutes" | "hours" | "days"}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedTrip) {
    return (
      <CustomPushScreen
        direction="right"
        isOpen={true}
        onClose={handleBack}
      >
        <TripDetailPage 
          car={car} 
          trip={selectedTrip} 
          onBackAction={handleBack} 
        />
      </CustomPushScreen>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="icon"
              onClick={onBackAction}
              className="mr-3"
            >
              <ArrowLeftIcon />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {car.name}
              </h1>
              <p className="text-sm text-gray-600">
                {car.plate_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t("myAuto.carDetails.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("myAuto.carDetails.errorTitle")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("myAuto.carDetails.errorDescription")}
              </p>
              <Button onClick={() => fetchTrips(currentMonth, currentYear)} variant="primary">
                {t("myAuto.carDetails.retry")}
              </Button>
            </div>
          </div>
        ) : tripsData ? (
          <div className="space-y-6">
            {/* Monthly Earnings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {t("myAuto.carDetails.monthlyEarnings")}
              </h2>
              <div className="text-2xl font-bold text-green-600">
                {tripsData.month_earnings.total_earnings.toLocaleString()} ₸
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {tripsData.month_earnings.trip_count} {t("myAuto.carDetails.trips").toLowerCase()}
              </p>
            </div>

            {/* Month Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {new Date(currentYear, currentMonth - 1).toLocaleDateString("ru-RU", { 
                  month: "long", 
                  year: "numeric" 
                })}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tripsData.available_months.map((month) => (
                  <button
                    key={`${month.year}-${month.month}`}
                    onClick={() => handleMonthChange(month.month, month.year)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      month.month === currentMonth && month.year === currentYear
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {new Date(month.year, month.month - 1).toLocaleDateString("ru-RU", { 
                      month: "short", 
                      year: "2-digit" 
                    })}
                  </button>
                ))}
              </div>
            </div>

            {/* Trips List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t("myAuto.carDetails.trips")}
              </h3>
              {tripsData.trips.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {t("myAuto.carDetails.noTrips")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tripsData.trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleTripSelect(trip)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            {formatDate(trip.start_time)} - {formatDate(trip.end_time)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            {trip.earnings.toLocaleString()} ₸
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>{formatDuration(trip.duration_minutes)}</span>
                          <span>{formatRentalType(trip.rental_type)}</span>
                        </div>
                        <ArrowLeftIcon className="rotate-180 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};