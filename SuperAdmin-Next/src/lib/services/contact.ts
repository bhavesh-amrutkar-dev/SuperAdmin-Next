import { apiClient } from "../api/axios";

export const ContactService = {
    getContactFields: (options?: { signal?: AbortSignal }) => {
        return apiClient.get("/contactFormFields", {
            params: {
                storeId: "0",
                limit: 0,
                skip: 0,
            },
            signal: options?.signal,
        });
    },

    submitContactForm: (
        payload: any,
        options?: { signal?: AbortSignal }
    ) => {
        return apiClient.post("/contactRequest", payload, {
            signal: options?.signal,
        });
    },
};