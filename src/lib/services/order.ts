import { apiClient } from "../api/axios";

export type OrderStatus = {
    status: number;
    statusName?: string;
    updatedOnTimeStamp?: number;
};

export type OrderProduct = {
    productId?: string;
    campaignId?: string;
    name?: string;
    image?: string | Array<{ small?: string; medium?: string; large?: string; thumbnail?: string }>;
    images?: {
        small?: string;
        thumbnail?: string;
        image?: string;
        medium?: string;
    };
    quantity?: number;
    price?: number;
    totalPrice?: number;
    status?: OrderStatus;
    attributes?: Array<{
        attrname?: string;
        value?: string;
        measurementUnitName?: string;
    }>;
};

export type StoreOrder = {
    storeOrderId?: string;
    storeName?: string;
    storeLogo?: {
        logoImageMobile?: string;
        logoImageweb?: string;
    };
    status?: OrderStatus;
    products?: OrderProduct[];
    accounting?: {
        finalPrice?: number;
        currencyCode?: string | { value?: string; unit?: string };
        currencySymbol?: string | { value?: string; unit?: string };
    };
    storeRattingData?: {
        isRated?: boolean;
        rating?: number;
    };
    driverRattingData?: {
        isRated?: boolean;
        rating?: number;
    };
    createdAt?: number;
    updatedAt?: number;
};

export type Order = {
    orderId?: string;
    masterOrderId?: string;
    storeOrders?: StoreOrder[];
    status?: OrderStatus;
    totalPrice?: number;
    currencyCode?: string | { value?: string; unit?: string };
    currencySymbol?: string | { value?: string; unit?: string };
    createdAt?: number;
    updatedAt?: number;
};

export type OrdersResponse = {
    data: Order[];
    count?: number;
};

export type OrderDetailsResponse = {
    data: Order;
};

export const OrderService = {
    getOrders: (params?: {
        skip?: number;
        limit?: number;
        status?: number;
        search?: string;
        startorderTime?: number;
        endorderTime?: number;
        storeType?: number;
    }) => {
        const queryParams: Record<string, string> = {
            limit: String(params?.limit || 20),
            skip: String(params?.skip || 0),
            status: String(params?.status || 0),
            storeType: String(params?.storeType || 0),
        };

        if (params?.search) {
            queryParams.search = params.search;
        }

        if (params?.startorderTime && params?.endorderTime) {
            queryParams.orderTime = `${params.startorderTime}-${params.endorderTime}`;
        }

        return apiClient.get<OrdersResponse>("/orders", { params: queryParams });
    },

    getOrderDetails: (orderId: string) => {
        const params = {
            limit: "10",
            skip: "0",
            orderId,
            type: "masterOrder",
        };
        return apiClient.get<OrderDetailsResponse>("/orders/details", { params });
    },

    reorder: (data: {
        orderId?: string;
        storeOrderId?: string;
        productOrderId?: string;
    }) => {
        return apiClient.post("/reOrder", data);
    },
};

