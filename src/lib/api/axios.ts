import axios, { AxiosHeaders } from "axios";
import { getCommonHeaders } from "./headers";
import { API_NY_URL, API_PY_URL } from "../config";

export const apiClient = axios.create({
  baseURL: API_NY_URL,
  timeout: 15000,
});

/* Request Interceptor */
apiClient.interceptors.request.use(
  (config) => {
    const headers = getCommonHeaders();

    // Axios v1 safe header mutation
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
/* Response Interceptor */
apiClient.interceptors.response.use(
  (response) => response.data, 
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // token expired / invalid
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject({
      status,
      message:
        error?.response?.data?.message ||
        "Something went wrong. Please try again.",
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
      config.headers.set(key, value);
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
        error?.response?.data?.message ??
        "Python service error",
    })
);
