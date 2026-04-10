import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";
import { trackEvent } from "@/src/lib/analytics";

export async function POST(request: NextRequest) {
  trackEvent("ORDER_API_STATUES");
  try {
    const body = await request.json();

    const { data, error } = await serverFetch(
      "/order/statusUpdate/V2",
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

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Status update failed" },
      { status: 500 }
    );
  }
}