import { useTranslations } from "next-intl";
import React from "react";

interface HistoryItemProps {
  date: string;
  amount: number;
  carModel: string;
  isFine?: boolean;
}

export const HistoryItem = ({
  date,
  amount,
  carModel,
  isFine = false,
}: HistoryItemProps) => {
  const t = useTranslations();

  return (
    <div className="flex justify-between items-center p-4 bg-[#F8F8F8] rounded-2xl">
      <div className="flex flex-col gap-1">
        {isFine ? (
          <>
            <span className="text-[#FF3B30]">{t("trips.fine")}</span>
            <span className="text-[#191919]">{date}</span>
          </>
        ) : (
          <>
            <span className="text-[#191919]">{date}</span>
            <span className="text-[#191919]">{carModel}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[#191919]">{amount}</span>
        <span className="text-[#191919]">{t("trips.currency")}</span>
      </div>
    </div>
  );
};
