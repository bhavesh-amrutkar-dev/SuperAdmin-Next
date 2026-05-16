import { apiClient } from "../api/axios";

export type CountryApiItem = {
    _id: string;
    countryName: string;
    countryCode: string;
    flagImage?: string;
};

export const CountryService = {
    getCountries: () => apiClient.get("/country") as Promise<{ data: CountryApiItem[] }>,
};