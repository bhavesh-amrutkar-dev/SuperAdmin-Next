import { apiClient } from "../api/axios";
import { APP_VERSION, DEVICE_TYPE_WEB } from "../config";
import { getDeviceInfo } from "../utils/device";

export const GuestService = {
    initGuest: () => {
        const device = getDeviceInfo();

        return apiClient.post("/guest/signIn", {
            deviceId: "web_app_id" + Date.now(),
            deviceType: DEVICE_TYPE_WEB,
            appVersion: APP_VERSION,
            deviceTime: new Date().toISOString(),
            ...device,
        });
    },
};
