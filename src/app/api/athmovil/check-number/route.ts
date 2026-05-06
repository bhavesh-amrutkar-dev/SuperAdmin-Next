import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

const ENDPOINT = "/checkAthMovilNumber";

export async function GET(request: NextRequest) {
    const requestId = crypto.randomUUID(); // trace id

    try {

        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
        const athMovilNumber = searchParams.get("athMovilNumber");

        // 🔸 Validation
        if (!email || !athMovilNumber) {
            console.warn(`[${requestId}] ❌ Missing params`);

            return NextResponse.json(
                { message: "email and athMovilNumber are required" },
                { status: 400 }
            );
        }

        const apiUrl = `${ENDPOINT}?email=${encodeURIComponent(email)}&athMovilNumber=${encodeURIComponent(athMovilNumber)}`;

        const startTime = Date.now();

        const { data, error } = await serverFetch(apiUrl, {
            method: "GET",
            baseUrl: API_NY_URL,
        });

        const duration = Date.now() - startTime;


        // 🔴 Handle API error
        if (error) {
            let parsedMessage = "Internal server error";

            try {
                // Try parsing stringified JSON
                const parsed =
                    typeof error.message === "string"
                        ? JSON.parse(error.message)
                        : error.message;

                parsedMessage = parsed?.message || parsedMessage;
            } catch {
                // fallback if not JSON
                parsedMessage =
                    typeof error.message === "string"
                        ? error.message
                        : JSON.stringify(error.message);
            }

            return NextResponse.json(
                {
                    message: parsedMessage,
                    success: false,
                },
                { status: error.status || 500 }
            );
        }


        return NextResponse.json(data);
    } catch (err: any) {
        console.warn(`[${requestId}] 💥 Unhandled Error`, {
            message: err?.message,
            stack: err?.stack,
            raw: err,
        });

        return NextResponse.json(
            {
                message: err?.message || "Internal server error",
                requestId,
            },
            { status: 500 }
        );
    }
}

