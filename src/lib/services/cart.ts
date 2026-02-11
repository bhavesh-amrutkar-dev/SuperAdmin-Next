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
    userType?: number;
    storeId?: string;
    ticketId?: string | null;
    campaignId?: string;
    countryId?: string;
    newQuantity: number;
    action: number; // 1 = add, 2 = update, 3 = delete
    cartType?: number;
    typeOfCart?: number;
    offers?: Record<string, any>;
    storeCategoryId?: string;
    storeTypeId?: number;
    deliveryAddress?: {
        latitude: string;
        longitude: string;
    };
    deliveryAddressId?: string;
    addToCartOnId?: string;
    cartStatus?: string; // e.g., "removedcart" for remove action
};

export const CartService = {
    addToCart: (payload: AddToCartPayload) => {
        const finalPayload: AddToCartPayload = {
            ...payload,
            storeCategoryId: payload.storeCategoryId || DEFAULT_STORE_CATEGORY_ID,
            countryId: payload.countryId || getCountryId(),
            cartType: payload.cartType || 2,
            typeOfCart: payload.typeOfCart !== undefined ? payload.typeOfCart : (payload.action === 3 ? 1 : undefined),
            storeTypeId: payload.storeTypeId !== undefined ? payload.storeTypeId : (payload.action === 3 ? 1 : 8),
            userType: payload.userType || 1,
            deliveryAddress: payload.deliveryAddress || {
                latitude: (getCookie("lat") as string) || "0",
                longitude: (getCookie("long") as string) || "0",
            },
            deliveryAddressId: payload.deliveryAddressId !== undefined ? payload.deliveryAddressId : (getCookie("addressid") as string) || "",
            addToCartOnId: payload.addToCartOnId ? String(payload.addToCartOnId) : payload.addToCartOnId,
        };

        return apiClient.post("/cart", finalPayload);
    },

    getCart: () => {
        // Match old project's logic for address ID
        const addressIdCookie = getCookie("AddressID") as string | undefined;
        const addressidCookie = getCookie("addressid") as string | undefined;
        const applyingCheck = getCookie("appyingCheck");

        let addressId = "";
        if (addressIdCookie && addressIdCookie !== "undefined" && addressIdCookie !== "") {
            addressId = applyingCheck === "1" ? addressIdCookie : (addressidCookie || "");
        } else {
            addressId = addressidCookie || "";
        }

        // Handle lat/long - check for null/undefined strings
        const latCookie = getCookie("lat") as string | undefined;
        const longCookie = getCookie("long") as string | undefined;
        const lat = (latCookie && latCookie !== 'null' && latCookie !== 'undefined') ? latCookie : "0";
        const long = (longCookie && longCookie !== 'null' && longCookie !== 'undefined') ? longCookie : "0";

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

