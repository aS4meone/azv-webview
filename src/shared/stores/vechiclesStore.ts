import { create } from "zustand";
import { CarStatus, ICar } from "../models/types/car";
import { vehicleApi } from "../api/routes/vehicles";
import { mechanicApi } from "../api/routes/mechanic";
import { UserRole } from "../models/types/user";

interface VehiclesStore {
  // User
  allVehicles: ICar[];
  frequentlyUsedVehicles: ICar[];
  // Mechanic
  pendingVehicles: ICar[];
  deliveryVehicles: ICar[];
  inUseVehicles: ICar[];
  allMechanicVehicles: ICar[];
  searchResults: ICar[];
  currentDeliveryVehicle: ICar;

  // Loading states
  isCurrentDeliveryVehicle: boolean;
  isLoadingAll: boolean;
  isLoadingPending: boolean;
  isLoadingDelivery: boolean;
  isLoadingFrequent: boolean;
  isLoadingInUse: boolean;
  isLoadingAllMechanic: boolean;
  isLoadingSearch: boolean;

  // Error states
  error: string | null;

  // Actions

  //User
  fetchAllVehicles: () => Promise<void>;
  fetchFrequentlyUsedVehicles: () => Promise<void>;
  //Mechanic
  fetchCurrentDeliveryVehicle: () => Promise<void>;
  fetchPendingVehicles: () => Promise<void>;
  fetchDeliveryVehicles: () => Promise<void>;
  fetchInUseVehicles: () => Promise<void>;
  fetchAllMechanicVehicles: () => Promise<void>;

  searchVehiclesForUser: (query: string, userRole: UserRole) => Promise<void>;
  clearSearch: () => void;
  clearAll: () => void;
  updateVehicle: (id: number, updates: Partial<ICar>) => void;
  getVehiclesByRole: (userRole: UserRole) => ICar[];
}

export const useVehiclesStore = create<VehiclesStore>((set, get) => ({
  // States
  allVehicles: [],
  frequentlyUsedVehicles: [],
  //Mechanic
  pendingVehicles: [],
  deliveryVehicles: [],
  inUseVehicles: [],
  allMechanicVehicles: [],
  currentDeliveryVehicle: {
    id: 0,
    name: "",
    plate_number: "",
    latitude: 0,
    longitude: 0,
    course: 0,
    fuel_level: 0,
    price_per_minute: 0,
    price_per_hour: 0,
    price_per_day: 0,
    engine_volume: 0,
    year: 0,
    drive_type: 0,
    photos: [],
    owner_id: 0,
    current_renter_id: null,
    status: CarStatus.free,
    open_price: 0,
    owned_car: false,
    rental_id: 0,
  },

  searchResults: [],

  // Loading states
  isCurrentDeliveryVehicle: false,
  isLoadingAll: false,
  isLoadingPending: false,
  isLoadingDelivery: false,
  isLoadingFrequent: false,
  isLoadingInUse: false,
  isLoadingAllMechanic: false,
  isLoadingSearch: false,

  // Error state
  error: null,

  fetchCurrentDeliveryVehicle: async () => {
    try {
      set({ isCurrentDeliveryVehicle: true, error: null });
      const response = await mechanicApi.getCurrentDelivery();

      // Если есть данные и это не пустой объект
      if (response.data && Object.keys(response.data).length > 0) {
        const car: ICar = {
          ...response.data,
          name: response.data.car_name,
          id: response.data.car_id,
        };
        set({
          currentDeliveryVehicle: car,
          isCurrentDeliveryVehicle: false,
        });
      } else {
        // Если нет текущей доставки, устанавливаем пустой объект с id: 0
        set({
          currentDeliveryVehicle: {
            id: 0,
            name: "",
            plate_number: "",
            latitude: 0,
            longitude: 0,
            course: 0,
            fuel_level: 0,
            price_per_minute: 0,
            price_per_hour: 0,
            price_per_day: 0,
            engine_volume: 0,
            year: 0,
            drive_type: 0,
            photos: [],
            owner_id: 0,
            current_renter_id: null,
            status: CarStatus.free,
            open_price: 0,
            owned_car: false,
            rental_id: 0,
          },
          isCurrentDeliveryVehicle: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch current delivery vehicle:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch current delivery vehicle",
        isCurrentDeliveryVehicle: false,
      });
    }
  },

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

  fetchInUseVehicles: async () => {
    try {
      set({ isLoadingInUse: true, error: null });
      const response = await mechanicApi.getInUseVehicles();
      set({
        inUseVehicles: response.data.vehicles || [],
        isLoadingInUse: false,
      });
    } catch (error) {
      console.error("Failed to fetch pending vehicles:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch pending vehicles",
        isLoadingInUse: false,
      });
    }
  },

  fetchPendingVehicles: async () => {
    try {
      set({ isLoadingPending: true, error: null });
      const response = await mechanicApi.getPendingVehicles();
      set({
        pendingVehicles: response.data.vehicles || [],
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
        deliveryVehicles:
          response.data.delivery_vehicles.map((car) => ({
            ...car,
            name: car.car_name,
            id: car.car_id,
          })) || [],
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

  fetchAllMechanicVehicles: async () => {
    try {
      set({ isLoadingAllMechanic: true, error: null });

      // Выполняем все запросы параллельно
      const response = await mechanicApi.getAllVehicles();

      set({
        allMechanicVehicles: response.data.vehicles,
        isLoadingAllMechanic: false,
      });
    } catch (error) {
      console.error("Failed to fetch all mechanic vehicles:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch all mechanic vehicles",
        isLoadingAllMechanic: false,
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
      inUseVehicles: [],
      allMechanicVehicles: [],
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
      inUseVehicles: updateVehicleInArray(state.inUseVehicles),
      allMechanicVehicles: updateVehicleInArray(state.allMechanicVehicles),
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
