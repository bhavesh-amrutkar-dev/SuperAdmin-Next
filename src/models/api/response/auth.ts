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

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  profilePic?: string;
  roleType: number;
  isKYCApproved: boolean;
  accessToken: string;
  refreshToken: string;
  accessExpireAt: number;
}

export type CountryCurrency = {
  _id: string;
  name: string;
  countryCode: string;        // "AU"
  countryCodeAlpha3: string;  // "AUS"
  currencyCode: string;       // "AUD"
  currencyName: string;
  currencySymbol: string;
  countryCodeMobile: string;  // "+61"
  emoji: string;              // 🇦🇺
  ioc: string;
};

export interface IMobileLoginResponse {
  otpId: string;
  otpExpiryTime: number;
}