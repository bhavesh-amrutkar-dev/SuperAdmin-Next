import { apiClient } from "../api/axios";

export type UserAddress = {
    _id?: string;
    [key: string]: any;
};

export type UserAddressListResponse = {
    data?: UserAddress[];
    [key: string]: any;
};

export const UserAddressService = {
    /**
     * Get list of user addresses (same /address API as old project)
     */
    getAddresses: () => {
        return apiClient.get("/address") as Promise<UserAddressListResponse>;
    },
};
