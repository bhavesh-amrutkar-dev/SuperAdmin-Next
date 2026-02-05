// ==============================
// LOGIN
// ==============================
export interface IEmailLoginRM {
  email: string;
  password: string;
  countryCode?: string;
}

// ==============================
// REFRESH TOKEN
// ==============================

export interface IRefreshTokenRM {
  refreshToken: string;
}
