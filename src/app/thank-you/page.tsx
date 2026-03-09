"use client";

import { useEffect, useRef, useState } from "react";
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

  const popupHandledRef = useRef(false);
  const orderHandledRef = useRef(false);

  const payment = searchParams?.get("payment");

  /**
   * Order status update
   */
  const orderStatusUpdateFn = async (
    statusData: number,
    updateTicketWalletFlag = false
  ) => {
    if (typeof window === "undefined") return;

    const lang = getCookie("lang") || DEFAULT_LANGUAGE;
    const orderId = localStorage.getItem("orderId");
    const cartId = localStorage.getItem("cartId");

    if (!orderId) {
      console.warn("Order ID not found in localStorage");
      return;
    }

    const orderStatusPayload = {
      orderId,
      statusId: statusData,
      cartId: statusData === 3 ? cartId : null,
    };

    try {
      // const res = await OrderService.orderStatusUpdate(orderStatusPayload);
      // console.log("Order status updated:", res);

      if (!updateTicketWalletFlag) {
        localStorage.removeItem("orderId");
      }
    } catch (err) {
      console.warn("Order status update failed:", err);
    }
  };

  /**
   * Handle popup communication
   */
  useEffect(() => {
    if (popupHandledRef.current) return;

    if (window.opener && payment === "placetopay") {
      popupHandledRef.current = true;

      window.opener.postMessage(
        { status: "APPROVED" },
        window.location.origin
      );

      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, [payment]);

  /**
   * Handle order completion
   */
  useEffect(() => {
    if (orderHandledRef.current) return;

    const handleOrderCompletion = async () => {
      orderHandledRef.current = true;

      if (payment === "placetopay") {
        await orderStatusUpdateFn(2); // Approved
      }

      await orderStatusUpdateFn(3); // Completed
    };

    handleOrderCompletion();
  }, [payment]);

  /**
   * Countdown redirect
   */
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    router.push("/orders");
  }, [countdown, router]);

  return (
    <main>
      <Header />

      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full text-center">

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FECB02] rounded-full opacity-20 animate-ping"></div>
              <div className="relative bg-[#FECB02] rounded-full p-4">
                <CheckCircle2 className="w-16 h-16 text-[#2F2F2F]" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-[#2F2F2F] mb-4">
            {t("thankYouTitle")}
          </h1>

          <p className="text-md text-[#797979] mb-2">
            {t("thankYouMessage")}
          </p>

          <p className="text-sm text-[#999] mb-8">
            {t("thankYouRedirect", { seconds: countdown })}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 bg-[#FECB02] text-[#2F2F2F] px-8 py-3 rounded-md font-semibold uppercase tracking-wide hover:bg-[#FECB02]/90 transition-colors"
            >
              <Package className="w-5 h-5" />
              {t("viewOrders")}
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white border-2 border-[#2F2F2F] text-[#2F2F2F] px-8 py-3 rounded-md font-semibold uppercase tracking-wide hover:bg-[#2F2F2F] hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              {t("continueToHomepage")}
            </Link>
          </div>

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