export interface BackendOrderResponse {

    message: string;
    data: {
        orderId: string;
        numberOfFreeTickets: number;
        totalAmount: number;
        onlinePaymentMethod: number;
        onlinePaymentMethodText: string;
        checkoutProcessUrl: string;
        cartId: string;

    };
}