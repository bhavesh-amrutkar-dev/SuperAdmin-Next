import { apiClient } from "../api/axios";
import { getCookie } from "cookies-next";
import { STORE_CATEGORY_ID } from "@/src/lib/config";

const DEFAULT_COUNTRY_ID = "633a6c3dd17f0000ea00102e";
const DEFAULT_STORE_CATEGORY_ID = STORE_CATEGORY_ID as string;

const getCountryId = (): string => {
    const cookieCountryId = getCookie("C_id") as string | undefined;
    return cookieCountryId || DEFAULT_COUNTRY_ID;
};

export type AddToCartPayload = {
    centralProductId?: string;
    productId: string;
    unitId?: string;
    storeId?: string;
    ticketId?: string | null;
    campaignId?: string;
    countryId?: string;
    newQuantity: number;
    action: number; // 1 = add, 2 = update, 3 = delete
    cartType?: number;
    offers?: Record<string, any>;
    storeCategoryId?: string;
    storeTypeId?: number;
    deliveryAddress?: {
        latitude: string;
        longitude: string;
    };
    addToCartOnId?: string;
};

export const CartService = {
    addToCart: (payload: AddToCartPayload) => {
        const finalPayload: AddToCartPayload = {
            ...payload,
            storeCategoryId: payload.storeCategoryId || DEFAULT_STORE_CATEGORY_ID,
            countryId: payload.countryId || getCountryId(),
            cartType: payload.cartType || 2,
            storeTypeId: payload.storeTypeId || 8,
            deliveryAddress: payload.deliveryAddress || {
                latitude: (getCookie("lat") as string) || "0",
                longitude: (getCookie("long") as string) || "0",
            },
        };

        return apiClient.post("/cart", finalPayload);
    },

    getCart: () => {
        const lat = (getCookie("lat") as string) || "0";
        const long = (getCookie("long") as string) || "0";
        const addressId = (getCookie("AddressID") as string) || (getCookie("addressid") as string) || "";

        return apiClient.get(
            `/cart?storeCategoryId=${DEFAULT_STORE_CATEGORY_ID}&deliveryAddressLatitude=${lat}&deliveryAddressLongitude=${long}&deliveryAddressId=${addressId}&deliveryFeeCalculate=1`
        );
    },
};

export type ExpressOrderPayload = {
    centralProductId?: string;
    productId: string;
    unitId?: string;
    userType?: number;
    storeId?: string;
    ticketId?: string;
    campaignId?: string;
    countryId?: string;
    addToCartOnId?: string;
    newQuantity: number;
    cartType?: number;
    offers?: Record<string, any>;
    storeTypeId?: number;
    action?: number;
    walletTickets?: number | string; // Ticket quantity when using tickets
    deliveryAddress?: {
        latitude: string;
        longitude: string;
    };
    storeCategoryId?: string;
    ipAddress?: string;
    addressId?: string;
    billingAddressId?: string;
};

export const OrderService = {
    expressCheckoutRaffle: (payload: ExpressOrderPayload) => {
        const finalPayload: ExpressOrderPayload = {
            ...payload,
            storeCategoryId: payload.storeCategoryId || DEFAULT_STORE_CATEGORY_ID,
            countryId: payload.countryId || getCountryId(),
            cartType: payload.cartType || 2,
            storeTypeId: payload.storeTypeId || 8,
            action: payload.action || 1,
            userType: payload.userType || 1,
            deliveryAddress: payload.deliveryAddress || {
                latitude: (getCookie("lat") as string) || "0",
                longitude: (getCookie("long") as string) || "0",
            },
        };

        return apiClient.post("/expressOrder", finalPayload);
    },
};

