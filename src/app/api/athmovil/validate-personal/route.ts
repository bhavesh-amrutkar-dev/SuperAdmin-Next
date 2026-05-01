import { NextRequest, NextResponse } from "next/server";

const ATH_VALIDATE_URL = "https://payments.athmovil.com/api/business-customer/user/validate-personal";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body?.publicToken || !body?.phoneNumber) {
            return NextResponse.json(
                { message: "publicToken and phoneNumber are required" },
                { status: 400 }
            );
        }

        const response = await fetch(ATH_VALIDATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                publicToken: body.publicToken,
                phoneNumber: body.phoneNumber,
            }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            return NextResponse.json(
                { message: data?.message || "ATH Móvil validation failed", data },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : "ATH Móvil validation failed" },
            { status: 500 }
        );
    }
}
