import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { message: "orderId is required" },
        { status: 400 }
      );
    }

    const query = new URLSearchParams({
      limit: "10",
      skip: "0",
      orderId,
      type: "masterOrder",
    });

    const { data, error } = await serverFetch(
      `/orders/details?${query.toString()}`,
      {
        method: "GET",
        baseUrl: API_NY_URL,
      }
    );

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Failed to fetch order details" },
      { status: 500 }
    );
  }
}