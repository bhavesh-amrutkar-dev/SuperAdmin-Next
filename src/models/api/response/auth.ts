// ==============================
// TOKEN DTO
// ==============================

export interface IAuthTokenDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

// ==============================
// USER DTO
// ==============================

export interface IUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

// ==============================
// LOGIN RESPONSE
// ==============================

export interface ILoginResponseDTO {
  user: IUserDTO;
  token: IAuthTokenDTO;
}

export interface LoginResponse {
  token: {
    accessToken: string;
    refreshToken: string;
  };
  userId: string;
  user: Record<string, any>;
}
