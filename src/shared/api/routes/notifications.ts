import axiosInstance from "../axios";

export const notificationRoutes = {
  getNotifications: "/notifications/",
  markAsRead: (id: number) => `/notifications/${id}/read`,
};

export interface NotificationResponse {
  unread_count: number;
  notifications: INotification[];
}

export interface INotification {
  id: number;
  title: string;
  body: string;
  sent_at: string;
  is_read: boolean;
}

export interface MarkAsReadResponse {
  success?: boolean;
  message?: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<{
    data: NotificationResponse | null;
    error: string | null;
    statusCode: number;
  }> => {
    try {
      const response = await axiosInstance.get(
        notificationRoutes.getNotifications
      );
      return {
        data: response.data,
        error: null,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to fetch notifications",
        statusCode: error.response?.status || 500,
      };
    }
  },

  markAsRead: async (
    id: number
  ): Promise<{
    data: MarkAsReadResponse | null;
    error: string | null;
    statusCode: number;
  }> => {
    try {
      const response = await axiosInstance.patch(
        notificationRoutes.markAsRead(id)
      );
      return {
        data: response.data,
        error: null,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error.response?.data?.detail || "Failed to mark notification as read",
        statusCode: error.response?.status || 500,
      };
    }
  },
};
