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

export interface ISendOtpPayload {
  verifyType: 1 | 2; // 1 = email, 2 = mobile
  email?: string;
  mobile?: string;
  countryCode?: string;
  triggeredBy: string;
}

export interface ISignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: number;
  mobile: string;
  countryCode: string;
  sortCountryCode: string;
  nationality: string;
  termsAndCond: 1;
  userType: number;
  signUpType: number;
  customerType: number;
  googleId?: string;
  facebookId?: string;
}


export interface ICreateAddressRM {
  name: string;
  addLine1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark?: string;

  mobileNumber: string;
  mobileNumberCode: string;
  mobileNumberSortCode: string;

  tagged: number;
  taggedAs?: string;
  default: boolean;
  latitude?: number;
  longitude?: number;
}
