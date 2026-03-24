"use client";

import SquarePayment from "@/src/components/payments/SquarePayment";
import { useEffect } from "react";

export default function SquarePaymentClient({
  orderId,
  amount,
  accessToken,
}: any) {

  // useEffect(() => {
  //   fetch("/api/payment/session", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ token: accessToken }),
  //   });
  // }, [accessToken]);
  const sendPaymentEvent = (payload: any) => {
    let sent = false;

    try {
      if (window.opener) {
        window.opener.postMessage(payload, window.location.origin);
        sent = true;
      }

      // 🔥 Critical for mobile/webview
      window.postMessage(payload, window.location.origin);
      sent = true;

    } catch (e) {
      console.warn("Event dispatch failed", e);
    }

    return sent;
  };
  const handleSuccess = () => {
    const payload = { status: "SUCCESS", orderId };

    const sent = sendPaymentEvent(payload);

    if (window.opener) {
      window.close();
      return;
    }

    // fallback
    // if (!sent) {
      window.location.href = `/payment-result?status=SUCCESS&orderId=${orderId}`;
    // }
  };

  const handleError = (err: any) => {
    const payload = {
      status: "FAILED",
      orderId,
      error: {
        message: err?.message || "Payment failed",
      },
    };

    const sent = sendPaymentEvent(payload);

    if (window.opener) {
      window.close();
      return;
    }

    // fallback for blocked popup
    // if (!sent) {
      window.location.href = `/payment-result?status=FAILED&orderId=${orderId}`;
    // }
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