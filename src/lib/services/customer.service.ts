import { apiClient } from "../api/axios";

export const CustomerService = {
  getContactAddress: (options?: { signal?: AbortSignal }) => {
    return apiClient.get("/customer/address", {
      signal: options?.signal,
    });
  },
};