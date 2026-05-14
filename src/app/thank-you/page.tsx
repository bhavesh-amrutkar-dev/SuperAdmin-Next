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

  const [countdown, setCountdown] = useState(10);

  const popupHandledRef = useRef(false);
  const orderHandledRef = useRef(false);

  const payment = searchParams?.get("payment");
  const accessToken = getCookie("access_token");
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
  const isNewUserCreated =
    searchParams?.get("newUser") === "true";
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

    if (accessToken) {
      router.push("/orders");
    } else {
      router.push("/");
    }
  }, [countdown, router]);

  return (
    <main>
      <Header />

      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#FFF8E1] via-white to-[#F3F4F6] py-10 px-4">
        <div className="max-w-xl w-full backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl rounded-3xl p-8 sm:p-10 text-center">

          {/* ✅ Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#FECB02]/30 blur-xl animate-pulse"></div>

              <div className="relative bg-gradient-to-br from-[#FECB02] to-[#FFD84D] rounded-full p-5 shadow-lg">
                <CheckCircle2 className="w-14 h-14 text-[#2F2F2F]" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* ✅ Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            {t("thankYouTitle")}
          </h1>

          {/* ✅ Subtitle */}
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            {t("thankYouMessage")}
          </p>

          {/* ✅ Confirmation Card */}
          <div className="bg-gradient-to-r from-[#FECB02]/10 to-[#FFD84D]/10 border border-[#FECB02]/20 rounded-xl p-4 mb-6 text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">
              {t("orderConfirmed")}
            </p>

            <p>{t("orderEmailConfirmation")}</p>

            {isNewUserCreated && (
              <div className="mt-4 pt-4 border-t border-[#FECB02]/20">
                <p className="font-semibold text-gray-900 mb-1">
                  Account Created Successfully
                </p>

                <p className="text-sm text-gray-600 leading-6">
                  Please check your email to get instructions on how to create your
                  password and access your account. Once you have set up your password,
                  you will be able to view your purchases and future updates.
                </p>
              </div>
            )}
          </div>

          {/* ✅ Countdown */}
          <p className="text-xs text-gray-500 mb-3">
            {t("thankYouRedirect", { seconds: countdown })}
          </p>

          {/* ✅ Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FECB02] to-[#FFD84D] h-full transition-all duration-1000"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>

          {/* ✅ Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">

            {accessToken && (
              <Link
                href="/orders"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FECB02] to-[#FFD84D] text-black px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Package className="w-5 h-5" />
                {t("viewOrders")}
              </Link>
            )}

            <Link
              href="/"
              className="flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <Home className="w-5 h-5" />
              {t("continueToHomepage")}
            </Link>

          </div>

          {/* ✅ Footer text */}
          <p className="mt-8 text-xs text-gray-400">
            {t("thankYouAdditionalInfo")}
          </p>

        </div>
      </div>

      <PreFooterIconModule />
      <Footer />
    </main>
  );
}

