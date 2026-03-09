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
   * Get list of user addresses
   */
  getAddresses: (): Promise<UserAddressListResponse> => {
    return apiClient.get("/address");
  },

  /**
   * Delete address by ID (using query param as per API)
   */
  deleteAddress: (id: string) => {
    return apiClient.delete(`/address`, { params: { addressId: id } });
  },

  /**
   * Update address
   */
  updateAddress: (payload: any) => {
    return apiClient.patch(`/address`, payload);
  },

  /**
   * Set default address
   */
  setDefaultAddress: (id: string) => {
    return apiClient.patch(`/address/${id}/default`);
  },

  setDefaultAddress1: (data: any) => {
    return apiClient.patch(`/defaultAddress`, data);
  },
};