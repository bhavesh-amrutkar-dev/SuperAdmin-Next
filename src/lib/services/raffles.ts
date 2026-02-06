import { apiClient } from "../api/axios";
import { getCookie } from "cookies-next";

const DEFAULT_COUNTRY_ID = "633a6c3dd17f0000ea00102e";

const getCountryId = (): string => {
    const cookieCountryId = getCookie("C_id") as string | undefined;
    return cookieCountryId || DEFAULT_COUNTRY_ID;
};

export const RaffleService = {
  getAllRaffles: (
    catId?: string,
    options?: { signal?: AbortSignal }
  ) => {
    const params: Record<string, string> = {
      countryId: getCountryId(),
    };

    if (catId) {
      params.subCategoryId = catId;
    }

    return apiClient.get("/home/raffles/all", {
      params,
      signal: options?.signal,
    });
  },

  getRaffleDetails: (campaignId: string, options?: { signal?: AbortSignal }) => {
    const params = {
      campaignId,
      countryId: getCountryId(),
    };

    return apiClient.get("/raffleCampaignDetail", {
      params,
      signal: options?.signal,
    });
  },
};
