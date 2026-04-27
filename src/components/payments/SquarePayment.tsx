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

  const isBusy = loading || isProcessing;

  // ✅ Detect wallets
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).ApplePaySession) setApplePaySupported(true);
      if (window.PaymentRequest) setGooglePaySupported(true);
    }
  }, []);

  // ✅ Load Square.js for Cash App
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

  // ✅ Normalize error
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
        redirectURL: window.location.href,
        referenceId: orderId,
      });

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
          setIsProcessing(false); // ✅ important
          setError("Cash App Pay failed");
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

        // ⏳ fallback timeout (handles wallet cancel silently)
        timeoutRef.current = setTimeout(() => {
          setIsProcessing(false);
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

        onSuccess?.();
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

        {/* ✅ Loading Overlay */}
        {isBusy && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl z-10 transition-all">

            {/* Spinner */}
            <div className="relative">
              <div className="w-14 h-14 border-4 border-gray-200 border-t-[#FECB02] rounded-full animate-spin"></div>

              {/* subtle glow */}
              <div className="absolute inset-0 rounded-full blur-md bg-[#FECB02]/20"></div>
            </div>

            {/* Text */}
            <div className="mt-4 text-center space-y-1">
              <p className="text-sm font-semibold text-gray-800">
                {t("payment.processing")}
              </p>
              <p className="text-xs text-gray-500 animate-pulse">
                {t("payment.pleaseWait") || "Please don’t close this window"}
              </p>
            </div>
          </div>
        )}

        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold">{t("payment.title")}</h2>
          <p className="text-xs text-gray-500">
            {t("payment.subtitle")}
          </p>
        </div>

        <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-xl">
          <span className="text-gray-600 text-sm">
            {t("payment.totalAmount")}
          </span>
          <span className="text-xl font-bold">
            ${formatAmount(amount)}
          </span>
        </div>

        {/* ✅ Disable UI */}
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
                  className="h-10 rounded-xl overflow-hidden cursor-pointer"
                >
                  <GooglePay
                    buttonType="long"
                    buttonColor="black"
                    buttonSizeMode="fill"
                  />
                </div>
              )}

               <div id="cash-app-pay" className="h-[48px]" />
            </div>
          </PaymentForm>
        </div>

        {/* ✅ Cash App */}
        {/* {cashAppReady && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 border-t"></div>
            </div>

          </>
        )} */}

       

        {/* ✅ Error UI */}
        {/* {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 animate-in fade-in">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">
                {t("errors.paymentFailed")}
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {error}
              </p>
            </div>

            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
}