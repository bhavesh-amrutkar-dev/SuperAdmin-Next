import { ILoginRM } from "@/src/models/api/request/auth";
import { ILoginResponseDTO, IUserDTO } from "@/src/models/api/response/auth";
import { IAPIResponse } from "@/src/models/api/response/common";
import { apiClient } from "../api/axios";
import { API_ROUTE_GET_CURRENT_USER, API_ROUTE_SIGNIN } from "../api/routes";
import { getDeviceInfo } from "../utils/device";
import { APP_VERSION, DEVICE_TYPE_WEB } from "../config";

export const AuthService = {
  login: (payload: ILoginRM) => {
    const device = getDeviceInfo();

    const verifyType = payload.email ? 1 : 2;
    const loginType = payload.email ? 1 : 2;

    return apiClient.post("/signIn", {
      deviceId: "web_app_id_" + Date.now(),
      deviceType: DEVICE_TYPE_WEB,
      appVersion: APP_VERSION,
      deviceTime: new Date().toISOString(),
      verifyType,
      loginType,
      ipAddress: "0.0.0.0",
      ...device,
      ...payload,
    });
  },

  getCurrentUser: () =>
    apiClient.get<IAPIResponse<IUserDTO>>(
      API_ROUTE_GET_CURRENT_USER
    ),
};
