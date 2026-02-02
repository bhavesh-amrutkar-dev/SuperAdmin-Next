import { pyApiClient } from "../api/axios";
import { API_ROUTE_HOME_PAGE } from "../api/routes";
import { STORE_CATEGORY_ID } from "../config";

export const HomeService = {
  getHomePage: (requestFrom: number) => {
    return pyApiClient.get(API_ROUTE_HOME_PAGE, {
      params: {
        storeCategoryId: STORE_CATEGORY_ID,
        requestFrom,
      },
    });
  },
};
