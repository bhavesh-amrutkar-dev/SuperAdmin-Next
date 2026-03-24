"use client";

import SquarePayment from "@/src/components/payments/SquarePayment";
import { useEffect } from "react";

export default function SquarePaymentClient({
  orderId,
  amount,
  accessToken,
}: any) {

  useEffect(() => {
    fetch("/api/payment/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: accessToken }),
    });
  }, [accessToken]);

  const handleSuccess = () => {
    if (window.opener) {
      // existing popup flow
      window.opener.postMessage({ status: "SUCCESS", orderId }, window.location.origin);
      window.close();
    } else {
      // NEW: universal fallback
      window.location.href = `/payment-result?status=SUCCESS&orderId=${orderId}`;
    }
  };

  const handleError = (err: any) => {
    if (window.opener) {
      // Popup flow (unchanged)
      window.opener.postMessage(
        { status: "FAILED", orderId, error: err },
        window.location.origin
      );
      window.close();
    } else {
      // ✅ NEW: redirect fallback (same as success)
      const encodedError = encodeURIComponent(
        JSON.stringify({
          message: err?.message || "Payment failed",
        })
      );

      window.location.href = `/payment-result?status=FAILED&orderId=${orderId}&error=${encodedError}`;
    }
  };

  return (
    <SquarePayment
      orderId={orderId}
      amount={amount}
      authToken={accessToken}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}