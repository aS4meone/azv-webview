import { CompleteRentDto, RentCarDto } from "@/shared/models/dto/rent.dto";
import axiosInstance from "../axios";

export const rentRoutes = {
  reserveCar: (id: number) => `/rent/reserve-car/${id}`,
  reserveDelivery: (id: number) => `/rent/reserve-delivery/${id}`,
  cancelReservation: `/rent/cancel`,
  cancelDelivery: `/rent/cancel-delivery`,

  startRent: (id: number) => `/rent/start/${id}`,

  uploadBeforeRent: `/rent/upload-photos-before`,
  uploadBeforeRentInterior: `/rent/upload-photos-before-interior`,
  uploadAfterRent: `/rent/upload-photos-after`,
  uploadAfterRentCar: `/rent/upload-photos-after-car`,

  uploadOwnerBeforeRent: `/rent/upload-photos-before-owner`,
  uploadOwnerBeforeRentInterior: `/rent/upload-photos-before-owner-interior`,
  uploadOwnerAfterRent: `/rent/upload-photos-after-owner`,
  uploadOwnerAfterRentCar: `/rent/upload-photos-after-owner-car`,

  completeRent: "/rent/complete",
  applyPromoCode: "/rent/promo_codes/apply",
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
  reserveDelivery: async (
    id: number,
    data: RentCarDto,
    lng: number,
    lat: number
  ) => {
    const response = await axiosInstance.post(
      `${rentRoutes.reserveDelivery(id)}?rental_type=${
        data.rentalType
      }&delivery_latitude=${lat}&delivery_longitude=${lng}${
        data.rentalType == "minutes" ? "" : `&duration=${data.duration}`
      }`
    );
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
  startRent: async (carId: number) => {
    const response = await axiosInstance.post(rentRoutes.startRent(carId));
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
  uploadBeforeRentInterior: async (formData: FormData) => {
    const response = await axiosInstance.post(
      rentRoutes.uploadBeforeRentInterior,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadAfterRent: async (formData: FormData) => {
    const response = await axiosInstance.post(
      rentRoutes.uploadAfterRent,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadOwnerBeforeRent: async (formData: FormData) => {
    const response = await axiosInstance.post(
      rentRoutes.uploadOwnerBeforeRent,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadOwnerBeforeRentInterior: async (formData: FormData) => {
    const response = await axiosInstance.post(
      rentRoutes.uploadOwnerBeforeRentInterior,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadOwnerAfterRent: async (formData: FormData) => {
    const response = await axiosInstance.post(
      rentRoutes.uploadOwnerAfterRent,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadAfterRentCar: async (formData: FormData) => {
    const response = await axiosInstance.post(
      rentRoutes.uploadAfterRentCar,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  uploadOwnerAfterRentCar: async (formData: FormData) => {
    const response = await axiosInstance.post(
      rentRoutes.uploadOwnerAfterRentCar,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  completeRent: async (data: CompleteRentDto) => {
    const response = await axiosInstance.post(rentRoutes.completeRent, data);
    return response;
  },
  applyPromoCode: async (code: string) => {
    const response = await axiosInstance.post(rentRoutes.applyPromoCode, {
      code,
    });
    return response;
  },
};
