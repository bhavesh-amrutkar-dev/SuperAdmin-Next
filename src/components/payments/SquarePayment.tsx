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
  onReturn?: () => void;
}

export default function SquarePayment({
  amount,
  orderId,
  authToken,
  onSuccess,
  onError,
  onReturn
}: SquarePaymentProps) {
  const { appId, locationId, cashAppPayScript } = getSquareConfig();
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasUserLeftRef = useRef(false);
  const hasHandledReturnRef = useRef(false);
  const hasInitiatedCashAppRef = useRef(false);
  const [applePaySupported, setApplePaySupported] = useState(false);
  const [googlePaySupported, setGooglePaySupported] = useState(false);
  const [cashAppReady, setCashAppReady] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cashAppRef = useRef<any>(null);
  const lastBlurTimeRef = useRef(0);
  const isBusy = loading || isProcessing;
  const log = (...args: any[]) => {
    console.log("[CashAppFlow]", ...args);
  };
  // 🔥 FIX: detect and clean cash_request_id
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const cashRequestId = params.get("cash_request_id");

    log("Page Loaded", {
      url: window.location.href,
      cashRequestId,
    });

    if (cashRequestId) {
      log("Returned from Cash App (cash_request_id detected)", cashRequestId);

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
    log("Loading Square script...");

    const script = document.createElement("script");
    script.src = cashAppPayScript;
    script.async = true;

    script.onload = () => {
      log("Square script loaded");
      initCashApp();
    };

    document.body.appendChild(script);

    return () => {
      log("Removing Square script");
      document.body.removeChild(script);
    };
  }, []);

  // 🔥 Reset Cash App
  const resetCashApp = async () => {
    try {
      log("Resetting Cash App instance...");

      if (cashAppRef.current) {
        await cashAppRef.current.destroy?.();
        log("Old Cash App instance destroyed");

        cashAppRef.current = null;
      }

      setCashAppReady(false);

      setTimeout(() => {
        log("Re-initializing Cash App...");
        initCashApp();
      }, 300);
    } catch (e) {
      log("Cash App reset failed", e);
    }
  };

  // 🔥 Re-init on return from Cash App
  useEffect(() => {
    const handleBlur = () => {
      if (!hasInitiatedCashAppRef.current) return;

      lastBlurTimeRef.current = Date.now();
      hasUserLeftRef.current = true;
      log("Blur after Cash App click");
    };

    const handleFocus = () => {
      log("Focus event triggered");

      if (!hasInitiatedCashAppRef.current) {
        log("Ignored: no Cash App click");
        return;
      }

      if (!hasUserLeftRef.current) {
        log("Ignored: no blur before");
        return;
      }

      if (hasHandledReturnRef.current) {
        log("Already handled");
        return;
      }

      const timeDiff = Date.now() - lastBlurTimeRef.current;

      if (timeDiff < 800) {
        log("Ignored: blur too short");
        return;
      }

      hasHandledReturnRef.current = true;

      log("Valid Cash App return → redirect");

      setTimeout(() => {
        // ❗ ONLY trigger if NOT already redirected by Square
        if (!window.location.pathname.includes("/payment-result")) {
          log("Fallback return → calling onReturn");
          onReturn?.();
        } else {
          log("Already redirected by Square → skip onReturn");
        }
      }, 300);
    };

    // ✅ ADD THIS (you missed it)
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
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
      log("Initializing Cash App...");

      if (!(window as any).Square) {
        log("Square not found on window");
        return;
      }

      const payments = (window as any).Square.payments(appId, locationId);

      log("Creating payment request", { amount, orderId });

      const paymentRequest = payments.paymentRequest({
        countryCode: "US",
        currencyCode: "USD",
        total: {
          amount: amount.toString(),
          label: "Total",
        },
      });

      const cashAppPay = await payments.cashAppPay(paymentRequest, {
        redirectURL: `${window.location.origin}/payment-result?orderId=${orderId}`,
        referenceId: orderId,
      });

      log("Cash App instance created");

      cashAppRef.current = cashAppPay;

      await cashAppPay.attach("#cash-app-pay");

      log("Cash App button attached (QR ready)");

      setCashAppReady(true);

      // 🔥 Tokenization listener
      cashAppPay.addEventListener("ontokenization", async (event: any) => {
        log("Tokenization event received", event);

        const { tokenResult } = event.detail;

        if (tokenResult.status === "OK") {
          log("Tokenization SUCCESS", tokenResult);
          await handleToken({ token: tokenResult.token });
        } else {
          log("Tokenization FAILED", tokenResult);
          setIsProcessing(false);
          setError("Cash App Pay failed");
          await resetCashApp();
        }
      });
    } catch (err) {
      log("Cash App init error", err);
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
      log("Starting payment API call", { orderId });

      setIsProcessing(true);
      setLoading(true);
      setError(null);

      timeoutRef.current = setTimeout(() => {
        log("Timeout reached (15s), resetting...");
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

      log("Payment API response", { status: res.status, data });

      if (!res.ok) {
        throw new Error(data.message);
      }

      log("Payment SUCCESS → calling onSuccess");
      onSuccess?.();
    } catch (err: any) {
      log("Payment ERROR", err);

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

        <div
          id="cash-app-pay"
          className="h-[48px]"
          onClick={() => {
            log("Cash App wrapper clicked");
            hasInitiatedCashAppRef.current = true;
          }}
        />
      </div>
    </div>
  );
}