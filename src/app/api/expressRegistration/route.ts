import { serverFetch } from "@/src/lib/api/server-api";
import { API_NY_URL } from "@/src/lib/config";
import { BackendOrderResponse } from "@/src/models/api/response/expressRegistration";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await serverFetch<BackendOrderResponse>(
      "/expressRegistration",
      {
        method: "POST",
        body: JSON.stringify(body),
        baseUrl: API_NY_URL,
      }
    );

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status || 500 }
      );
    }

    const orderData = data?.data?.orderDetails?.data;

    if (!orderData) {
      return NextResponse.json(
        { message: "Invalid order response from backend" },
        { status: 500 }
      );
    }

    // ✅ Flattened response for frontend
    return NextResponse.json({
      cartId: data.data.cartId,
      orderId: orderData.orderId,
      totalAmount: orderData.totalAmount,
      freeTickets: orderData.numberOfFreeTickets,
      paymentMethod: orderData.onlinePaymentMethod,
      paymentMethodText: orderData.onlinePaymentMethodText,
      checkoutUrl: orderData.checkoutProcessUrl,
    });

  } catch (err: unknown) {
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Place order failed",
      },
      { status: 500 }
    );
  }
}