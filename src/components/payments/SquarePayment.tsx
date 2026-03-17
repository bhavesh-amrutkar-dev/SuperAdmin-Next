"use client";

import { useEffect, useState } from "react";
import { getSquareConfig } from "@/src/lib/config/square";
import {
  PaymentForm,
  CreditCard,
  GooglePay,
  ApplePay,
} from "react-square-web-payments-sdk";

interface SquarePaymentProps {
  amount: number;
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function SquarePayment({
  amount,
  orderId,
  onSuccess,
  onError
}: SquarePaymentProps) {

  const { appId, locationId } = getSquareConfig();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applePaySupported, setApplePaySupported] = useState(false);
  const [googlePaySupported, setGooglePaySupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {

      // Apple Pay detection
      if ((window as any).ApplePaySession) {
        setApplePaySupported(true);
      }

      // Google Pay detection
      if (window.PaymentRequest) {
        setGooglePaySupported(true);
      }
    }
  }, []);
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token.token,
          orderId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
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
          <h2 className="text-lg font-semibold">Complete Payment</h2>
          <p className="text-xs text-gray-500">
            Secure checkout powered by Square
          </p>
        </div>

        <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-xl">
          <span className="text-gray-600 text-sm">Total Amount</span>
          <span className="text-xl font-bold">${amount}</span>
        </div>

        <PaymentForm
          applicationId={appId!}
          locationId={locationId!}
          cardTokenizeResponseReceived={handleToken}
          createPaymentRequest={createPaymentRequest}
        >

          {/* Credit Card always available */}
          <CreditCard />

          {(applePaySupported || googlePaySupported) && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t"></div>
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 border-t"></div>
              </div>
            </>
          )}

         <div className="space-y-2">
           {/* Apple Pay */}
          {applePaySupported && <ApplePay />}

          {/* Google Pay */}
          {googlePaySupported && (
            <GooglePay
              buttonType="long"
              buttonColor="black"
              buttonSizeMode="fill"
            />
          )}
         </div>

        </PaymentForm>

        {loading && (
          <div className="text-center text-sm text-gray-500">
            Processing payment...
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