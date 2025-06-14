import { useTranslations } from "next-intl";
import React from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { formatDate } from "@/shared/utils/formate-date";

interface HistoryItemProps {
  date: string;
  amount: number;
  carModel: string;
  isFine?: boolean;
  historyId?: number;
}

export const HistoryItem = ({
  date,
  amount,
  carModel,
  isFine = false,
  historyId,
}: HistoryItemProps) => {
  const t = useTranslations();
  const router = useRouter();

  const handleClick = () => {
    if (historyId && !isFine) {
      router.push(`${ROUTES.TRIPS}/${historyId}`);
    }
  };

  return (
    <div
      className={`flex justify-between items-center p-4 bg-[#F8F8F8] rounded-2xl ${
        historyId && !isFine
          ? "cursor-pointer hover:bg-gray-200 active:bg-gray-300 transition-colors"
          : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-col gap-1">
        {isFine ? (
          <>
            <span className="text-[#FF3B30]">{t("trips.fine")}</span>
            <span className="text-[#191919]">{formatDate(date)}</span>
          </>
        ) : (
          <>
            <span className="text-[#191919]">{formatDate(date)}</span>
            <span className="text-[#191919]">{carModel}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[#191919]">{amount}</span>
        <span className="text-[#191919]">{t("trips.currency")}</span>
        {historyId && !isFine && <span className="text-gray-400 ml-2">›</span>}
      </div>
    </div>
  );
};
