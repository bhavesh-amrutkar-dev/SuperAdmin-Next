import { IAPIResponse } from "@/src/models/api/response/common";
import { apiClient } from "../api/axios";
import { API_ROUTE_CONTACT_FIELDS, API_ROUTE_CONTACT_REQUEST, API_ROUTE_GET_CURRENT_USER } from "../api/routes";
import { getDeviceInfo } from "../utils/device";
import { APP_VERSION, DEVICE_TYPE_WEB } from "../config";

import {
  ICreateAddressRM,
  IEmailLoginRM,
  IMobileLoginRM,
  ISendOtpPayload,
  ISignUpPayload,
  IVerifyOtpRM,
} from "@/src/models/api/request/auth";

import { CountryCurrency, IMobileLoginResponse } from "@/src/models/api/response/auth";
import { resolveIpAddress } from "../utils/ip-resolver";
import { IContactRequestRM } from "@/src/models/api/request/contact";
import { generateEmailMk, generateMk } from "../security/generateMk";

export const AuthService = {
  async login(
    payload: IEmailLoginRM
  ): Promise<IAPIResponse> {
    const device = getDeviceInfo();

    const ipAddress = await resolveIpAddress();

    return apiClient.post("/signIn", {
      deviceId: `web_app_id_${Date.now()}`,
      deviceType: DEVICE_TYPE_WEB,
      appVersion: APP_VERSION,
      deviceTime: new Date().toISOString(),
      verifyType: 1, // email
      loginType: 1,
      ipAddress,
      latitude: "0.0",
      longitude: "0.0",
      ...device,
      ...payload,
    });
  },

  getCurrentUser(): Promise<IAPIResponse> {
    return apiClient.get(API_ROUTE_GET_CURRENT_USER);
  },

  getCurrency(): Promise<IAPIResponse<CountryCurrency[]>> {
    return apiClient.get("/currencies");
  }
  ,

  async mobileLogin(
    payload: IMobileLoginRM
  ): Promise<IAPIResponse<IMobileLoginResponse>> {
    const device = getDeviceInfo();

    const ipAddress = await resolveIpAddress();

    return apiClient.post("/signIn", {
      deviceId: `web_app_id_${Date.now()}`,
      deviceType: DEVICE_TYPE_WEB,
      appVersion: APP_VERSION,
      deviceTime: new Date().toISOString(),
      verifyType: 2, // mobile
      loginType: 1,
      ipAddress,
      ...device,
      ...payload,
    });
  },

  async verifyOtp(
    payload: IVerifyOtpRM
  ): Promise<any> {
    return apiClient.post(
      "/customer/verifyOtp",
      payload
    );
  },

  emailPhoneValidate(payload: {
    verifyType: 1 | 2;
    email?: string;
    mobile?: string;
    countryCode?: string;
  }): Promise<IAPIResponse> {
    return apiClient.post("/emailPhoneValidate", payload);
  }
  ,
  sendOtp(
    payload: ISendOtpPayload
  ): Promise<IAPIResponse<any>> {

    return apiClient.post("/customer/sendOtp", payload);
  },

  async signUp(
    payload: ISignUpPayload
  ): Promise<IAPIResponse> {
    const device = getDeviceInfo();

    let ipAddress = "0.0.0.0";
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      ipAddress = data.ip;
    } catch {
      console.warn("IP resolution failed");
    }

    return apiClient.post("/signUp", {
      deviceId: `web_app_id_${Date.now()}`,
      deviceType: DEVICE_TYPE_WEB,
      appVersion: APP_VERSION,
      deviceTime: new Date().toISOString(),
      ipAddress,
      latitude: "0",
      longitude: "0",
      city: "",
      country: "",
      ...device,
      ...payload,
    });
  },

  async createAddress(
    payload: ICreateAddressRM
  ): Promise<IAPIResponse> {
    const device = getDeviceInfo();

    return apiClient.post("/address", {
      // deviceType: DEVICE_TYPE_WEB,
      // appVersion: APP_VERSION,
      // deviceTime: new Date().toISOString(),
      // ...device,
      ...payload,
    })
  },
  // ✅ Get Dynamic Contact Fields
  async getContactFormFields(storeId: string = "0") {
    return apiClient.get(
      `${API_ROUTE_CONTACT_FIELDS}?storeId=${storeId}&limit=0&skip=0`
    );
  },

  async createContactRequest(
    payload: Omit<IContactRequestRM, "userIP">
  ): Promise<IAPIResponse> {
    const device = getDeviceInfo();
    const ipAddress = await resolveIpAddress();

    return apiClient.post(API_ROUTE_CONTACT_REQUEST, {
      userIP: ipAddress,
      ...device,
      ...payload,
    });
  }
  ,
  async forgotPassword(payload: {
    verifyType: 1 | 2;
    email?: string;
    mobile?: string;
    countryCode?: string;
  }): Promise<IAPIResponse<{
    otpId: string;
    otpExpiryTime: number;
  }>> {
    const device = getDeviceInfo();

    return apiClient.post("/forgotPassword", {
      deviceId: `web_app_id_${Date.now()}`,
      deviceType: DEVICE_TYPE_WEB,
      deviceMake: device.deviceMake,
      deviceModel: device.deviceModel,
      ...payload,
      ...(payload.email && { mk: generateEmailMk(payload.email) }),
    });
  },

  async verifyForgotOtp(payload: {
    otpCode: string;
    otpId: string;
    verifyType: 1 | 2;
  }): Promise<IAPIResponse<{ accessToken: string }>> {
    return apiClient.post("/customer/verifyOtp", payload);
  },

  async resetPassword(payload: {
    newPassword: string;
    resetType: 1 | 3;
  }): Promise<IAPIResponse> {
    return apiClient.post("/resetPassword", payload);
  },
}
