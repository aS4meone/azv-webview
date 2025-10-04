import { getRefreshToken, setTokens } from "@/shared/utils/tokenStorage";
import axiosInstance from "../axios";
import axios from "axios";

export const authRoutes = {
  sendSms: "/auth/send_sms/",
  verifySms: "/auth/verify_sms/",
  refreshToken: "auth/refresh_token/",
};

export const authApi = {
  sendSms: async (phoneNumber: string) => {
    try {
      const response = await axiosInstance.post(authRoutes.sendSms, {
        phone_number: phoneNumber,
      });
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to send SMS",
        statusCode: error.status,
      };
    }
  },
  sendSmsWithRegistration: async (phoneNumber: string, firstName: string, lastName: string) => {
    try {
      const response = await axiosInstance.post(authRoutes.sendSms, {
        phone_number: phoneNumber,
        first_name: firstName,
        last_name: lastName,
      });
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to send SMS",
        statusCode: error.status,
      };
    }
  },
  verifySms: async (phoneNumber: string, code: string) => {
    try {
      const response = await axiosInstance.post(authRoutes.verifySms, {
        phone_number: phoneNumber,
        sms_code: code,
      });
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to verify SMS code",
        statusCode: error.status,
      };
    }
  },
  refreshToken: async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${authRoutes.refreshToken}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getRefreshToken()}`,
          },
        }
      );
      setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      });
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to refresh token",
        statusCode: error.status,
      };
    }
  },
};
