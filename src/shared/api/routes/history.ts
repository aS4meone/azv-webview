import axiosInstance from "../axios";

export const historyRoutes = {
  getHistories: "/rent/history",
  getHistoryOfRent: (id: number) => `/rent/history/${id}`,
};

export const historyApi = {
  getHistories: async () => {
    const response = await axiosInstance.get(historyRoutes.getHistories);
    return response.data;
  },
  getHistoryOfRent: async (id: number) => {
    const response = await axiosInstance.get(
      historyRoutes.getHistoryOfRent(id)
    );
    return response.data;
  },
};
