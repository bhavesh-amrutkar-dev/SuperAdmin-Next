// ==============================
// LOGIN
// ==============================
export interface ILoginRM {
  email?: string;
  password?: string;
  mobile?: string;
  countryCode?: string;
}

// ==============================
// REFRESH TOKEN
// ==============================

export interface IRefreshTokenRM {
  refreshToken: string;
}
