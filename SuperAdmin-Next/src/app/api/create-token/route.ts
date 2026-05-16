import { cookies } from "next/headers";
import { encryptPaymentToken } from "@/src/lib/security/paymentToken";

export async function POST(req: Request) {
    const body = await req.json();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("token")?.value;

    if (!accessToken) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = encryptPaymentToken({
        orderId: body.orderId,
        amount: body.amount,
        accessToken,
        exp: Date.now() + 10 * 60 * 1000
    });

    

    return Response.json({ token });
}