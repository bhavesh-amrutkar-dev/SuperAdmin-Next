import { API_NY_URL, DEFAULT_COUNTRY_CODE } from "../config";
import { serverFetch } from "../api/server-api";
import { cookies } from "next/headers";

const DEFAULT_COUNTRY_ID = "634fb20fc536ea86850a81d4";

async function getCountryId() {
    const cookieStore = await cookies();
    const cookieCountryId = cookieStore.get("C_id")?.value;
    return cookieCountryId || DEFAULT_COUNTRY_ID;
}

export const RaffleServiceServer = {
    getAllRafflesServer: async () => {
        const countryId = await getCountryId();
        // Use proper query param structure for Node API if needed, 
        // usually Node APIs take query params.
        const endpoint = `/home/raffles/all?countryId=${countryId}`;

        return serverFetch<any>(endpoint, {
            baseUrl: API_NY_URL,
        });
    },
};
