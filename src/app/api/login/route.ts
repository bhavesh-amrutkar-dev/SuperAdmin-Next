import { NextRequest, NextResponse } from "next/server";
import { serverFetch } from "@/src/lib/api/server-api";
import { API_NY_URL } from "@/src/lib/config";
import { resolveIpAddress } from "@/src/lib/utils/ip-resolver";
import { DEVICE_TYPE_WEB, APP_VERSION } from "@/src/lib/config";
import { getDeviceInfo } from "@/src/lib/utils/device";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        // ✅ Extract device info from headers
        const userAgent = request.headers.get("user-agent") || "";

        // ✅ Resolve IP server-side
        const device = getDeviceInfo();

        const ipAddress = await resolveIpAddress();

        const payload = {
            deviceId: `web_app_id_${Date.now()}`,
            deviceType: DEVICE_TYPE_WEB,
            appVersion: APP_VERSION,
            deviceTime: new Date().toISOString(),
            verifyType: 1, // email
            loginType: 1,
            ipAddress,
            latitude: "0.0",
            longitude: "0.0",

            ...device,
            email: email.trim(),
            password: password.trim(),
        };
        console.log(payload);

        const { data, error } = await serverFetch("/signIn", {
            method: "POST",
            body: JSON.stringify(payload),
            baseUrl: API_NY_URL,
        });

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status || 500 }
            );
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json(
            { message: err?.message || "Login failed" },
            { status: 500 }
        );
    }
}