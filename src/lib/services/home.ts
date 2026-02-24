import { HomeApiResponseV2 } from "@/src/models/api/response/home";
import { pyApiClient } from "../api/axios";
import { API_ROUTE_HOME_PAGE } from "../api/routes";
import { STORE_CATEGORY_ID } from "../config";

export const HomeService = {
  getHomePage: (requestFrom: number) => {
    return pyApiClient.get<HomeApiResponseV2>(API_ROUTE_HOME_PAGE, {
      params: {
        storeCategoryId: STORE_CATEGORY_ID,
        requestFrom,
      },
    }) as unknown as Promise<HomeApiResponseV2>;
  },

  newsletter: (email: string) => {
    return pyApiClient.post<any>("/newsletter", {
      emailAddress: email
    });
  },
};

