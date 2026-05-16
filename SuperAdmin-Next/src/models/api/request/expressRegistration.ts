// ==============================
// EXPRESS REGISTRATION / PLACE ORDER
// ==============================

export interface IExpressRegistrationRM {
  cartId: string;

  email: string;
  phone: string;
  countryCode: string;
  mobileNumberSortCode: string;

  isRaffle?: boolean;

  // 🏠 Address (required if isRaffle = false)
  addLine1?: string;
  addLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  addressPostCode?: string;

  default?: boolean;

  firstName: string;
  lastName: string;

  promoId?: string;
  extraNote?: string;

  tip?: number;

  paymentType: 0 | 1 | 2 | 3;
  onlinePaymentMethod?: 0 | 10 | 12 | 21 | -1;

  payByWallet?: boolean;
  payByRewardWallet?: boolean;

  coupon?: string;

  discount: number;

  latitude: number;
  longitude: number;

  ipAddress: string;

  storeType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 23;

  delivery?: IExpressDeliveryItem[];

  orderImages?: string[];

  orderType?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export interface IExpressDeliveryItem {
  storeId: string;

  productId?: string[];

  type: 1 | 2;

  requestedTime?: Date | string;

  slotId?: string;
}