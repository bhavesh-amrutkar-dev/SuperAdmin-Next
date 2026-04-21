export interface BackendOrderResponse {
  msg: string;
  data: {
    cartId: string;
    orderDetails: {
      message: string;
      data: {
        orderId: string;
        numberOfFreeTickets: number;
        totalAmount: number;
        onlinePaymentMethod: number;
        onlinePaymentMethodText: string;
        checkoutProcessUrl: string;
      };
    };
  };
}