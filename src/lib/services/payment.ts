import { apiClient } from "../api/axios";
import { getCookie } from "cookies-next";
import { DEFAULT_LANGUAGE } from "../config";

export type WalletData = {
    walletId?: string;
    balance?: number;
    currency?: string;
    currencyCode?: string;
};

export type WalletResponse = {
    data?: {
        walletData?: WalletData[];
        walletEarningData?: Array<{
            balance?: number;
            currency?: string;
            currencyCode?: string;
        }>;
    };
};

export const PaymentService = {
    /**
     * Get user wallet balance
     */
    getUserWallet: (userId?: string): Promise<WalletResponse> => {
        const uid = userId || (getCookie("uid") as string) || "";
        if (!uid) {
            return Promise.reject(new Error("User ID not found"));
        }
        const language = (getCookie("NEXT_LOCALE") as string) || DEFAULT_LANGUAGE;
        return apiClient.get(`/wallet`, {
            params: {
                userId: uid,
                userType: "customer",
                lang: language,
            },
        }) as Promise<WalletResponse>;
    },
};

