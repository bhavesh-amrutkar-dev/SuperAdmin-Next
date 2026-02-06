import { apiClient } from "../api/axios";

export type RulesData = {
    raffleRulesObj?: string; // HTML content string
    returnsBannerImages?: {
        webUrl?: string;
        mobileUrl?: string;
    };
};

export const RulesService = {
    getRaffleRules: () => {
        const params = {
            storeId: "0",
            for: "rafflerules",
        };
        return apiClient.get<{ data: RulesData }>("/webpagedata", { params });
    },
};

