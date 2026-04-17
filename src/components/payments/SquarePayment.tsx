"use client";

import { useEffect, useRef, useState } from "react";
import { getSquareConfig } from "@/src/lib/config/square";
import {
  PaymentForm,
  CreditCard,
  GooglePay,
  ApplePay,
} from "react-square-web-payments-sdk";
import { useTranslations } from "next-intl";

interface SquarePaymentProps {
  amount: number;
  orderId: string;
  authToken: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function SquarePayment({
  amount,
  orderId,
  authToken,
  onSuccess,
  onError,
}: SquarePaymentProps) {
  const { appId, locationId, cashAppPayScript } = getSquareConfig();
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [applePaySupported, setApplePaySupported] = useState(false);
  const [googlePaySupported, setGooglePaySupported] = useState(false);
  const [cashAppReady, setCashAppReady] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cashAppRef = useRef<any>(null);

  const isBusy = loading || isProcessing;

  // 🔥 FIX: detect and clean cash_request_id
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const cashRequestId = params.get("cash_request_id");

    if (cashRequestId) {
      // remove query param without reload
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ✅ Detect wallets
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).ApplePaySession) setApplePaySupported(true);
      if (window.PaymentRequest) setGooglePaySupported(true);
    }
  }, []);

  // ✅ Load Square.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src = cashAppPayScript;
    script.async = true;
    script.onload = initCashApp;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 🔥 Reset Cash App
  const resetCashApp = async () => {
    try {
      if (cashAppRef.current) {
        await cashAppRef.current.destroy?.();
        cashAppRef.current = null;
      }

      setCashAppReady(false);

      setTimeout(() => {
        initCashApp();
      }, 300);
    } catch (e) {
      console.error("Cash App reset failed", e);
    }
  };

  // 🔥 Re-init on return from Cash App
  useEffect(() => {
    const handleFocus = () => {
      resetCashApp();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const normalizeError = (err: any) => {
    if (!err) return t("errors.paymentFailed");

    if (err?.errors?.length) {
      return err.errors.map((e: any) => e.detail).join(", ");
    }

    if (err?.message) return err.message;

    return t("errors.paymentFailed");
  };

  // ✅ Cash App init
  const initCashApp = async () => {
    try {
      if (!(window as any).Square) return;

      const payments = (window as any).Square.payments(appId, locationId);

      const paymentRequest = payments.paymentRequest({
        countryCode: "US",
        currencyCode: "USD",
        total: {
          amount: amount.toString(),
          label: "Total",
        },
      });

      const cashAppPay = await payments.cashAppPay(paymentRequest, {
        // 🔥 FIX: clean redirect URL (no query params)
        redirectURL: window.location.href,
        referenceId: orderId,
      });

      cashAppRef.current = cashAppPay;

      await cashAppPay.attach("#cash-app-pay", {
        shape: "semiround",
        width: "full",
      });

      setCashAppReady(true);

      cashAppPay.addEventListener("ontokenization", async (event: any) => {
        const { tokenResult } = event.detail;

        if (tokenResult.status === "OK") {
          await handleToken({ token: tokenResult.token });
        } else {
          setIsProcessing(false);
          setError("Cash App Pay failed");
          await resetCashApp();
        }
      });
    } catch (err) {
      console.error("Cash App Pay init failed", err);
    }
  };

  const createPaymentRequest = () => ({
    countryCode: "US",
    currencyCode: "USD",
    total: {
      amount: amount.toString(),
      label: "Total",
    },
  });

  // ✅ Handle token
  const handleToken = async (token: any) => {
    try {
      setIsProcessing(true);
      setLoading(true);
      setError(null);

      timeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
        resetCashApp();
      }, 15000);

      const res = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token.token,
          orderId,
          authToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("errors.paymentFailed"));
      }

      // 🔥 FIX: redirect after success (avoid staying on payment page)
      onSuccess?.();
      window.location.href = "/payment-success";
    } catch (err: any) {
      const message = normalizeError(err);
      setError(message);
      onError?.({ ...err, message });
    } finally {
      setLoading(false);
      setIsProcessing(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const formatAmount = (value: number | string) => {
    const num = Number(value);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-lg p-5 space-y-5">

        {isBusy && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-2xl z-10">
            <div className="w-14 h-14 border-4 border-gray-200 border-t-[#FECB02] rounded-full animate-spin"></div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-lg font-semibold">{t("payment.title")}</h2>
        </div>

        <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-xl">
          <span className="text-gray-600 text-sm">
            {t("payment.totalAmount")}
          </span>
          <span className="text-xl font-bold">
            ${formatAmount(amount)}
          </span>
        </div>

        <div className={isBusy ? "pointer-events-none opacity-60" : ""}>
          <PaymentForm
            applicationId={appId!}
            locationId={locationId!}
            cardTokenizeResponseReceived={handleToken}
            createPaymentRequest={createPaymentRequest}
          >
            <CreditCard />

            {(applePaySupported || googlePaySupported) && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t"></div>
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 border-t"></div>
              </div>
            )}

            <div className="space-y-2">
              {applePaySupported && (
                <div
                  onClick={() => setIsProcessing(true)}
                  className="h-12 rounded-xl overflow-hidden cursor-pointer"
                >
                  <ApplePay />
                </div>
              )}

              {googlePaySupported && (
                <div
                  onClick={() => setIsProcessing(true)}
                  className="h-20 rounded-xl overflow-hidden cursor-pointer"
                >
                  <GooglePay />
                </div>
              )}
            </div>
          </PaymentForm>
        </div>

        <div id="cash-app-pay" className="h-[48px]" />
      </div>
    </div>
  );
}