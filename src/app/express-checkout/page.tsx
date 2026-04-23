"use client";

import { useRouter } from "next/navigation";
import ExpressRegisterForm from "@/src/components/express/ExpressRegisterForm";
import Footer from "@/src/components/layout/Footer";
import Header from "@/src/components/layout/Header";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import ExpressCart from "@/src/components/express/ExpressCart";
import { MiniCart } from "@/src/components/express/MiniCart";
import { useCart } from "@/src/components/express/useCart";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { PaymentMethods } from "@/src/components/express/PaymentMethods";
import AthMovilPayment from "@/src/components/payments/AuthMovilPayment";

export default function ExpressCheckoutPage() {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);
    const [athToken, setAthToken] = useState<string | null>(null);
    const [athOrderId, setAthOrderId] = useState<string | null>(null);
    const [isAthReady, setIsAthReady] = useState(false);
    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
    };

    const handlePlaceOrder = async () => {
        if (!paymentMethod) {
            alert("Select payment method");
            return;
        }

        const cartId = cartItems?.[0]?.cartId;
        if (!cartId) {
            alert("Cart not found");
            return;
        }

        setPlacingOrder(true);

        try {
            const addressId = getCookie("addressid");

            const orderPayload = {
                cartId,
                addressId,
                billingAddressId: addressId,
                onlinePaymentMethod:
                    paymentMethod === "athMovil" ? 10 :
                        paymentMethod === "square" ? 21 : 18,
            };

            const res = await fetch("/api/orders/place", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderPayload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Order failed");
            }

            // 🔥 PAYMENT HANDLING

            if (paymentMethod === "athMovil") {
                await handleAthMovilFlow(data);
                return;
            }

            if (paymentMethod === "square") {
                if (!data.checkoutProcessUrl) {
                    throw new Error("Missing payment URL");
                }

                window.location.href = data.checkoutProcessUrl;
                return;
            }

        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally {
            setPlacingOrder(false);
        }
    };
    const handleAthMovilFlow = async (orderData: any) => {
        try {
            const tokenRes = await fetch("/api/payment/ath-token");
            const tokenData = await tokenRes.json();

            const token = tokenData?.publicToken;

            if (!token) throw new Error("Token missing");

            setAthToken(token);
            setAthOrderId(orderData.orderId);
            setIsAthReady(true);

        } catch (e) {
            console.error("ATH error", e);
            alert("ATH payment failed");
        }
    };
    const handleExpressRegister = async (payload: any) => {
        try {
            console.log("Submitting express register:", payload);

            // 👉 Call your API
            const res = await fetch("/api/express-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error?.message || "Something went wrong");
            }

            const data = await res.json();
            console.log("Success:", data);

            // 👉 Redirect to payment / success page
            router.push(`/checkout/payment?cartId=${payload.cartId}`);
        } catch (err: any) {
            console.error("Express register failed:", err.message);

            // 👉 Optional: show toast
            alert(err.message || "Failed to continue checkout");
        }
    };
    const {
        cartItems,
        updating,
        updateQuantity,
        getProductImage,
        formatCurrency,
    } = useCart();
    const grandTotal = cartItems.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        return sum + price * qty;
    }, 0);


    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">

                    {/* LEFT */}
                    <div className="space-y-6">
                        <MiniCart
                            cartItems={cartItems}
                            updateQuantity={updateQuantity}
                            updating={updating}
                            getProductImage={getProductImage}
                            formatCurrency={formatCurrency}
                        />

                        {!getCookie("access_token") && (
                            <ExpressRegisterForm onSubmit={handleExpressRegister} isRaffle={true} />
                        )}
                        {/* 
                        <BillingDetails
                            selectedAddress={selectedAddress}
                            onEdit={handleEditShipping}
                        /> */}
                    </div>

                    {/* RIGHT */}
                    <div className="sticky top-6 h-fit">
                        <PaymentMethods
                            grandTotal={grandTotal}
                            paymentMethod={paymentMethod}
                            onSelect={handlePaymentMethodChange}
                            onPlaceOrder={handlePlaceOrder}
                            placingOrder={placingOrder}
                        />
                    </div>

                </div>
                {paymentMethod === "athMovil" && isAthReady && athToken && athOrderId && (
                    <AthMovilPayment
                        total={grandTotal}
                        publicToken={athToken}   // ✅ FIXED
                        orderId={athOrderId}
                        userId={(getCookie("uid") as string) || ""}
                        onSuccess={async () => {
                            setIsAthReady(false);
                            router.push("/thank-you?payment=athmovil");
                        }}
                        onCancel={async () => {
                            setIsAthReady(false);
                        }}
                    />
                )}
                  
            </div>
            {/* <ExpressCart />
      <ExpressRegisterForm onSubmit={handleExpressRegister}  /> */}
            <PreFooterIconModule />
            <Footer />
        </>
    );
}