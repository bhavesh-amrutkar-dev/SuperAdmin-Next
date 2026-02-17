
import { API_NY_URL } from "../config";
import { serverFetch } from "../api/server-api";
import { WinnerDetailResponse, WinnerResponse } from "@/src/models/api/response/winners";

export const WinnerServiceServer = {
    getWinnersServer: async () => {
        const endpoint = `/user/winner`;

        return serverFetch<WinnerResponse>(endpoint, {
            baseUrl: API_NY_URL,
            next: { revalidate: 60 } // optional revalidation
        });
    },

    getWinnerDetailServer: async (campaignId: string) => {
        const endpoint = `/raffle/winnerCampaign/detail?campaignId=${campaignId}`;

        return serverFetch<WinnerDetailResponse>(endpoint, {
            baseUrl: API_NY_URL,
            next: { revalidate: 60 }
        });
    },
};
