import axios, { AxiosHeaders } from "axios";
import { getCommonHeaders } from "./headers";
import { API_NY_URL, API_PY_URL } from "../config";

export const apiClient = axios.create({
  baseURL: API_NY_URL,
  timeout: 30000,
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

    // Prevent infinite loop: if the failed request was already for guest/signIn, do not retry
    // Also check if we've already retried to be safe
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/guest/signIn")) {
      originalRequest._retry = true;

      try {
        // clear old tokens
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
console.log("test");

        // re-init guest
        await import("../bootstrap/initGuest").then(m => m.initGuest());

        return apiClient(originalRequest); // retry request
      } catch {
        // If re-init fails, redirect to home or handle gracefully
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
  timeout: 15000,
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
