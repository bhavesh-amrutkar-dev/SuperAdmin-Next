import { apiClient } from "../api/axios";
import { getCookie } from "cookies-next";
import { DEFAULT_LANGUAGE, STORE_CATEGORY_ID } from "../config";
import { OrderService, type ExpressOrderPayload } from "./cart";
import { getUserIpAddress, getEffectiveTicketId } from "../utils/ticketUtils";

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

type BaseLotteryItem = {
    childProductId?: string;
    productId?: string;
    unitId?: string;
    storeId?: string;
    campaignId?: string;
    tickets?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    ticketPackages?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    ticketOptions?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    entryOptions?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
};

export type ApplyWalletTicketsParams = {
    lotteryItem: BaseLotteryItem;
    selectedTicket: string | null;
    ticketQuantity: number;
    productId: string;
    defaultAddressId?: string;
};

export type PurchasePaidTicketParams = {
    lotteryItem: BaseLotteryItem;
    ticketId: string;
    quantity: number;
    productId: string;
    defaultAddressId?: string;
};

export type PurchaseFreeTicketParams = {
    lotteryItem: BaseLotteryItem;
    ticketId: string;
    quantity: number;
    productId: string;
    defaultAddressId?: string;
};

const DEFAULT_COUNTRY_ID = "634fb20fc536ea86850a81d4";

const getCountryId = (): string => {
    const cookieCountryId = getCookie("C_id") as string | undefined;
    return cookieCountryId || DEFAULT_COUNTRY_ID;
};

const getAddressId = (defaultAddressId?: string): string => {
    return (
        defaultAddressId ||
        (getCookie("AddressID") as string) ||
        (getCookie("addressid") as string) ||
        ""
    );
};

const getDeliveryAddress = () => {
    return {
        latitude: (getCookie("lat") as string) || "0",
        longitude: (getCookie("long") as string) || "0",
    };
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

    /**
     * Applies wallet tickets to a raffle/lottery order
     * @param params - Parameters for applying wallet tickets
     * @returns Promise that resolves when the order is placed successfully
     */
    applyWalletTickets: async (params: ApplyWalletTicketsParams): Promise<void> => {
        const { lotteryItem, selectedTicket, ticketQuantity, productId, defaultAddressId } = params;

        // Get IP address
        const ipAddress = await getUserIpAddress();

        // Determine effective ticketId using utility function
        const effectiveTicketId = getEffectiveTicketId(lotteryItem, selectedTicket);

        // Build payload
        const payload: ExpressOrderPayload = {
            centralProductId: lotteryItem.childProductId || lotteryItem.productId || productId,
            productId: lotteryItem.childProductId || lotteryItem.productId || productId,
            unitId: lotteryItem.unitId || "",
            userType: 1,
            storeId: lotteryItem.storeId || "",
            ticketId: effectiveTicketId,
            campaignId: lotteryItem.campaignId,
            countryId: getCountryId(),
            addToCartOnId: "",
            newQuantity: 1,
            cartType: 2,
            offers: {},
            storeTypeId: 8,
            action: 1,
            walletTickets: String(ticketQuantity),
            deliveryAddress: getDeliveryAddress(),
            storeCategoryId: STORE_CATEGORY_ID as string,
            ipAddress: ipAddress,
            addressId: getAddressId(defaultAddressId),
            billingAddressId: "",
        };

        // Make API call
        await OrderService.expressCheckoutRaffle(payload);
    },

    /**
     * Purchases paid tickets for a raffle/lottery order
     * @param params - Parameters for purchasing paid tickets
     * @returns Promise that resolves when the order is placed successfully
     */
    purchasePaidTicket: async (params: PurchasePaidTicketParams): Promise<void> => {
        const { lotteryItem, ticketId, quantity, productId, defaultAddressId } = params;

        // Get IP address
        const ipAddress = await getUserIpAddress();

        // Build payload
        const payload: ExpressOrderPayload = {
            centralProductId: lotteryItem.childProductId || lotteryItem.productId || productId,
            productId: lotteryItem.childProductId || lotteryItem.productId || productId,
            unitId: lotteryItem.unitId || "",
            userType: 1,
            storeId: lotteryItem.storeId || "",
            ticketId: ticketId || "",
            campaignId: lotteryItem.campaignId,
            countryId: getCountryId(),
            addToCartOnId: "",
            newQuantity: quantity,
            cartType: 2,
            offers: {},
            storeTypeId: 8,
            action: 1,
            walletTickets: "", // Empty for paid tickets
            deliveryAddress: getDeliveryAddress(),
            storeCategoryId: STORE_CATEGORY_ID as string,
            ipAddress: ipAddress,
            addressId: getAddressId(defaultAddressId),
            billingAddressId: "",
        };

        // Make API call
        await OrderService.expressCheckoutRaffle(payload);
    },

    /**
     * Purchases free tickets for a raffle/lottery order
     * @param params - Parameters for purchasing free tickets
     * @returns Promise that resolves with the response data
     */
    purchaseFreeTicket: async (params: PurchaseFreeTicketParams): Promise<any> => {
        const { lotteryItem, ticketId, quantity, productId, defaultAddressId } = params;

        // Get IP address
        const ipAddress = await getUserIpAddress();

        // Build payload
        const payload: ExpressOrderPayload = {
            centralProductId: lotteryItem.childProductId || lotteryItem.productId || productId,
            productId: lotteryItem.childProductId || lotteryItem.productId || productId,
            unitId: lotteryItem.unitId || "",
            userType: 1,
            storeId: lotteryItem.storeId || "",
            ticketId: ticketId || "", // free ticket package
            campaignId: lotteryItem.campaignId,
            countryId: getCountryId(),
            addToCartOnId: "",
            newQuantity: quantity,
            cartType: 2,
            offers: {},
            storeTypeId: 8,
            action: 1,
            walletTickets: "", // Empty string when ticket price is 0 (free ticket)
            deliveryAddress: getDeliveryAddress(),
            storeCategoryId: STORE_CATEGORY_ID as string,
            ipAddress: ipAddress,
            addressId: getAddressId(defaultAddressId),
            billingAddressId: "",
        };

        // Make API call and return response
        return await OrderService.expressCheckoutRaffle(payload);
    },
};

