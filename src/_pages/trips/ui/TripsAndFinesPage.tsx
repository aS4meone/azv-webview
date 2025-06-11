"use client";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import React, { useEffect, useState } from "react";
import { HistoryItem } from "./components/HistoryItem";
import { useTranslations } from "next-intl";
import { historyApi } from "@/shared/api/routes/history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";

const MOCK_TRIPS = [
  {
    date: "29 января 2024, 16:07",
    amount: 25000,
    carModel: "MB CLA 45S",
  },
  {
    date: "29 января 2024, 16:07",
    amount: 25000,
    carModel: "MB CLA 45S",
  },
  {
    date: "29 января 2024, 16:07",
    amount: 25000,
    carModel: "MB CLA 45S",
  },
];

const MOCK_FINES = [
  // {
  //   date: "29 января 2024",
  //   amount: 25000,
  //   carModel: "MB CLA 45S",
  // },
  // {
  //   date: "29 января 2024",
  //   amount: 25000,
  //   carModel: "MB CLA 45S",
  // },
  // {
  //   date: "29 января 2024",
  //   amount: 25000,
  //   carModel: "MB CLA 45S",
  // },
];

const TripsAndFinesPage = () => {
  const [activeTab] = useState<"trips" | "fines">("trips");
  const t = useTranslations();
  const [, setTrips] = useState(MOCK_TRIPS);

  useEffect(() => {
    const fetchTrips = async () => {
      const response = await historyApi.getHistories();
      setTrips(response.data);
    };
    fetchTrips();
  }, []);

  return (
    <article className="flex flex-col min-h-screen bg-white pt-10">
      <CustomAppBar backHref={ROUTES.MAIN} title={t("trips.title")} />
      <div className="px-4 mt-6">
        <Tabs defaultValue="trips" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="fines">Fines</TabsTrigger>
          </TabsList>

          <TabsContent value="trips" className="flex flex-col gap-4">
            {MOCK_TRIPS.map((item, index) => (
              <HistoryItem
                key={index}
                date={item.date}
                amount={item.amount}
                carModel={item.carModel}
                isFine={activeTab === "fines"}
              />
            ))}
          </TabsContent>

          <TabsContent value="fines">
            {MOCK_FINES.map((item, index) => (
              <HistoryItem
                key={index}
                date={item.date}
                amount={item.amount}
                carModel={item.carModel}
                isFine={activeTab === "fines"}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </article>
  );
};

export default TripsAndFinesPage;
