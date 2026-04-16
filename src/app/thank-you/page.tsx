"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Home, Package } from "lucide-react";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { getCookie } from "cookies-next";
import { DEFAULT_LANGUAGE } from "@/src/lib/config";
import { trackEvent } from "@/src/lib/analytics";

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
      // await OrderService.orderStatusUpdate(orderStatusPayload);

      if (!updateTicketWalletFlag) {
        localStorage.removeItem("orderId");
      }
    } catch (err) {
      console.warn("Order status update failed:", err);
    }
  };

  /**
   * Handle popup communication (PlaceToPay only)
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
        await orderStatusUpdateFn(2);
        await orderStatusUpdateFn(3);
      } else if (payment === "square") {
         trackEvent("PAYMENT_SUCCESS");
        await orderStatusUpdateFn(3);
      } else {
        await orderStatusUpdateFn(3);
      }
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

      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA] py-16 px-4">
        <div className="max-w-xl w-full bg-white shadow-xl rounded-2xl p-10 text-center">

          {/* Success Icon */}
          <div className="relative flex justify-center mb-8">
            <div className="absolute w-24 h-24 bg-[#FECB02]/20 rounded-full animate-pulse"></div>

            <div className="relative bg-[#FECB02] rounded-full p-5 shadow-lg">
              <CheckCircle2
                className="w-14 h-14 text-[#2F2F2F]"
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#2F2F2F] mb-3">
            {t("thankYouTitle")}
          </h1>

          {/* Message */}
          <p className="text-md text-[#6B6B6B] mb-4">
            {t("thankYouMessage")}
          </p>

          {/* Confirmation box */}
          <div className="bg-[#FAFAFA] rounded-lg p-4 mb-6 text-sm text-[#555]">
            <p className="font-semibold mb-1">
              {t("orderConfirmed")}
            </p>

            <p>
              {t("orderEmailConfirmation")}
            </p>
          </div>

          {/* Redirect countdown */}
          <p className="text-sm text-[#777] mb-3">
            {t("thankYouRedirect", { seconds: countdown })}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-8">
            <div
              className="bg-[#FECB02] h-1 rounded-full transition-all"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 bg-[#FECB02] text-[#2F2F2F] px-6 py-3 rounded-lg font-semibold shadow hover:shadow-md transition"
            >
              <Package className="w-5 h-5" />
              {t("viewOrders")}
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 border border-[#2F2F2F] px-6 py-3 rounded-lg font-semibold hover:bg-[#2F2F2F] hover:text-white transition"
            >
              <Home className="w-5 h-5" />
              {t("continueToHomepage")}
            </Link>

          </div>

          {/* Footer message */}
          <div className="mt-10 text-xs text-[#999]">
            {t("thankYouAdditionalInfo")}
          </div>

        </div>
      </div>

      <PreFooterIconModule />
      <Footer />
    </main>
  );
}

