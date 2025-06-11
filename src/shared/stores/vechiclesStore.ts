import { create } from "zustand";
import { ICar } from "../models/types/car";
import { vehicleApi } from "../api/routes/vehicles";
import { mechanicApi } from "../api/routes/mechanic";
import { UserRole } from "../models/types/user";

interface VehiclesStore {
  // User
  allVehicles: ICar[];
  frequentlyUsedVehicles: ICar[];
  // User
  pendingVehicles: ICar[];
  deliveryVehicles: ICar[];
  searchResults: ICar[];

  // Loading states
  isLoadingAll: boolean;
  isLoadingPending: boolean;
  isLoadingDelivery: boolean;
  isLoadingFrequent: boolean;
  isLoadingSearch: boolean;

  // Error states
  error: string | null;

  // Actions

  //User
  fetchAllVehicles: () => Promise<void>;
  fetchFrequentlyUsedVehicles: () => Promise<void>;
  //User
  fetchPendingVehicles: () => Promise<void>;
  fetchDeliveryVehicles: () => Promise<void>;
  searchVehiclesForUser: (query: string, userRole: UserRole) => Promise<void>;
  clearSearch: () => void;
  clearAll: () => void;
}

export const useVehiclesStore = create<VehiclesStore>((set, get) => ({
  // States
  allVehicles: [],
  pendingVehicles: [],
  deliveryVehicles: [],
  frequentlyUsedVehicles: [],
  searchResults: [],

  // Loading states
  isLoadingAll: false,
  isLoadingPending: false,
  isLoadingDelivery: false,
  isLoadingFrequent: false,
  isLoadingSearch: false,

  // Error state
  error: null,

  fetchAllVehicles: async () => {
    try {
      set({ isLoadingAll: true, error: null });
      const response = await vehicleApi.getVehicles();
      set({ allVehicles: response?.vehicles || [], isLoadingAll: false });
    } catch (error) {
      console.error("Failed to fetch all vehicles:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch all vehicles",
        isLoadingAll: false,
      });
    }
  },

  fetchPendingVehicles: async () => {
    try {
      set({ isLoadingPending: true, error: null });
      const response = await mechanicApi.getPendingVehicles();
      set({
        pendingVehicles: response?.vehicles || [],
        isLoadingPending: false,
      });
    } catch (error) {
      console.error("Failed to fetch pending vehicles:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch pending vehicles",
        isLoadingPending: false,
      });
    }
  },

  fetchDeliveryVehicles: async () => {
    try {
      set({ isLoadingDelivery: true, error: null });
      const response = await mechanicApi.getDeliveryVehicles();
      set({
        deliveryVehicles: response?.vehicles || [],
        isLoadingDelivery: false,
      });
    } catch (error) {
      console.error("Failed to fetch delivery vehicles:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch delivery vehicles",
        isLoadingDelivery: false,
      });
    }
  },

  fetchFrequentlyUsedVehicles: async () => {
    try {
      set({ isLoadingFrequent: true, error: null });
      const response = await vehicleApi.frequentlyUsedVehicles();
      set({
        frequentlyUsedVehicles: response?.vehicles || [],
        isLoadingFrequent: false,
      });
    } catch (error) {
      console.error("Failed to fetch frequently used vehicles:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch frequently used vehicles",
        isLoadingFrequent: false,
      });
    }
  },

  searchVehiclesForUser: async (query: string, userRole: UserRole) => {
    try {
      set({ isLoadingSearch: true, error: null });
      const response =
        userRole == UserRole.MECHANIC
          ? await mechanicApi.searchVehicles(query)
          : await vehicleApi.searchVehicles(query);
      set({ searchResults: response?.vehicles || [], isLoadingSearch: false });
    } catch (error) {
      console.error("Failed to search vehicles:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to search vehicles",
        isLoadingSearch: false,
      });
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  clearAll: () =>
    set({
      allVehicles: [],
      pendingVehicles: [],
      deliveryVehicles: [],
      frequentlyUsedVehicles: [],
      searchResults: [],
      error: null,
    }),

  updateVehicle: (id, updates) => {
    const state = get();
    const updateVehicleInArray = (vehicles: ICar[]) =>
      vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...updates } : vehicle
      );

    set({
      allVehicles: updateVehicleInArray(state.allVehicles),
      pendingVehicles: updateVehicleInArray(state.pendingVehicles),
      deliveryVehicles: updateVehicleInArray(state.deliveryVehicles),
      frequentlyUsedVehicles: updateVehicleInArray(
        state.frequentlyUsedVehicles
      ),
      searchResults: updateVehicleInArray(state.searchResults),
    });
  },

  getVehiclesByRole: (userRole: UserRole) => {
    const state = get();
    switch (userRole) {
      case UserRole.MECHANIC:
        return [...state.pendingVehicles, ...state.deliveryVehicles];
      default:
        return state.allVehicles;
    }
  },
}));
