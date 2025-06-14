import React from "react";

interface VehicleInfoCardProps {
  carDetails: {
    name: string;
    year: number;
    engine_volume: number;
  };
}

const CarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10H6l-2.5 1.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({
  carDetails,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
            <CarIcon />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Автомобиль</h2>
        </div>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm font-medium">Модель</span>
          <span className="text-gray-900 font-medium">{carDetails.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm font-medium">Год</span>
          <span className="text-gray-900 font-medium">{carDetails.year}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm font-medium">Двигатель</span>
          <span className="text-gray-900 font-medium">
            {carDetails.engine_volume}L
          </span>
        </div>
      </div>
    </div>
  );
};
