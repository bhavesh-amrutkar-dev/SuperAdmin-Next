import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, countryCode } = body;

    if (!mobile || !countryCode) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await serverFetch("/customer/emPatchSend", {
      method: "POST",
      body: JSON.stringify({ mobile, countryCode, type: 2 }),
      baseUrl: API_NY_URL,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Failed to send OTP" }, { status: 500 });
  }
}
