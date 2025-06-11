import axiosInstance from "../axios";
import { UploadDocumentsDto } from "@/shared/models/dto/user.dto";

export const userRoutes = {
  getUser: "/auth/user/me",
  uploadDocuments: "/auth/upload-documents/",
  deleteUser: "/auth/delete_account/",
  addMoney: "/rent/add_money",
  fcmToken: "/push/save-token",
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
  addMoney: async (amount: number) => {
    const response = await axiosInstance.post(
      `${userRoutes.addMoney}?amount=${amount}`
    );
    return response;
  },
  fcmToken: async (data: any) => {
    const response = await axiosInstance.post(userRoutes.fcmToken, data);
    return response;
  },
};
