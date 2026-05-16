import { apiClient } from "../api/axios";

const STORE_ID = 0;

export const WebPageService = {
  /* ---------------- Customer Pages ---------------- */
  getCustomerPages: (options?: { signal?: AbortSignal }) => {
    return apiClient.get("/webpagedata", {
      params: {
        storeId: STORE_ID,
        for: "customer",
      },
      signal: options?.signal,
    });
  },

  /* ---------------- Orders Shipping Page ---------------- */
  getOrdersPage: (options?: { signal?: AbortSignal }) => {
    return apiClient.get("/webpagedata", {
      params: {
        storeId: STORE_ID,
        for: "Orders",
      },
      signal: options?.signal,
    });
  },

  /* ---------------- Payments Page ---------------- */
  getPaymentsPage: (options?: { signal?: AbortSignal }) => {
    return apiClient.get("/webpagedata", {
      params: {
        storeId: STORE_ID,
        for: "Payments",
      },
      signal: options?.signal,
    });
  },

  /* ---------------- Returns / Refund Page ---------------- */
  getReturnsPage: (options?: { signal?: AbortSignal }) => {
    return apiClient.get("/webpagedata", {
      params: {
        storeId: STORE_ID,
        for: "Returns",
      },
      signal: options?.signal,
    });
  },

  /* ---------------- Raffle Rules Page ---------------- */
  getRaffleRulesPage: (options?: { signal?: AbortSignal }) => {
    return apiClient.get("/webpagedata", {
      params: {
        storeId: STORE_ID,
        for: "rafflerules",
      },
      signal: options?.signal,
    });
  },
};