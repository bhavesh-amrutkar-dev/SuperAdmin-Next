import { HomeApiResponseV2 } from "@/src/models/api/response/home";
import { API_ROUTE_HOME_PAGE } from "../api/routes";
import { STORE_CATEGORY_ID } from "../config";
import { serverFetch } from "../api/server-api";

export const HomeServiceServer = {
    getHomePageServer: (requestFrom: number) => {
        return serverFetch<HomeApiResponseV2>(API_ROUTE_HOME_PAGE + `?storeCategoryId=${STORE_CATEGORY_ID}&requestFrom=${requestFrom}`);
    },
};
