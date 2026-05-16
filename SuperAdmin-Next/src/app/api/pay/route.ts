import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { token, orderId, authToken } = body;

    // console.log("Square payment request received:", {
    //   orderId,
    //   tokenExists: !!token,
    // });

    if (!token || !orderId) {
      return NextResponse.json(
        { message: "Missing required fields (token, orderId)" },
        { status: 400 }
      );
    }

    const payload = {
      token,
      orderId,
    };

    // console.log("Forwarding payload to backend:", payload);

    const { data, error } = await serverFetch(
      "/create/SquarePayment",
      {
        method: "POST",
        body: JSON.stringify(payload),
        baseUrl: API_NY_URL,
        ...(authToken && {
          overrideAuthToken: `Bearer ${authToken}`,
        }),
      }
    );

    if (error) {
      console.error("Square Payment Backend Error:", error);

      return NextResponse.json(
        { message: error.message },
        { status: error.status || 500 }
      );
    }

    // console.log("Square payment success response:", data);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Square Fatal Error:", err);

    return NextResponse.json(
      { message: err?.message || "Payment failed" },
      { status: 500 }
    );
  }
}