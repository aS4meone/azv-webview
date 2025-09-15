"use client";

import React, { useEffect, useState } from "react";
import { HistoryItem } from "./components/HistoryItem";
import { historyApi } from "@/shared/api/routes/history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";
import { IHistory } from "@/shared/models/types/history";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import RentalHistoryDetailPage from "./RentalHistoryDetailPage";
import { useTranslations } from "next-intl";

const TripsAndFinesPage = () => {
  const t = useTranslations();
  const [activeTab] = useState<"trips" | "fines">("trips");
  const [trips, setTrips] = useState<IHistory[]>([]);
  const [activePush, setActivePush] = useState<number | null>(null);
  const fetchTrips = async () => {
    try {
      const response = await historyApi.getHistories();

      setTrips(response.data.trip_history);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <>
      <CustomPushScreen
        direction="bottom"
        isOpen={!!activePush}
        onClose={() => setActivePush(null)}
        height="auto"
        className="pt-20"
      >
        <RentalHistoryDetailPage historyId={activePush ?? 0} />
      </CustomPushScreen>
      <Tabs defaultValue="trips" className="w-full h-full overflow-y-auto">
        <TabsList className="mb-6">
          <TabsTrigger value="trips">{t("trips.tabs.trips")}</TabsTrigger>
          <TabsTrigger value="fines">{t("trips.tabs.fines")}</TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          <div
            className="flex flex-col gap-4 max-h-[calc(100vh-200px)] pb-[100px] overflow-y-auto"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              overscrollBehaviorY: "auto",
            }}
          >
            {trips.length > 0 ? (
              trips.map((item, index) => (
                <HistoryItem
                  key={index}
                  setActivePush={setActivePush}
                  date={item.date}
                  amount={item.final_total_price}
                  carModel={item.car_name}
                  isFine={activeTab === "fines"}
                  historyId={item.history_id}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("trips.noTrips.title")}</h3>
                <p className="text-gray-500">{t("trips.noTrips.description")}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fines">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t("trips.noFines.title")}</h3>
            <p className="text-gray-500">{t("trips.noFines.description")}</p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default TripsAndFinesPage;
