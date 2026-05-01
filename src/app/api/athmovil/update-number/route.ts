import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";
const ENDPOINT = "/updateAthMovilNumber";

export async function PATCH(request: NextRequest) {
    const requestId = crypto.randomUUID(); // ✅ track each request

    try {
        console.log(`[ATH][${requestId}] 🔹 PATCH request received`);

        const body = await request.json();
        console.log(`[ATH][${requestId}] 📦 Request body:`, body);

        // ✅ Step 1: Validate input
        if (!body?.email || !body?.athMovilNumber) {
            console.warn(`[ATH][${requestId}] ❌ Missing required fields`, {
                email: body?.email,
                athMovilNumber: body?.athMovilNumber,
            });

            return NextResponse.json(
                { message: "email and athMovilNumber are required" },
                { status: 400 }
            );
        }

        console.log(`[ATH][${requestId}] ✅ Validation passed`);

        // ✅ Step 2: Call backend API
        console.log(`[ATH][${requestId}] 🌐 Calling serverFetch...`);

        const { data, error } = await serverFetch(ENDPOINT, {
            method: "PATCH",
            body: JSON.stringify(body),
            baseUrl: API_NY_URL,
        });

        // ✅ Step 3: Handle backend error
        if (error) {
            console.error(`[ATH][${requestId}] ❌ Backend error`, {
                message: error.message,
                status: error.status,
            });

            return NextResponse.json(
                { message: error.message },
                { status: error.status || 500 }
            );
        }

        console.log(`[ATH][${requestId}] ✅ Backend success`, data);

        // ✅ Step 4: Success response
        return NextResponse.json(data);

    } catch (err) {
        console.error(`[ATH][${requestId}] 💥 Exception occurred`, err);

        return NextResponse.json(
            {
                message:
                    err instanceof Error
                        ? err.message
                        : "ATH Móvil number update failed",
            },
            { status: 500 }
        );
    }
}
