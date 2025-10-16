import React, { useState, useEffect } from "react";
import { getAddressFromCoordinates } from "@/shared/utils/googleMaps";
import { useTranslations } from "next-intl";

interface LocationInfoCardProps {
  startLatitude: number | null;
  startLongitude: number | null;
  endLatitude: number | null;
  endLongitude: number | null;
}

const MapPinIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const LocationInfoCard: React.FC<LocationInfoCardProps> = ({
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude,
}) => {
  const t = useTranslations();
  const [startAddress, setStartAddress] = useState<string>("");
  const [endAddress, setEndAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const [startAddr, endAddr] = await Promise.all([
          getAddressFromCoordinates(startLatitude, startLongitude),
          getAddressFromCoordinates(endLatitude, endLongitude),
        ]);

        setStartAddress(startAddr);
        setEndAddress(endAddr);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        // Проверяем на null/undefined перед вызовом toFixed
        const startCoords = startLatitude !== null && startLongitude !== null
          ? `${startLatitude.toFixed(6)}, ${startLongitude.toFixed(6)}`
          : "Координаты недоступны";
        const endCoords = endLatitude !== null && endLongitude !== null
          ? `${endLatitude.toFixed(6)}, ${endLongitude.toFixed(6)}`
          : "Координаты недоступны";
        
        setStartAddress(startCoords);
        setEndAddress(endCoords);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [startLatitude, startLongitude, endLatitude, endLongitude]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
            <MapPinIcon />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("myAuto.tripDetails.location.title")}
          </h2>
        </div>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div>
          <span className="text-gray-500 text-sm font-medium block mb-2">
            {t("myAuto.tripDetails.location.startLocation")}
          </span>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
          ) : (
            <span className="text-gray-900 text-sm">{startAddress}</span>
          )}
        </div>
        <div className=" border-gray-200">
          <span className="text-gray-500 text-sm font-medium block mb-2">
            {t("myAuto.tripDetails.location.endLocation")}
          </span>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
          ) : (
            <span className="text-gray-900 text-sm">{endAddress}</span>
          )}
        </div>
      </div>
    </div>
  );
};
