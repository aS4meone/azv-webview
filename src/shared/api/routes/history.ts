import axiosInstance from "../axios";

export const historyRoutes = {
  getHistories: "/rent/history",
  getHistoryOfRent: (id: string) => `/rent/history/${id}`, // sid (short ID) - base64 encoded UUID
};

export const historyApi = {
  getHistories: async () => {
    const response = await axiosInstance.get(historyRoutes.getHistories);
    return response;
  },
  getHistoryOfRent: async (id: string) => { // sid (short ID) - base64 encoded UUID
    const response = await axiosInstance.get(
      historyRoutes.getHistoryOfRent(id)
    );
    return response;
  },
};
