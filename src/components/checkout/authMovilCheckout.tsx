"use client";

import { useEffect, useState } from "react";

interface AthMovilCheckoutProps {
    userProfileData: any;
    myCart: any;
    handleATHmovilePayments?: (data: any) => Promise<void>;
}

export default function AthMovilCheckout({
    userProfileData,
    myCart,
    handleATHmovilePayments,
}: AthMovilCheckoutProps) {
    const [responses, setResponses] = useState<string[]>([]);

    const addResponse = (res: any) => {
        setResponses((prev) => [...prev, typeof res === "string" ? res : JSON.stringify(res)]);
    };

    const cancelATHM = async () => {
        addResponse("Payment cancelled.");
    };

    const authorizationATHM = async () => {
        addResponse("Authorization triggered.");
    };

    const expiredATHM = async () => {
        addResponse("Payment expired.");
    };

    useEffect(() => {
        if (!myCart || !userProfileData) return;

        if (typeof window === "undefined") return;

        window.ATHM_Checkout = {
            env: "production",
            publicToken: document.cookie
                .split("; ")
                .find((row) => row.startsWith("ATHPtoken="))
                ?.split("=")[1],
            timeout: 600,
            theme: "btn-dark",
            lang: "en",
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_WEBSITE}/thank-you`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_WEBSITE}/secure-checkout`,
            total: myCart?.accounting?.finalTotal,
            tax: 0,
            subtotal: myCart?.accounting?.finalTotal,
            items: [
                {
                    name: "amount",
                    quantity: "1",
                    price: "1",
                    tax: "0",
                    metadata: myCart?.accounting?.finalTotal,
                },
            ],
            onCompletedPayment: async (res: any) => {
                addResponse(res);
                if (handleATHmovilePayments) {
                    await handleATHmovilePayments(res);
                }
            },
            onCancelledPayment: async (res: any) => {
                addResponse(res || "Cancelled by user");
            },
            onExpiredPayment: async (res: any) => {
                addResponse(res);
            },
            cancelATHM,
            authorizationATHM,
            expiredATHM,
        };

        if (!document.getElementById("athmovil-sdk")) {
            const script = document.createElement("script");
            script.src = "https://payments.athmovil.com/api/js/athmovil_base.js";
            script.id = "athmovil-sdk";
            document.head.appendChild(script);
        }
    }, [myCart, userProfileData]);

    if (!myCart || !userProfileData) {
        return <div>Loading payment data...</div>;
    }

    return (
        <>
            <div className="ATH_Movil">
                <div id="ATHMovil_Checkout_Button_payment" />
            </div>

            <div
                style={{
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "15px",
                    marginTop: "10px",
                    maxHeight: "300px",
                    overflowY: "auto",
                }}
            >
                {responses.length === 0 ? (
                    <p>No responses yet.</p>
                ) : (
                    responses.map((res, idx) => (
                        <div key={idx} style={{ marginBottom: "10px" }}>
                            <code>{res}</code>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
