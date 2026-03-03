import { NextRequest, NextResponse } from "next/server";
import { API_NY_URL } from "@/src/lib/config";
import { serverFetch } from "@/src/lib/api/server-api";
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log(body);

        const { data, error } = await serverFetch(
            "/order/V2",
            {
                method: "POST",
                body: JSON.stringify(body),
                baseUrl: API_NY_URL,
            }
        );
        if (error) {
            console.log("ORDER BACKEND ERROR:", error);
            return NextResponse.json(
                { message: error.message },
                { status: error.status || 500 }
            );
        }


        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json(
            { message: err?.message || "Place order failed" },
            { status: 500 }
        );
    }
}