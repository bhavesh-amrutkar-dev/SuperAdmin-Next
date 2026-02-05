
import { IAPIResponse } from "@/src/models/api/response/common";
import { apiClient } from "../api/axios";
import { API_ROUTE_GET_CURRENT_USER } from "../api/routes";
import { getDeviceInfo } from "../utils/device";
import { APP_VERSION, DEVICE_TYPE_WEB } from "../config";
import { IEmailLoginRM } from "@/src/models/api/request/auth";
export const AuthService = {
  async login(
    payload: IEmailLoginRM
  ): Promise<IAPIResponse> {
    const device = getDeviceInfo();

    let ipAddress = "0.0.0.0";
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      ipAddress = data.ip
    } catch (e) {
      console.warn("Failed to resolve IP, using fallback");
    }

    return apiClient.post("/signIn", {
      deviceId: `web_app_id_${Date.now()}`,
      deviceType: DEVICE_TYPE_WEB,
      appVersion: APP_VERSION,
      deviceTime: new Date().toISOString(),
      verifyType: 1,
      loginType: 1,
      ipAddress,
      ...device,
      ...payload,
    });
  },
  getCurrentUser(): Promise<IAPIResponse> {
    return apiClient.get(API_ROUTE_GET_CURRENT_USER);
  },
};
