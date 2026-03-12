import { API_NY_URL } from "../config";
import { serverFetch } from "../api/server-api";
import { WinnerDetailResponse, WinnerResponse } from "@/src/models/api/response/winners";

export const WinnerServiceServer = {
    getWinnersServer: async (year?: number, month?: number) => {

        const now = new Date();
        const currentYear = year ?? now.getFullYear();
        const currentMonth = month ?? now.getMonth() + 1; // JS month is 0-based

        const endpoint = `/user/winner?year=${currentYear}&month=${currentMonth}`;

        return serverFetch<WinnerResponse>(endpoint, {
            baseUrl: API_NY_URL,
            next: { revalidate: 60 }
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