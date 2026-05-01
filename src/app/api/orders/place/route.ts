import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

interface BackendOrderResponse {
  message: string;
  data: {
    orderId: string;
    numberOfFreeTickets: number;
    checkoutProcessUrl: string;
    onlinePaymentMethod: number;
    onlinePaymentMethodText: string;
    totalAmount?: number;
    timeOut?: number | string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await serverFetch<BackendOrderResponse>(
      "/order/web",
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

    // Safety check
    if (!data?.data) {
      return NextResponse.json(
        { message: "Invalid order response from backend" },
        { status: 500 }
      );
    }


    // ✅ Return flattened object
    return NextResponse.json(data.data);

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
