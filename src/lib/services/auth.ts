import { ILoginRM } from "@/src/models/api/request/auth";
import { ILoginResponseDTO, IUserDTO } from "@/src/models/api/response/auth";
import { IAPIResponse } from "@/src/models/api/response/common";
import { apiClient } from "../api/axios";
import { API_ROUTE_GET_CURRENT_USER, API_ROUTE_SIGNIN } from "../api/routes";

export const AuthService = {
  login: (payload: ILoginRM) =>
    apiClient.post<IAPIResponse<ILoginResponseDTO>>(
      API_ROUTE_SIGNIN,
      payload
    ),

  getCurrentUser: () =>
    apiClient.get<IAPIResponse<IUserDTO>>(
      API_ROUTE_GET_CURRENT_USER
    ),
};
