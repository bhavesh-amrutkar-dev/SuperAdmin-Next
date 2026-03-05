import { NextRequest, NextResponse } from "next/server";
import { generateMk } from "@/src/lib/security/generateMk";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, mobile, email } = body;

    if (!countryCode || !mobile || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const payload = {
      verifyType: 2,
      countryCode,
      mobile,
      email,
      triggeredBy: "Customer Signup Verification Code",
      mk: generateMk(countryCode, mobile),
    };
    // console.log(payload);

    // console.log("========== SEND OTP REQUEST ==========");
    // console.log("URL:", `${API_NY_URL}/customer/sendOtp`);
    // console.log("Method: POST");
    // console.log("Body:", payload);
    // console.log("======================================");

    const { data, error } = await serverFetch(
      "/customer/sendOtp",
      {
        method: "POST",
        body: JSON.stringify(payload),
        baseUrl: API_NY_URL,
      }
    );

    if (error) {
      console.error("OTP Error:", error);
      // let err1 = JSON.parse(error.message);
      // console.log("err1", err1);
      
      return NextResponse.json(
          { message: error.message },
        { status: error.status || 500 }
      );
    }

    console.log("OTP Response:", data);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("OTP Fatal Error:", err);

    return NextResponse.json(
      { message: err?.message || "OTP sending failed" },
      { status: 500 }
    );
  }
}