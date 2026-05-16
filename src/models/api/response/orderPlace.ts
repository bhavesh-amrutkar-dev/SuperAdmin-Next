export interface PlaceOrderSuccess {
  orderId: string;
  numberOfFreeTickets: number;
  checkoutProcessUrl: string;
  onlinePaymentMethod: number;
  onlinePaymentMethodText: string;
}

export interface PlaceOrderError {
  message: string;
}

export type PlaceOrderResponse = PlaceOrderSuccess | PlaceOrderError;