import { NextRequest, NextResponse } from "next/server";
import { serverFetch } from "@/src/lib/api/server-api";
import { API_NY_URL, DEVICE_TYPE_WEB, APP_VERSION } from "@/src/lib/config";
export async function GET(request: NextRequest) {
    try {

        // ✅ API CALL
        const { data, error } = await serverFetch("/customer/config", {
            method: "GET", // 👈 IMPORTANT
            baseUrl: API_NY_URL
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
            { message: err?.message || "Failed to fetch customer config" },
            { status: 500 }
        );
    }
}