"use client";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import React, { useEffect, useState } from "react";
import { HistoryItem } from "./components/HistoryItem";
import { useTranslations } from "next-intl";
import { historyApi } from "@/shared/api/routes/history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";
import { IHistory } from "@/shared/models/types/history";

const TripsAndFinesPage = () => {
  const [activeTab] = useState<"trips" | "fines">("trips");
  const t = useTranslations();
  const [trips, setTrips] = useState<IHistory[]>([]);

  const fetchTrips = async () => {
    try {
      const response = await historyApi.getHistories();
      console.log(response.data.trip_history);
      setTrips(response.data.trip_history);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <article
      className="flex flex-col min-h-screen bg-white py-10 overflow-y-auto"
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
        overscrollBehaviorY: "auto",
      }}
    >
      <CustomAppBar backHref={ROUTES.MAIN} title={t("trips.title")} />
      <div className="px-4 mt-6 flex-1">
        <Tabs defaultValue="trips" className="w-full h-full">
          <TabsList className="mb-6">
            <TabsTrigger value="trips">Поездки</TabsTrigger>
            <TabsTrigger value="fines">Штрафы</TabsTrigger>
          </TabsList>

          <TabsContent value="trips" className="h-full">
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
      </div>
    </article>
  );
};

export default TripsAndFinesPage;
