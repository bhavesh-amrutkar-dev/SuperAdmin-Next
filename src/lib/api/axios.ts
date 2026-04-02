import axios, { AxiosHeaders } from "axios";
import { getCommonHeaders } from "./headers";
import { API_NY_URL, API_PY_URL, API_PY_URL_ROOT } from "../config";

export const apiClient = axios.create({
  baseURL: API_NY_URL,
  timeout: 60000,
});

/* ---------------- Request Interceptor ---------------- */
apiClient.interceptors.request.use(
  (config) => {
    const headers = getCommonHeaders();

    if (config.headers instanceof AxiosHeaders) {
      Object.entries(headers).forEach(([key, value]) => {
        if (value !== undefined) {
          config.headers.set(key, value);
        }
      });
    } else {
      config.headers = new AxiosHeaders(headers);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------- Response Interceptor ---------------- */
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/guest/signIn")
    ) {
      originalRequest._retry = true;

      try {
        // clear tokens
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // call guest API directly
        const guestRes = await import("../services/guest").then((m) =>
          m.GuestService.initGuest()
        );

        const newToken = guestRes?.data?.token?.accessToken;

        if (!newToken) throw new Error("No guest token received");

        // inject token into retry request
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }

        originalRequest.headers["Authorization"] = newToken;

        return apiClient(originalRequest);
      } catch {
        window.location.replace("/");
      }
    }

    return Promise.reject({
      status,
      message:
        error?.response?.data?.message ||
        "Something went wrong.",
    });
  }
);

export const pyApiClient = axios.create({
  baseURL: API_PY_URL,
  timeout: 60000,
});

pyApiClient.interceptors.request.use((config) => {
  const headers = getCommonHeaders();

  if (config.headers instanceof AxiosHeaders) {
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined) {
        config.headers.set(key, value);
      }
    });
  }

  return config;
});

pyApiClient.interceptors.response.use(
  (response) => response.data,
  (error) =>
    Promise.reject({
      status: error?.response?.status,
      message:
        error?.response?.data?.message ||
        "Python service error",
    })
);

export const pyApiClientRoot = axios.create({
  baseURL: API_PY_URL_ROOT,
  timeout: 60000,
});

pyApiClientRoot.interceptors.request.use((config) => {
  const headers = getCommonHeaders();

  if (config.headers instanceof AxiosHeaders) {
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined) {
        config.headers.set(key, value);
      }
    });
  }

  return config;
});

pyApiClientRoot.interceptors.response.use(
  (response) => response.data,
  (error) =>
    Promise.reject({
      status: error?.response?.status,
      message:
        error?.response?.data?.message ||
        "Python service error",
    })
);