"use client";

import { useEffect, useState } from "react";
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
  const { appId, locationId } = getSquareConfig();
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applePaySupported, setApplePaySupported] = useState(false);
  const [googlePaySupported, setGooglePaySupported] = useState(false);
  const [cashAppReady, setCashAppReady] = useState(false);

  // Detect wallet support
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).ApplePaySession) setApplePaySupported(true);
      if (window.PaymentRequest) setGooglePaySupported(true);
    }
  }, []);

  // Load Square.js (for Cash App Pay)
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sandbox.web.squarecdn.com/v1/square.js";
    script.async = true;
    // script.onload = () => initCashApp();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
          console.error(tokenResult);
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

  const handleToken = async (token: any) => {
    try {
      setLoading(true);
      setError(null);

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
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-5 space-y-5">

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
          <span className="text-xl font-bold">${amount}</span>
        </div>

        <PaymentForm
          applicationId={appId!}
          locationId={locationId!}
          cardTokenizeResponseReceived={handleToken}
          createPaymentRequest={createPaymentRequest}
        >
          {/* Card */}
          <CreditCard />

          {/* Divider if wallets exist */}
          {/* {(applePaySupported || googlePaySupported) && (
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t"></div>
              <span className="text-xs text-gray-400">
                {t("payment.or")}
              </span>
              <div className="flex-1 border-t"></div>
            </div>
          )} */}

          {/* Wallets */}
          {/* <div className="space-y-2">
            {applePaySupported && <ApplePay />}

            {googlePaySupported && (
              <GooglePay
                buttonType="long"
                buttonColor="black"
                buttonSizeMode="fill"
              />
            )}
          </div> */}
        </PaymentForm>

        {/* Divider for Cash App */}
        {/* {cashAppReady && (
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 border-t"></div>
          </div>
        )} */}

        {/* Cash App Pay */}
        {/* <div id="cash-app-pay" /> */}

        {loading && (
          <div className="text-center text-sm text-gray-500">
            {t("payment.processing")}
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}