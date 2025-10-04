"use client";
import React from "react";
import { OccupiedCarsList } from "./ui/OccupiedCarsList";
import { getAllOccupiedCars } from "@/shared/data/mockData";

const OccupiedCarsPage = ({ onClose }: { onClose: () => void }) => {
  const occupiedCars = getAllOccupiedCars();

  return (
    <div className="bg-white h-full">
      <OccupiedCarsList
        cars={occupiedCars}
        onCarClick={onClose}
        onBackAction={onClose}
      />
    </div>
  );
};

export default OccupiedCarsPage;
