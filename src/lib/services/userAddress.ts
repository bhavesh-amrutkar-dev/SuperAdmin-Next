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
    deleteAddress: (id: string) => apiClient.delete(`/address/${id}`),
    updateAddress: (id: string, payload: any) =>
        apiClient.put(`/address/${id}`, payload),
    setDefaultAddress: (id: string) =>
        apiClient.patch(`/address/${id}/default`),

};
