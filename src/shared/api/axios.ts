import axios from "axios";
import { getAccessToken } from "../utils/tokenStorage";
import { authApi } from "./routes/auth";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Флаг для отслеживания процесса обновления токена
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

// Защита от дублирования запросов
const pendingRequests = new Map<string, Promise<any>>();

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Защита от дублирования запросов
    const shouldProtectFromDuplication =
      config.method === "get" || config.method === "post";

    if (shouldProtectFromDuplication) {
      const requestKey = `${config.method}:${config.url}:${JSON.stringify(
        config.params || {}
      )}:${config.method === "post" ? JSON.stringify(config.data || {}) : ""}`;

      if (pendingRequests.has(requestKey)) {
        console.log(`[axios] Предотвращен дублирующийся запрос: ${requestKey}`);
        // Возвращаем Promise который отклоняется для предотвращения дублирования
        return Promise.reject(new Error("DUPLICATE_REQUEST_PREVENTED"));
      }

      // Добавляем запрос в pending
      pendingRequests.set(requestKey, Promise.resolve());

      // Автоматически очищаем через 5 секунд (для POST запросов)
      if (config.method === "post") {
        setTimeout(() => {
          pendingRequests.delete(requestKey);
        }, 5000);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Очищаем завершенный запрос из pending
    const shouldClearFromCache =
      response.config.method === "get" ||
      (response.config.method === "post" &&
        response.config.url?.includes("/rent/"));

    if (shouldClearFromCache) {
      const requestKey = `${response.config.method}:${
        response.config.url
      }:${JSON.stringify(response.config.params || {})}:${
        response.config.method === "post"
          ? JSON.stringify(response.config.data || {})
          : ""
      }`;
      pendingRequests.delete(requestKey);
    }
    return response;
  },
  async (error) => {
    // Пропускаем обработку для предотвращенных дубликатов
    if (error.message === "DUPLICATE_REQUEST_PREVENTED") {
      console.log("[axios] Дублирующийся запрос предотвращен");
      return Promise.resolve({ status: 200, data: "DUPLICATE_PREVENTED" });
    }

    // Очищаем неудачный запрос из pending
    const shouldClearFromCache =
      error.config?.method === "get" ||
      (error.config?.method === "post" &&
        error.config?.url?.includes("/rent/"));

    if (shouldClearFromCache) {
      const requestKey = `${error.config.method}:${
        error.config.url
      }:${JSON.stringify(error.config.params || {})}:${
        error.config.method === "post"
          ? JSON.stringify(error.config.data || {})
          : ""
      }`;
      pendingRequests.delete(requestKey);
    }
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authApi.refreshToken();
        processQueue();
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
