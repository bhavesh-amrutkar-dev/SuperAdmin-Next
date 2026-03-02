import { NextRequest, NextResponse } from "next/server";
import { serverFetch } from "@/src/lib/api/server-api";
import { API_NY_URL, DEVICE_TYPE_WEB, APP_VERSION } from "@/src/lib/config";
import { resolveIpAddress } from "@/src/lib/utils/ip-resolver";
import { getDeviceInfo } from "@/src/lib/utils/device";
import { generateMk } from "@/src/lib/security/generateMk";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mobile, countryCode } = body;

        if (!mobile || !countryCode) {
            return NextResponse.json(
                { message: "Mobile and country code are required" },
                { status: 400 }
            );
        }
        const device = getDeviceInfo();

        const ipAddress = await resolveIpAddress();

        const payload = {
            deviceId: `web_app_id_${Date.now()}`,
            deviceType: DEVICE_TYPE_WEB,
            appVersion: APP_VERSION,
            deviceTime: new Date().toISOString(),
            verifyType: 2,
            loginType: 1,
            ipAddress,
            latitude: "0.0",
            longitude: "0.0",
            ...device,
            mobile: mobile.trim(),
            countryCode: countryCode.trim(),
            mk: generateMk(countryCode, mobile),
        };

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
            { message: err?.message || "Mobile login failed" },
            { status: 500 }
        );
    }
}