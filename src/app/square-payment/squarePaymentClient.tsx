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
      window.opener.postMessage(
        { status: "SUCCESS", orderId },
        window.location.origin
      );
    }

    setTimeout(() => {
      window.close();
    }, 500);
  };

  const handleError = (err: any) => {
    if (window.opener) {
      window.opener.postMessage(
        { status: "FAILED", orderId, error: err },
        window.location.origin
      );
      window.close();
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