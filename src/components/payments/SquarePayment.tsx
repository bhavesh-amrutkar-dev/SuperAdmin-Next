"use client";

import { useState } from "react";
import { getSquareConfig } from "@/src/lib/config/square";
import {
  PaymentForm,
  CreditCard,
  GooglePay,
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
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">Complete Payment</h2>
        <p className="text-gray-500 text-sm">
          Secure payment powered by Square
        </p>
      </div>

      {/* Amount */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <span className="text-gray-600">Total Amount</span>
        <span className="text-lg font-semibold">${amount}</span>
      </div>

      {/* Payment Form */}
      <PaymentForm
        applicationId={appId!}
        locationId={locationId!}
        cardTokenizeResponseReceived={handleToken}
        createPaymentRequest={createPaymentRequest}
      >

        {/* Digital Wallets */}
        <div className="space-y-3">
          <CreditCard />

        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 border-t"></div>
        </div>

        {/* Card Payment */}
        <GooglePay />

      </PaymentForm>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-500 text-center">
          Processing payment...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 text-center">
          {error}
        </p>
      )}

    </div>
  );
}