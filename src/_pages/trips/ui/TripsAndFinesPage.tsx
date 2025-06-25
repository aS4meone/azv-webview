"use client";

import React, { useEffect, useState } from "react";
import { HistoryItem } from "./components/HistoryItem";
import { historyApi } from "@/shared/api/routes/history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";
import { IHistory } from "@/shared/models/types/history";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import RentalHistoryDetailPage from "./RentalHistoryDetailPage";

const TripsAndFinesPage = () => {
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
          <TabsTrigger value="trips">Поездки</TabsTrigger>
          <TabsTrigger value="fines">Штрафы</TabsTrigger>
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
            {trips.map((item, index) => (
              <HistoryItem
                key={index}
                setActivePush={setActivePush}
                date={item.date}
                amount={item.final_total_price}
                carModel={item.car_name}
                isFine={activeTab === "fines"}
                historyId={item.history_id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fines">
          <div></div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default TripsAndFinesPage;
