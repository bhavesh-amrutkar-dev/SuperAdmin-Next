import { apiClient } from "../api/axios";

export const SupportService = {
  getFAQ: (options?: { signal?: AbortSignal }) => {
    return apiClient.get("/customer/support", {
      signal: options?.signal,
    });
  },
};