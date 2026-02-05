import { ILoginResponseDTO, IUserDTO } from "@/src/models/api/response/auth";
import { IAPIResponse } from "@/src/models/api/response/common";
import { apiClient } from "../api/axios";
import { API_ROUTE_GET_CURRENT_USER, API_ROUTE_SIGNIN } from "../api/routes";
import { getDeviceInfo } from "../utils/device";
import { APP_VERSION, DEVICE_TYPE_WEB } from "../config";
import { IEmailLoginRM } from "@/src/models/api/request/auth";
import { LocationService } from "./address";

export const AuthService = {
  async login(payload: IEmailLoginRM) {
    const device = getDeviceInfo();

    let ipAddress = "0.0.0.0";
    try {
      ipAddress = await LocationService.getMyIP();
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

  getCurrentUser: () =>
    apiClient.get<IAPIResponse<IUserDTO>>(
      API_ROUTE_GET_CURRENT_USER
    ),
};
