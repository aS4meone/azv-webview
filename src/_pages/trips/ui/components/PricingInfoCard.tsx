import React from "react";
import { useTranslations } from "next-intl";

interface PricingInfoCardProps {
  basePrice: number;
  openFee: number;
  deliveryFee: number;
  waitingFee: number;
  overtimeFee: number;
  distanceFee: number;
  totalPrice: number;
  alreadyPayed: number;
}

const DollarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const PricingInfoCard: React.FC<PricingInfoCardProps> = ({
  basePrice,
  openFee,
  deliveryFee,
  waitingFee,
  overtimeFee,
  distanceFee,
  totalPrice,
  alreadyPayed,
}) => {
  const t = useTranslations();
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ${t("trips.currency")}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
            <DollarIcon />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t("trips.pricing.title")}</h2>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-3 mb-4">
          {basePrice > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{t("trips.pricing.basePrice")}</span>
              <span className="text-gray-900 font-medium">
                {formatPrice(basePrice)}
              </span>
            </div>
          )}
          {openFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{t("trips.pricing.openFee")}</span>
              <span className="text-gray-900 font-medium">
                {formatPrice(openFee)}
              </span>
            </div>
          )}
          {deliveryFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{t("trips.pricing.deliveryFee")}</span>
              <span className="text-gray-900 font-medium">
                {formatPrice(deliveryFee)}
              </span>
            </div>
          )}
          {waitingFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{t("trips.pricing.waitingFee")}</span>
              <span className="text-gray-900 font-medium">
                {formatPrice(waitingFee)}
              </span>
            </div>
          )}
          {overtimeFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{t("trips.pricing.overtimeFee")}</span>
              <span className="text-gray-900 font-medium">
                {formatPrice(overtimeFee)}
              </span>
            </div>
          )}
          {distanceFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{t("trips.pricing.distanceFee")}</span>
              <span className="text-gray-900 font-medium">
                {formatPrice(distanceFee)}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-semibold text-lg">{t("trips.pricing.total")}</span>
            <span className="text-gray-900 font-bold text-xl">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">{t("trips.pricing.paid")}</span>
            <span className="text-black font-semibold">
              {formatPrice(alreadyPayed)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
