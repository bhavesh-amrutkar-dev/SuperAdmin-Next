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

export type BankDetail = {
    _id?: string;
    bankName?: string;
    bankPaymentNumber?: string;
    bankPaymentURL?: string;
    accountHolderID?: string;
    accountHolderName?: string;
    paymentMethodLogo?: string;
    acceptedCurrencyCode?: string;
};

export type BankDetailsResponse = {
    data?: {
        data?: {
            bankDetails?: BankDetail[];
        };
    };
};

export type CurrencyConvertResponse = {
    data?: {
        data?: {
            convertedCurrencySymbol?: string;
            TotalconvertedValue?: number | string;
            to_currency?: string;
        };
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

    /**
     * Get bank details for manual payment
     * API: /country?countryId={cid}
     * Response structure: { data: { bankDetails: [] } }
     */
    getBankDetails: (countryId?: string): Promise<BankDetailsResponse> => {
        const cid = countryId || (getCookie("C_id") as string) || "";
        if (!cid) {
            return Promise.reject(new Error("Country ID not found"));
        }
        // Using query string format to match old project: /country?countryId={cid}
        return apiClient.get(`/country?countryId=${cid}`) as Promise<BankDetailsResponse>;
    },

    /**
     * Get currency conversion for bank payment
     */
    getCurrencyConvert: (toCurrency: string, amount: number | string): Promise<CurrencyConvertResponse> => {
        const language = (getCookie("NEXT_LOCALE") as string) || DEFAULT_LANGUAGE;
        return apiClient.get(`/bankPaymentCurrencyConvert`, {
            params: {
                to_currency: toCurrency,
                amount: amount,
            },
            headers: {
                lan: language,
            },
        }) as Promise<CurrencyConvertResponse>;
    },

    ATHMovileToken: () => {
        return apiClient.get(`/athmovil/config`);
    },
};

