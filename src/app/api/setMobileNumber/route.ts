import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { token, phone, countryCode, mobileNumberSortCode } = body;

    console.log("[SetMobileNumber API] Request received", {
      hasToken: !!token,
      phone,
      countryCode,
      mobileNumberSortCode,
    });

    // ✅ Validation
    if (!token || !phone || !countryCode || !mobileNumberSortCode) {
      console.warn("[SetMobileNumber API] Missing required fields", {
        token: !!token,
        phone: !!phone,
        countryCode: !!countryCode,
        mobileNumberSortCode: !!mobileNumberSortCode,
      });

      return NextResponse.json(
        {
          message:
            "Missing required fields (token, phone, countryCode, mobileNumberSortCode)",
        },
        { status: 400 }
      );
    }

    const payload = {
      token,
      phone,
      countryCode,
      mobileNumberSortCode,
    };

    console.log("[SetMobileNumber API] Forwarding payload to backend", {
      phone,
      countryCode,
    });

    // ✅ Call backend
    const { data, error } = await serverFetch("/setMobileNumber", {
      method: "POST",
      body: JSON.stringify(payload),
      baseUrl: API_NY_URL,
    });

    if (error) {
      console.error("[SetMobileNumber API] Backend Error", {
        message: error.message,
        status: error.status,
        phone,
      });

      return NextResponse.json(
        { message: error.message },
        { status: error.status || 500 }
      );
    }

    console.log("[SetMobileNumber API] Success response", {
      phone,
      success: true,
    });

    return NextResponse.json(data);

  } catch (err: any) {
    console.error("[SetMobileNumber API] Fatal Error", {
      message: err?.message,
      stack: err?.stack,
    });

    return NextResponse.json(
      { message: err?.message || "Failed to set mobile number" },
      { status: 500 }
    );
  }
}