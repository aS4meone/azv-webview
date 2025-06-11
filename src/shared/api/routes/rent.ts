import { CompleteRentDto, RentCarDto } from "@/shared/models/dto/rent.dto";
import axiosInstance from "../axios";

export const rentRoutes = {
  reserveCar: (id: number) => `/rent/reserve-car/${id}`,
  reserveDelivery: (id: number) => `/rent/reserve-delivery/${id}`,
  cancelReservation: `/rent/cancel`,
  cancelDelivery: `/rent/cancel-delivery`,

  startRent: `/rent/start`,

  uploadBeforeRent: `/rent/upload-photos-before`,
  uploadAfterRent: `/rent/upload=photos-after`,

  uploadOwnerBeforeRent: `/rent/upload-photos-before-owner`,
  uploadOwnerAfterRent: `/rent/upload-photos-after-owner`,

  completeRent: "/rent/complete",
};

export const rentApi = {
  reserveCar: async (data: RentCarDto) => {
    const response = await axiosInstance.post(
      `${rentRoutes.reserveCar(data.carId)}?rental_type=${data.rentalType}${
        data.rentalType == "minutes" ? "" : `&duration=${data.duration}`
      }`
    );
    return response;
  },
  reserveDelivery: async (id: number) => {
    const response = await axiosInstance.post(rentRoutes.reserveDelivery(id));
    return response;
  },
  cancelReservation: async () => {
    const response = await axiosInstance.post(rentRoutes.cancelReservation);
    return response;
  },
  cancelDelivery: async () => {
    const response = await axiosInstance.post(rentRoutes.cancelDelivery);
    return response;
  },
  startRent: async () => {
    const response = await axiosInstance.post(rentRoutes.startRent);
    return response;
  },
  uploadBeforeRent: async (formData: FormData) => {
    const response = await axiosInstance.post(
      rentRoutes.uploadBeforeRent,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadAfterRent: async () => {
    const response = await axiosInstance.post(rentRoutes.uploadAfterRent);
    return response;
  },
  uploadOwnerBeforeRent: async () => {
    const response = await axiosInstance.post(rentRoutes.uploadOwnerBeforeRent);
    return response;
  },
  uploadOwnerAfterRent: async () => {
    const response = await axiosInstance.post(rentRoutes.uploadOwnerAfterRent);
    return response;
  },
  completeRent: async (data: CompleteRentDto) => {
    const response = await axiosInstance.post(rentRoutes.completeRent, data);
    return response;
  },
};
