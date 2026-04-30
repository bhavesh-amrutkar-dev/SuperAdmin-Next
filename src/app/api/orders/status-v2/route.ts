import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { data, error } = await serverFetch(
            "/order/statusUpdate/V2",
            {
                method: "POST",
                body: JSON.stringify(body),
                baseUrl: API_NY_URL,
            }
        );

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status || 500 }
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : "Order status polling failed" },
            { status: 500 }
        );
    }
}
