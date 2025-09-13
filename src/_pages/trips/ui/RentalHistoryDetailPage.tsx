"use client";

import React, { useEffect, useState } from "react";
import { historyApi } from "@/shared/api/routes/history";
import { IHistoryItem } from "@/shared/models/types/history";
import { VehicleInfoCard } from "./components/VehicleInfoCard";
import { TripInfoCard } from "./components/TripInfoCard";
import { LocationInfoCard } from "./components/LocationInfoCard";
import { PricingInfoCard } from "./components/PricingInfoCard";
import { FullScreenMapModal } from "./components/FullScreenMapModal";

const RentalHistoryDetailPage = ({ historyId }: { historyId: number }) => {
  const [historyDetail, setHistoryDetail] = useState<IHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionHistoryOpen, setIsActionHistoryOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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

  const formatActionType = (actionType: string) => {
    const actionTypes: { [key: string]: string } = {
      take_key: "Ключ забран",
      give_key: "Ключ выдан",
      close_vehicle: "Автомобиль закрыт",
      open_vehicle: "Автомобиль открыт",
    };
    return actionTypes[actionType] || actionType;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (error || !historyDetail) {
    return (
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
    );
  }

  const { rental_history_detail: detail } = historyDetail;

  return (
    <div className="space-y-6">
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

      {detail.action_history && detail.action_history.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => setIsActionHistoryOpen(!isActionHistoryOpen)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                История действий
              </h3>
              <p className="text-sm text-gray-500">
                {detail.action_history.length}{" "}
                {detail.action_history.length === 1 ? "действие" : "действий"}
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isActionHistoryOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isActionHistoryOpen && (
            <div className="border-t border-gray-200">
              <div className="p-4 space-y-3">
                {detail.action_history.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {formatActionType(action.action_type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTimestamp(action.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom spacing for better scroll experience */}
      <div className="h-8" />

      {/* Fixed Map Button */}
      {historyDetail?.rental_history_detail?.route_map?.route_data && (
        <button
          onClick={() => setIsMapModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-black hover:bg-black/90 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Full Screen Map Modal */}
      {historyDetail?.rental_history_detail?.route_map?.route_data && (
        <FullScreenMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          routeData={historyDetail.rental_history_detail.route_map.route_data}
          startLat={historyDetail.rental_history_detail.route_map.start_latitude}
          startLng={historyDetail.rental_history_detail.route_map.start_longitude}
          endLat={historyDetail.rental_history_detail.route_map.end_latitude}
          endLng={historyDetail.rental_history_detail.route_map.end_longitude}
          durationOver24h={historyDetail.rental_history_detail.route_map.duration_over_24h}
        />
      )}
    </div>
  );
};

export default RentalHistoryDetailPage;
