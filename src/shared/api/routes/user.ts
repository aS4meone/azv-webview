import axiosInstance from "../axios";

export const userRoutes = {
  getUser: "/auth/user/me",
  uploadDocuments: "/auth/upload-documents/",
  deleteUser: "/auth/delete_account/",
  addMoney: "/rent/add_money",
  fcmToken: "/push/save-token",
  updateName: "/auth/user/name",
};

export const userApi = {
  getUser: async () => {
    const response = await axiosInstance.get(userRoutes.getUser);
    return response;
  },
  uploadDocuments: async (data: FormData) => {
    const response = await axiosInstance.post(
      userRoutes.uploadDocuments,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },
  deleteUser: async () => {
    const response = await axiosInstance.delete(userRoutes.deleteUser);
    return response;
  },
  addMoney: async (amount: number, trackingId?: string) => {
    const params = new URLSearchParams({ amount: amount.toString() });
    if (trackingId) {
      params.append("tracking_id", trackingId);
    }

    const response = await axiosInstance.post(
      `${userRoutes.addMoney}?${params.toString()}`
    );
    return response;
  },
  fcmToken: async (data: { token: string }) => {
    const response = await axiosInstance.post(userRoutes.fcmToken, data);
    return response;
  },
  updateName: async (data: { first_name?: string; last_name?: string }) => {
    const response = await axiosInstance.patch(userRoutes.updateName, data);
    return response;
  },
};
