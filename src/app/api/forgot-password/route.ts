import { NextRequest, NextResponse } from "next/server";
import { serverFetch } from "@/src/lib/api/server-api";
import { API_NY_URL, DEVICE_TYPE_WEB } from "@/src/lib/config";
import { generateEmailMk, generateMk } from "@/src/lib/security/generateMk";
import { getDeviceInfo } from "@/src/lib/utils/device";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { verifyType, email, mobile, countryCode } = body;

        if (!verifyType) {
            return NextResponse.json(
                { message: "verifyType is required" },
                { status: 400 }
            );
        }

        if (verifyType === 1 && !email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        if (verifyType === 2 && (!mobile || !countryCode)) {
            return NextResponse.json(
                { message: "Mobile and country code are required" },
                { status: 400 }
            );
        }

        const device = getDeviceInfo();
        const payload: any = {
            deviceId: `web_app_id_${Date.now()}`,
            deviceType: DEVICE_TYPE_WEB,
            deviceMake: device.deviceMake,
            deviceModel: device.deviceModel,
            verifyType,
        };

        // 🔹 Email flow
        if (verifyType === 1) {
            payload.email = email.trim();
            payload.mk = generateEmailMk(email.trim());
        }

        // 🔹 Mobile flow
        if (verifyType === 2) {
            payload.mobile = mobile.trim();
            payload.countryCode = countryCode.trim();
            payload.mk = generateMk(countryCode.trim(), mobile.trim())
        }

        const { data, error } = await serverFetch("/forgotPassword/V2", {
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
            { message: err?.message || "Forgot password failed" },
            { status: 500 }
        );
    }
}