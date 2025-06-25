"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { IDeliveryCoordinates } from "../models/types/car";

interface DeliveryPointContextType {
  deliveryPoint: IDeliveryCoordinates | null;
  setDeliveryPoint: (point: IDeliveryCoordinates | null) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const DeliveryPointContext = createContext<
  DeliveryPointContextType | undefined
>(undefined);

export const DeliveryPointProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [deliveryPoint, setDeliveryPoint] =
    useState<IDeliveryCoordinates | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleUpdateDeliveryPoint = (
      event: CustomEvent<{
        coordinates: IDeliveryCoordinates | null;
        visible: boolean;
      }>
    ) => {
      setDeliveryPoint(event.detail.coordinates);
      setIsVisible(event.detail.visible);
    };

    // Приводим тип события к CustomEvent
    window.addEventListener(
      "updateDeliveryPoint",
      handleUpdateDeliveryPoint as EventListener
    );

    return () => {
      window.removeEventListener(
        "updateDeliveryPoint",
        handleUpdateDeliveryPoint as EventListener
      );
    };
  }, []);

  return (
    <DeliveryPointContext.Provider
      value={{
        deliveryPoint,
        setDeliveryPoint,
        isVisible,
        setIsVisible,
      }}
    >
      {children}
    </DeliveryPointContext.Provider>
  );
};

export const useDeliveryPoint = () => {
  const context = useContext(DeliveryPointContext);
  if (context === undefined) {
    throw new Error(
      "useDeliveryPoint must be used within a DeliveryPointProvider"
    );
  }
  return context;
};
