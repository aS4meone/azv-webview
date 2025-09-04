import axiosInstance from "../axios";

export const myAutoRoutes = {
  getMyCars: "/my-auto/",
  getCarTrips: (vehicleId: number, month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month !== undefined) params.append("month", month.toString());
    if (year !== undefined) params.append("year", year.toString());
    const queryString = params.toString();
    return `/my-auto/${vehicleId}${queryString ? `?${queryString}` : ""}`;
  },
  getTripDetails: (vehicleId: number, tripId: number) => `/my-auto/${vehicleId}/${tripId}`,
};

export const myAutoApi = {
  getMyCars: async () => {
    const response = await axiosInstance.get(myAutoRoutes.getMyCars);
    return response;
  },
  getCarTrips: async (vehicleId: number, month?: number, year?: number) => {
    const response = await axiosInstance.get(
      myAutoRoutes.getCarTrips(vehicleId, month, year)
    );
    return response;
  },
  getTripDetails: async (vehicleId: number, tripId: number) => {
    const response = await axiosInstance.get(
      myAutoRoutes.getTripDetails(vehicleId, tripId)
    );
    return response;
  },
};
