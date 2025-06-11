import axiosInstance from "../axios";

export const mechanicRoutes = {
  getPendingVehicles: "/mechanic/get_pending_vehicles",
  getInUseVehicles: "/mechanic/get_in_use_vehicles",
  searchVehicles: "/mechanic/search",

  reserveCheckCar: (id: number) => `/mechanic/check-car/${id}`,

  startCheckCar: "/mechanic/start",
  cancelCheckCar: "/mechanic/cancel",

  uploadBeforeCheckCar: "/mechanic/upload-photos-before",
  uploadAfterCheckCar: "/mechanic/upload-photos-after",

  completeCheckCar: "/mechanic/complete",

  getDeliveryVehicles: "/mechanic/get-delivery-vehicles",

  acceptDelivery: (id: number) => `/mechanic/accept-delivery/${id}`,
  completeDelivery: "/mechanic/complete-delivery",

  getCurrentDelivery: "/mechanic/current-delivery",

  uploadBeforeDelivery: "/mechanic/upload-delivery-photos-before",
  uploadAfterDelivery: "/mechanic/upload-delivery-photos-after",
};

export const mechanicActionsRoutes = {
  openVehicle: "/mechanic/open",
  closeVehicle: "/mechanic/close",
  giveKey: "/mechanic/give-key",
  takeKey: "/mechanic/take-key",
};

export const mechanicApi = {
  getPendingVehicles: async () => {
    const response = await axiosInstance.get(mechanicRoutes.getPendingVehicles);
    return response.data;
  },
  getInUseVehicles: async () => {
    const response = await axiosInstance.get(mechanicRoutes.getInUseVehicles);
    return response.data;
  },
  searchVehicles: async (search: string) => {
    const response = await axiosInstance.get(mechanicRoutes.searchVehicles, {
      params: { search },
    });
    return response.data;
  },
  reserveCheckCar: async (id: number) => {
    const response = await axiosInstance.post(
      mechanicRoutes.reserveCheckCar(id)
    );
    return response.data;
  },
  startCheckCar: async () => {
    const response = await axiosInstance.post(mechanicRoutes.startCheckCar);
    return response.data;
  },
  cancelCheckCar: async () => {
    const response = await axiosInstance.post(mechanicRoutes.cancelCheckCar);
    return response.data;
  },
  uploadBeforeCheckCar: async () => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadBeforeCheckCar
    );
    return response.data;
  },
  uploadAfterCheckCar: async () => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadAfterCheckCar
    );
    return response.data;
  },
  completeCheckCar: async () => {
    const response = await axiosInstance.post(mechanicRoutes.completeCheckCar);
    return response.data;
  },
  getDeliveryVehicles: async () => {
    const response = await axiosInstance.get(
      mechanicRoutes.getDeliveryVehicles
    );
    return response.data;
  },
  acceptDelivery: async (id: number) => {
    const response = await axiosInstance.post(
      mechanicRoutes.acceptDelivery(id)
    );
    return response.data;
  },
  completeDelivery: async () => {
    const response = await axiosInstance.post(mechanicRoutes.completeDelivery);
    return response.data;
  },
  getCurrentDelivery: async () => {
    const response = await axiosInstance.get(mechanicRoutes.getCurrentDelivery);
    return response.data;
  },
  uploadBeforeDelivery: async () => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadBeforeDelivery
    );
    return response.data;
  },
  uploadAfterDelivery: async () => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadAfterDelivery
    );
    return response.data;
  },
};

export const mechanicActionsApi = {
  openVehicle: async () => {
    const response = await axiosInstance.post(
      mechanicActionsRoutes.openVehicle
    );
    return response.data;
  },
  closeVehicle: async () => {
    const response = await axiosInstance.post(
      mechanicActionsRoutes.closeVehicle
    );
    return response.data;
  },
  giveKey: async () => {
    const response = await axiosInstance.post(mechanicActionsRoutes.giveKey);
    return response.data;
  },
  takeKey: async () => {
    const response = await axiosInstance.post(mechanicActionsRoutes.takeKey);
    return response.data;
  },
};
