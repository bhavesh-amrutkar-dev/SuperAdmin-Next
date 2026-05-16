import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, validateType } = body;

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    const { data, error } = await serverFetch("/validatePasswordToken", {
      method: "POST",
      body: JSON.stringify({ token, validateType }),
      baseUrl: API_NY_URL,
    });

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status || 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Validation failed" },
      { status: 500 }
    );
  }
}