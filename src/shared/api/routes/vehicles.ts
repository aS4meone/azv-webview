import axiosInstance from "../axios";

export const vehiclesRoutes = {
  getVehicles: "/vehicles/get_vehicles",
  searchVehicles: "/vehicles/search",
  frequentlyUsedVehicles: "/vehicles/frequently-used",
};

export const vehicleActionsRoutes = {
  openVehicle: "/vehicles/open",
  closeVehicle: "/vehicles/close",
  giveKey: "/vehicles/give_key",
  takeKey: "/vehicles/take_key",
};

export const vehicleApi = {
  getVehicles: async () => {
    const response = await axiosInstance.get(vehiclesRoutes.getVehicles);
    return response.data;
  },
  searchVehicles: async (query: string) => {
    const response = await axiosInstance.get(
      `${vehiclesRoutes.searchVehicles}?query=${query}`
    );
    return response.data;
  },
  frequentlyUsedVehicles: async () => {
    const response = await axiosInstance.get(
      vehiclesRoutes.frequentlyUsedVehicles
    );
    return response.data;
  },
};

export const vehicleActionsApi = {
  openVehicle: async () => {
    const response = await axiosInstance.post(vehicleActionsRoutes.openVehicle);
    return response.data;
  },
  closeVehicle: async () => {
    const response = await axiosInstance.post(
      vehicleActionsRoutes.closeVehicle
    );
    return response.data;
  },
  giveKey: async () => {
    const response = await axiosInstance.post(vehicleActionsRoutes.giveKey);
    return response.data;
  },
  takeKey: async () => {
    const response = await axiosInstance.post(vehicleActionsRoutes.takeKey);
    return response.data;
  },
};
