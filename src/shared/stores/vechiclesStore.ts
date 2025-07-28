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
  forceRefreshMechanicData: () => Promise<void>;
  forceRefreshAllData: () => Promise<void>;
  forceClearCacheAndRefresh: () => Promise<void>;

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

      if (response?.data) {
        const car: ICar = {
          ...response.data,
          name: response.data.car_name || "",
          id: response.data.car_id || 0,
          plate_number: response.data.plate_number || "",
          latitude: response.data.latitude || 0,
          longitude: response.data.longitude || 0,
          course: response.data.course || 0,
          fuel_level: response.data.fuel_level || 0,
          price_per_minute: response.data.price_per_minute || 0,
          price_per_hour: response.data.price_per_hour || 0,
          price_per_day: response.data.price_per_day || 0,
          engine_volume: response.data.engine_volume || 0,
          year: response.data.year || 0,
          drive_type: response.data.drive_type || 0,
          photos: response.data.photos || [],
          owner_id: response.data.owner_id || 0,
          current_renter_id: response.data.current_renter_id || null,
          status: response.data.status || CarStatus.free,
          open_price: response.data.open_price || 0,
          owned_car: response.data.owned_car || false,
          rental_id: response.data.rental_id || 0,
        };
        set({
          currentDeliveryVehicle: car,
          isCurrentDeliveryVehicle: false,
        });
      } else {
        // Reset current delivery vehicle to default state
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
    } catch (error: unknown) {
      // Handle 404 or other errors gracefully
      console.error("Failed to fetch current delivery vehicle:", error);

      // If it's a 404, it means there's no current delivery - this is normal
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 404
      ) {
        console.log("No current delivery found - this is normal");
      }

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
        error: null, // Don't set error for 404 as it's expected
        isCurrentDeliveryVehicle: false,
      });
    }
  },

  fetchAllVehicles: async () => {
    const state = get();
    if (state.isLoadingAll) {
      console.log(
        "[vehiclesStore] fetchAllVehicles: уже загружается, пропускаем"
      );
      return;
    }

    try {
      set({ isLoadingAll: true, error: null });
      console.log("[vehiclesStore] fetchAllVehicles: начинаем запрос");
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
    const state = get();
    if (state.isLoadingPending) {
      console.log(
        "[vehiclesStore] fetchPendingVehicles: уже загружается, пропускаем"
      );
      return;
    }

    try {
      set({ isLoadingPending: true, error: null });
      console.log("[vehiclesStore] fetchPendingVehicles: начинаем запрос");
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
    const state = get();
    if (state.isLoadingFrequent) {
      console.log(
        "[vehiclesStore] fetchFrequentlyUsedVehicles: уже загружается, пропускаем"
      );
      return;
    }

    try {
      set({ isLoadingFrequent: true, error: null });
      console.log(
        "[vehiclesStore] fetchFrequentlyUsedVehicles: начинаем запрос"
      );
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

  forceRefreshMechanicData: async () => {
    try {
      set({ isLoadingAllMechanic: true, error: null });
      const response = await mechanicApi.getAllVehicles();
      if (response?.data) {
        set({
          allMechanicVehicles: response.data.vehicles || [],
          isLoadingAllMechanic: false,
        });
      } else {
        set({ isLoadingAllMechanic: false });
      }
    } catch (error) {
      console.error("Failed to force refresh mechanic data:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to force refresh mechanic data",
        isLoadingAllMechanic: false,
      });
    }
  },

  forceRefreshAllData: async () => {
    try {
      set({ isLoadingAll: true, isLoadingAllMechanic: true, error: null });

      // Обновляем все данные параллельно
      const [
        allVehiclesRes,
        pendingVehiclesRes,
        inUseVehiclesRes,
        deliveryVehiclesRes,
      ] = await Promise.all([
        mechanicApi.getAllVehicles(),
        mechanicApi.getPendingVehicles(),
        mechanicApi.getInUseVehicles(),
        mechanicApi.getDeliveryVehicles(),
      ]);

      // Обновляем все состояния
      set({
        allMechanicVehicles: allVehiclesRes?.data?.vehicles || [],
        pendingVehicles: pendingVehiclesRes?.data?.vehicles || [],
        inUseVehicles: inUseVehiclesRes?.data?.vehicles || [],
        deliveryVehicles: deliveryVehiclesRes?.data?.vehicles || [],
        isLoadingAll: false,
        isLoadingAllMechanic: false,
      });
    } catch (error) {
      console.error("Failed to force refresh all data:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to force refresh all data",
        isLoadingAll: false,
        isLoadingAllMechanic: false,
      });
    }
  },

  forceClearCacheAndRefresh: async () => {
    try {
      // Очищаем все данные
      set({
        allVehicles: [],
        pendingVehicles: [],
        deliveryVehicles: [],
        inUseVehicles: [],
        allMechanicVehicles: [],
        frequentlyUsedVehicles: [],
        searchResults: [],
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
        error: null,
      });

      // Принудительно обновляем все данные
      await get().forceRefreshAllData();

      // Дополнительно принудительно сбрасываем currentDeliveryVehicle
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
    } catch (error) {
      console.error("Failed to clear cache and refresh:", error);
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
