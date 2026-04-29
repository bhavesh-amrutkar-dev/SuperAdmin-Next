import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, newPassword, token } = body;

    // console.log("[SetPassword API] Request received", {
    //   email,
    //   hasToken: !!token,
    //   passwordLength: newPassword?.length,
    // });

    // ✅ Validation
    if (!email || !newPassword) {
      console.warn("[SetPassword API] Missing required fields", {
        emailExists: !!email,
        passwordExists: !!newPassword,
      });

      return NextResponse.json(
        { message: "Missing required fields (email, newPassword)" },
        { status: 400 }
      );
    }

    const payload = {
      email,
      newPassword,
      token
    };

    // console.log("[SetPassword API] Forwarding payload to backend", {
    //   email,
    // });

    // ✅ Call backend
    const { data, error } = await serverFetch(
      "/setPassword",
      {
        method: "POST",
        body: JSON.stringify(payload),
        baseUrl: API_NY_URL,
      }
    );

    if (error) {
      console.error("[SetPassword API] Backend Error", {
        message: error.message,
        status: error.status,
        email,
      });

      return NextResponse.json(
        { message: error.message },
        { status: error.status || 500 }
      );
    }

    // console.log("[SetPassword API] Success response", {
    //   email,
    //   success: true,
    // });

    return NextResponse.json(data);

  } catch (err: any) {
    console.error("[SetPassword API] Fatal Error", {
      message: err?.message,
      stack: err?.stack,
    });

    return NextResponse.json(
      { message: err?.message || "Failed to set password" },
      { status: 500 }
    );
  }
}