import { CompleteRentDto } from "@/shared/models/dto/rent.dto";
import axiosInstance from "../axios";

export const mechanicRoutes = {
  getAllVehicles: "/mechanic/all_vehicles",
  getPendingVehicles: "/mechanic/get_pending_vehicles",
  getInUseVehicles: "/mechanic/get_in_use_vehicles",
  getServiceVehicles: "/mechanic/get_service_vehicles",
  searchVehicles: "/mechanic/search",

  reserveCheckCar: (id: number) => `/mechanic/check-car/${id}`,
  startDeliveryCar: `mechanic/start-delivery`,

  startCheckCar: (id: number) => `/mechanic/start/${id}`,
  cancelCheckCar: "/mechanic/cancel",

  uploadBeforeCheckCar: "/mechanic/upload-photos-before",
  uploadBeforeCheckCarInterior: "/mechanic/upload-photos-before-interior",
  uploadAfterCheckCar: "/mechanic/upload-photos-after",
  uploadAfterCheckCarCar: "/mechanic/upload-photos-after-car",

  completeCheckCar: "/mechanic/complete",

  getDeliveryVehicles: "/mechanic/get-delivery-vehicles",

  acceptDelivery: (id: string) => `/mechanic/accept-delivery/${id}`, // sid (short ID) - base64 encoded UUID
  completeDelivery: "/mechanic/complete-delivery",

  getCurrentDelivery: "/mechanic/current-delivery",

  uploadBeforeDelivery: "/mechanic/upload-delivery-photos-before",
  uploadBeforeDeliveryInterior: "/mechanic/upload-delivery-photos-before-interior",
  uploadAfterDelivery: "/mechanic/upload-delivery-photos-after",
  uploadAfterDeliveryCar: "/mechanic/upload-delivery-photos-after-car",
};

export const mechanicActionsRoutes = {
  openVehicle: "/mechanic/open",
  closeVehicle: "/mechanic/close",
  giveKey: "/mechanic/give-key",
  takeKey: "/mechanic/take-key",
  unlockEngine: "/mechanic/unlock-engine",
  lockEngine: "/mechanic/lock-engine",
};

export const mechanicApi = {
  getAllVehicles: async () => {
    const response = await axiosInstance.get(mechanicRoutes.getAllVehicles);
    return response;
  },
  getPendingVehicles: async () => {
    const response = await axiosInstance.get(mechanicRoutes.getPendingVehicles);
    return response;
  },
  getInUseVehicles: async () => {
    const response = await axiosInstance.get(mechanicRoutes.getInUseVehicles);
    return response;
  },
  getServiceVehicles: async () => {
    const response = await axiosInstance.get(mechanicRoutes.getServiceVehicles);
    return response;
  },
  searchVehicles: async (search: string) => {
    const response = await axiosInstance.get(mechanicRoutes.searchVehicles, {
      params: { query: search },
    });
    return response.data;
  },
  reserveCheckCar: async (id: number) => {
    const response = await axiosInstance.post(
      mechanicRoutes.reserveCheckCar(id)
    );
    return response;
  },
  startDeliveryCar: async () => {
    const response = await axiosInstance.post(mechanicRoutes.startDeliveryCar);
    return response;
  },
  startCheckCar: async (carId: number) => {
    const response = await axiosInstance.post(mechanicRoutes.startCheckCar(carId));
    return response;
  },
  cancelCheckCar: async () => {
    const response = await axiosInstance.post(mechanicRoutes.cancelCheckCar);
    return response;
  },
  uploadBeforeCheckCar: async (formData: FormData) => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadBeforeCheckCar,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadBeforeCheckCarInterior: async (formData: FormData) => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadBeforeCheckCarInterior,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  uploadAfterCheckCar: async (formData: FormData) => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadAfterCheckCar,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadAfterCheckCarCar: async (formData: FormData) => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadAfterCheckCarCar,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  completeCheckCar: async (rentData: CompleteRentDto) => {
    const response = await axiosInstance.post(
      mechanicRoutes.completeCheckCar,
      rentData
    );
    return response;
  },
  getDeliveryVehicles: async () => {
    const response = await axiosInstance.get(
      mechanicRoutes.getDeliveryVehicles
    );
    return response;
  },
  acceptDelivery: async (id: string) => { // sid (short ID) - base64 encoded UUID
    const response = await axiosInstance.post(
      mechanicRoutes.acceptDelivery(id)
    );
    return response;
  },
  completeDelivery: async () => {
    const response = await axiosInstance.post(mechanicRoutes.completeDelivery);
    return response;
  },
  getCurrentDelivery: async () => {
    const response = await axiosInstance.get(mechanicRoutes.getCurrentDelivery);
    return response;
  },
  uploadBeforeDelivery: async (formData: FormData) => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadBeforeDelivery,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response;
  },
  uploadBeforeDeliveryInterior: async (formData: FormData) => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadBeforeDeliveryInterior,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response;
  },
  uploadAfterDelivery: async (formData: FormData) => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadAfterDelivery,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadAfterDeliveryCar: async (formData: FormData) => {
    const response = await axiosInstance.post(
      mechanicRoutes.uploadAfterDeliveryCar,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
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
  unlockEngine: async () => {
    const response = await axiosInstance.post(
      mechanicActionsRoutes.unlockEngine
    );
    return response.data;
  },
  lockEngine: async () => {
    const response = await axiosInstance.post(
      mechanicActionsRoutes.lockEngine
    );
    return response.data;
  },
};
