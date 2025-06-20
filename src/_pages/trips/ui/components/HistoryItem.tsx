import { useTranslations } from "next-intl";

import { formatDate } from "@/shared/utils/formate-date";

interface HistoryItemProps {
  date: string;
  amount: number;
  carModel: string;
  isFine?: boolean;
  setActivePush: (value: number) => void;
  historyId: number;
}

export const HistoryItem = ({
  date,
  amount,
  carModel,
  setActivePush,
  isFine = false,
  historyId,
}: HistoryItemProps) => {
  const t = useTranslations();

  const handleClick = () => {
    if (historyId && !isFine) {
      setActivePush(historyId);
    }
  };

  return (
    <>
      <div
        className={`flex justify-between items-center p-4 bg-[#F8F8F8] rounded-2xl ${
          historyId && !isFine
            ? "cursor-pointer active:scale-95 transition-all"
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
              <span className="text-[#191919] font-semibold">{carModel}</span>
              <span className="text-[#191919] ">{formatDate(date)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#191919]">{amount}</span>
          <span className="text-[#191919]">{t("trips.currency")}</span>
        </div>
      </div>
    </>
  );
};
