"use client";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import React, { useEffect, useState } from "react";
import { historyApi } from "@/shared/api/routes/history";
import { IHistoryItem } from "@/shared/models/types/history";
import { useParams } from "next/navigation";
import { VehicleInfoCard } from "./components/VehicleInfoCard";
import { TripInfoCard } from "./components/TripInfoCard";
import { LocationInfoCard } from "./components/LocationInfoCard";
import { PricingInfoCard } from "./components/PricingInfoCard";

const RentalHistoryDetailPage = () => {
  const [historyDetail, setHistoryDetail] = useState<IHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const historyId = params?.id ? parseInt(params.id as string) : 0;

  useEffect(() => {
    const fetchHistoryDetail = async () => {
      try {
        setLoading(true);
        const response = await historyApi.getHistoryOfRent(historyId);
        setHistoryDetail(response.data);
      } catch (err) {
        setError("Не удалось загрузить детали истории аренды");
        console.error("Error fetching history detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (historyId) {
      fetchHistoryDetail();
    }
  }, [historyId]);

  if (loading) {
    return (
      <article className="flex flex-col h-screen">
        <div className="bg-white pt-10">
          <CustomAppBar backHref={ROUTES.TRIPS} title="Детали поездки" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
        </div>
      </article>
    );
  }

  if (error || !historyDetail) {
    return (
      <article className="flex flex-col h-screen">
        <div className="bg-white pt-10">
          <CustomAppBar backHref={ROUTES.TRIPS} title="Детали поездки" />
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">
              {error || "Детали поездки не найдены"}
            </p>
          </div>
        </div>
      </article>
    );
  }

  const { rental_history_detail: detail } = historyDetail;

  return (
    <article className="flex flex-col h-screen bg-white">
      <div className="pt-10">
        <CustomAppBar backHref={ROUTES.TRIPS} title="Детали поездки" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
          {/* Vehicle Information */}
          <VehicleInfoCard carDetails={detail.car_details} />

          {/* Trip Information */}
          <TripInfoCard
            rentalType={detail.rental_type}
            reservationTime={detail.reservation_time}
            startTime={detail.start_time}
            endTime={detail.end_time}
            duration={detail.duration || undefined}
          />

          {/* Location */}
          <LocationInfoCard
            startLatitude={detail.start_latitude}
            startLongitude={detail.start_longitude}
            endLatitude={detail.end_latitude}
            endLongitude={detail.end_longitude}
          />

          {/* Pricing */}
          <PricingInfoCard
            basePrice={detail.base_price}
            openFee={detail.open_fee}
            deliveryFee={detail.delivery_fee}
            waitingFee={detail.waiting_fee}
            overtimeFee={detail.overtime_fee}
            distanceFee={detail.distance_fee}
            totalPrice={detail.total_price}
            alreadyPayed={detail.already_payed}
          />

          {/* Bottom spacing for better scroll experience */}
          <div className="h-8" />
        </div>
      </div>
    </article>
  );
};

export default RentalHistoryDetailPage;
