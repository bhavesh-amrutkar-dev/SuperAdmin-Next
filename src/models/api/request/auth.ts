// ==============================
// LOGIN
// ==============================
export interface IEmailLoginRM {
  email: string;
  password: string;
  countryCode?: string;
}

export interface IMobileLoginRM {
  mobile: string;
  countryCode: string;
}

// ==============================
// REFRESH TOKEN
// ==============================

export interface IRefreshTokenRM {
  refreshToken: string;
}


export interface IVerifyOtpRM {
  otpCode: string;
  otpId: string;
  verifyType: number;
}

