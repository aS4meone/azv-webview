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
  userId?: number;
}

export const MyAutoDetailPage = ({ car, onBackAction, userId }: MyAutoDetailPageProps) => {
  const t = useTranslations();
  
  console.log('=== MyAutoDetailPage Props Debug ===');
  console.log('car:', car);
  console.log('userId prop:', userId, 'type:', typeof userId);
  console.log('====================================');
  const [tripsData, setTripsData] = useState<CarTripsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const fetchTrips = async (month: number, year: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await myAutoApi.getCarTrips(car.id, month, year);
      const data: CarTripsResponse = response.data;
      
      console.log('=== Trips Data Debug ===');
      console.log('Car ID:', car.id);
      console.log('User ID passed:', userId);
      console.log('Trips data:', data);
      console.log('Trips count:', data.trips.length);
      data.trips.forEach((trip, index) => {
        console.log(`Trip ${index + 1}:`, {
          id: trip.id,
          user_id: trip.user_id,
          start_time: trip.start_time,
          end_time: trip.end_time
        });
      });
      console.log('========================');
      
      setTripsData(data);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError(t("myAuto.carDetails.errorTitle"));
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

  const nextPhoto = () => {
    if (car.photos && car.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % car.photos.length);
    }
  };

  const prevPhoto = () => {
    if (car.photos && car.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + car.photos.length) % car.photos.length);
    }
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
    return date.toLocaleDateString(t("myAuto.locale.dateFormat"), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTripDate = (startTime: string, endTime: string) => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    // Check if trip spans multiple days
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    const isMultiDay = startDay !== endDay || startMonth !== endMonth || startYear !== endYear;
    
    if (isMultiDay) {
      // Show days if trip spans multiple days
      return {
        date: startDate.toLocaleDateString(t("myAuto.locale.dateFormat"), {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }),
        time: `${startDate.toLocaleTimeString(t("myAuto.locale.timeFormat"), {
          hour: "2-digit",
          minute: "2-digit"
        })} - ${endDate.toLocaleTimeString(t("myAuto.locale.timeFormat"), {
          hour: "2-digit",
          minute: "2-digit"
        })}`
      };
    } else {
      // Show only time if same day
      return {
        date: startDate.toLocaleDateString(t("myAuto.locale.dateFormat"), {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }),
        time: `${startDate.toLocaleTimeString(t("myAuto.locale.timeFormat"), {
          hour: "2-digit",
          minute: "2-digit"
        })} - ${endDate.toLocaleTimeString(t("myAuto.locale.timeFormat"), {
          hour: "2-digit",
          minute: "2-digit"
        })}`
      };
    }
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

  const firstPhoto = car.photos && car.photos.length > 0 ? car.photos[0] : null;
  const isAvailableMinutesGood = tripsData?.month_earnings ? 
    (tripsData.month_earnings.total_earnings >= 21600) : false;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E5E5E5]">
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
              <h1 className="text-xl font-semibold text-[#2D2D2D]">
                {car.name}
              </h1>
              <p className="text-sm text-[#666666]">
                {car.plate_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-[#666666]">{t("myAuto.carDetails.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">
                {t("myAuto.carDetails.errorTitle")}
              </h3>
              <p className="text-[#666666] mb-4">
                {t("myAuto.carDetails.errorDescription")}
              </p>
              <Button onClick={() => fetchTrips(currentMonth, currentYear)} variant="primary">
                {t("myAuto.carDetails.retry")}
              </Button>
            </div>
          </div>
        ) : tripsData ? (
          <div className="space-y-4">
            {/* Car Photos Slider */}
            {car.photos && car.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4">
                <div className="relative">
                  <div className="h-64 w-full overflow-hidden rounded-lg bg-gray-100 image-container flex items-center justify-center">
                    <img
                      src={`https://api.azvmotors.kz${car.photos[currentPhotoIndex]}`}
                      alt={car.name}
                      className="car-detail-image"
                    />
                  </div>
                  
                  {/* Navigation arrows */}
                  {car.photos.length > 1 && (
                    <>
                      <button 
                        onClick={prevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        onClick={nextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Photo indicators */}
                  {car.photos.length > 1 && (
                    <div className="flex justify-center mt-3 space-x-2">
                      {car.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentPhotoIndex ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Monthly Earnings */}
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
              <h2 className="text-lg font-medium text-[#2D2D2D] mb-4">
                {t("myAuto.carDetails.monthlyEarnings")}
              </h2>
              <div className="text-4xl font-bold text-black mb-2">
                {tripsData.month_earnings.total_earnings.toLocaleString()} ₸
              </div>
              <p className="text-lg text-[#666666]">
                {tripsData.month_earnings.trip_count} {t("myAuto.carDetails.trips").toLowerCase()}
              </p>
            </div>

            {/* Month Selector with Earnings and Minutes */}
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4">
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">
                {new Date(currentYear, currentMonth - 1).toLocaleDateString(t("myAuto.locale.dateFormat"), { 
                  month: "long", 
                  year: "numeric" 
                })}
              </h3>
              <div className="overflow-x-auto">
                <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
                  {tripsData.available_months.map((month) => {
                    const isCurrentMonth = month.month === currentMonth && month.year === currentYear;
                    const monthMinutes = month.available_minutes || 0;
                    const isMinutesGood = monthMinutes >= 21600;
                    
                    return (
                      <button
                        key={`${month.year}-${month.month}`}
                        onClick={() => handleMonthChange(month.month, month.year)}
                        className={`w-28 h-28 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                          isCurrentMonth
                            ? "bg-black text-white"
                            : "bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]"
                        }`}
                      >
                        <div className="text-center w-full h-full flex flex-col justify-center p-3">
                          <div className="font-bold text-sm mb-2 uppercase">
                            {new Date(month.year, month.month - 1).toLocaleDateString(t("myAuto.locale.dateFormat"), { 
                              month: "short", 
                              year: "2-digit" 
                            })}
                          </div>
                          <div className={`text-xs mb-2 ${
                            isCurrentMonth ? 'text-[#D4C4A8]' : 'text-[#888888]'
                          }`}>
                            {month.total_earnings.toLocaleString()} ₸
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                            isMinutesGood 
                              ? 'bg-[#2E7D32] text-white' 
                              : 'bg-[#D32F2F] text-white'
                          }`}>
                            {monthMinutes} {t("myAuto.timeUnits.minutes")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Trips List */}
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4">
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">
                {t("myAuto.carDetails.trips")}
              </h3>
              {tripsData.trips.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#666666]">
                    {t("myAuto.carDetails.noTrips")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tripsData.trips.map((trip) => {
                    const isOwnerTrip = trip.user_id === userId;
                    
                    // Debug logging
                    console.log('=== Trip Debug ===');
                    console.log('trip.user_id:', trip.user_id, 'type:', typeof trip.user_id);
                    console.log('userId:', userId, 'type:', typeof userId);
                    console.log('isOwnerTrip:', isOwnerTrip);
                    console.log('trip.id:', trip.id);
                    console.log('==================');
                    
                    const tripDateInfo = formatTripDate(trip.start_time, trip.end_time);
                    
                    return (
                      <div
                        key={trip.id}
                        className="border border-[#E5E5E5] rounded-lg p-4 cursor-pointer hover:bg-[#F5F5F5] transition-colors relative"
                        onClick={() => handleTripSelect(trip)}
                      >
                        {/* Owner Trip Indicator */}
                        {isOwnerTrip && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-l-lg"></div>
                        )}
                        
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isOwnerTrip && (
                                <div className="text-sm px-4 py-2 rounded-lg font-bold border-2 border-black bg-[#F5F5F5] text-black">
                                  {t("myAuto.yourTrip")}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-[#666666]">
                              <div className="font-medium">
                                {tripDateInfo.date}
                              </div>
                              <div className="text-xs">
                                {tripDateInfo.time}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-black">
                              {trip.earnings.toLocaleString()} ₸
                            </p>
                            {trip.fuel_cost !== null && trip.fuel_cost !== undefined && (
                              <p className="text-sm font-medium text-[#D32F2F] mt-1">
                                -{trip.fuel_cost.toLocaleString()} ₸
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4 text-sm text-[#666666]">
                            <span className="font-medium">{formatDuration(trip.duration_minutes)}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              trip.rental_type === 'minutes' ? 'bg-[#E3F2FD] text-[#1565C0]' :
                              trip.rental_type === 'hours' ? 'bg-[#E8F5E8] text-[#2E7D32]' :
                              'bg-[#F3E5F5] text-[#7B1FA2]'
                            }`}>
                              {formatRentalType(trip.rental_type)}
                            </span>
                          </div>
                          <ArrowLeftIcon className="rotate-180 text-[#888888]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};