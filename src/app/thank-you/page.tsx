"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Home, Package } from "lucide-react";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { OrderService } from "@/src/lib/services/order";
import { getCookie } from "cookies-next";
import { DEFAULT_LANGUAGE } from "@/src/lib/config";

export default function ThankYouPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations();
    const [countdown, setCountdown] = useState(5);

    // Update order status when order is completed
    const orderStatusUpdateFn = async (statusData: number, updateTicketWalletFlag = false) => {
        if (typeof window === "undefined") return;

        const lang = getCookie("lang") || DEFAULT_LANGUAGE;
        const orderId = localStorage.getItem("orderId");
        const cartId = localStorage.getItem("cartId");

        if (!orderId) {
            console.warn("Order ID not found in localStorage");
            return;
        }

        const orderStatusPayload = {
            orderId: orderId,
            statusId: statusData,
            cartId: statusData === 3 ? cartId : null,
        };

        try {
            const res = await OrderService.orderStatusUpdate(orderStatusPayload);
            const { data } = res as any;
            console.log("Order status updated:", data);

            if (!updateTicketWalletFlag) {
                localStorage.removeItem("orderId");
            }
        } catch (err) {
            console.error("Order status update failed:", err);
        }
    };

    useEffect(() => {
        // Update order status to completed (statusId = 3) when order is completed
        const handleOrderCompletion = async () => {
            const payment = searchParams?.get("payment");

            // If payment is from Place to Pay, update status to approved first (statusId = 2)
            // Then update to completed (statusId = 3)
            if (payment === "placetopay") {
                await orderStatusUpdateFn(2); // Approved
            }

            // Always update to completed status (statusId = 3)
            await orderStatusUpdateFn(3); // Completed
        };

        handleOrderCompletion();
    }, [searchParams]);

    useEffect(() => {
        // Countdown timer for auto-redirect
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // Redirect to orders page after countdown
            router.push("/orders");
        }
    }, [countdown, router]);

    return (
        <main>
            <Header />
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
                <div className="max-w-2xl w-full text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#FECB02] rounded-full opacity-20 animate-ping"></div>
                            <div className="relative bg-[#FECB02] rounded-full p-4">
                                <CheckCircle2 className="w-16 h-16 text-[#2F2F2F]" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Main Message */}
                    <h1 className="text-2xl md:text-4xl font-bold text-[#2F2F2F] mb-4">
                        {t("thankYouTitle")}
                    </h1>
                    <p className="text-md text-[#797979] mb-2">
                        {t("thankYouMessage")}
                    </p>
                    <p className="text-sm text-[#999] mb-8">
                        {t("thankYouRedirect", { seconds: countdown })}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 bg-[#FECB02] text-[#2F2F2F] px-8 py-3 rounded-md font-semibold uppercase tracking-wide hover:bg-[#FECB02]/90 transition-colors text-sm sm:text-default"
                        >
                            <Package className="w-5 h-5" />
                            {t("viewOrders")}
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-white border-2 border-[#2F2F2F] text-[#2F2F2F] px-8 py-3 rounded-md font-semibold uppercase tracking-wide hover:bg-[#2F2F2F] hover:text-white transition-colors text-sm sm:text-default"
                        >
                            <Home className="w-5 h-5" />
                            {t("continueToHomepage")}
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 pt-8 border-t border-[#E5E5E5]">
                        <p className="text-sm text-[#797979]">
                            {t("thankYouAdditionalInfo")}
                        </p>
                    </div>
                </div>
            </div>
            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

