import { apiClient } from "../api/axios";
import { getCookie } from "cookies-next";
import { DEFAULT_LANGUAGE } from "../config";

export type TicketWalletResponse =
    | {
        // Common: `{ data: { ticketbalance } }`
        data?: {
            ticketbalance?: number;
        };
    }
    | {
        // Sometimes: `{ data: { data: { ticketbalance } } }`
        data?: {
            data?: {
                ticketbalance?: number;
            };
        };
    }
    | {
        // Fallback: `{ ticketbalance }`
        ticketbalance?: number;
    };

export const TicketWalletService = {
    getTicketBalance: () => {
        const language = (getCookie("NEXT_LOCALE") as string) || DEFAULT_LANGUAGE;
        return apiClient.get(`/ticketWalletAmount`, {
            headers: {
                Lan: language,
            },
        }) as Promise<TicketWalletResponse>;
    },
};

