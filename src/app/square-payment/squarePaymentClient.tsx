"use client";

import SquarePayment from "@/src/components/payments/SquarePayment";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function SquarePaymentClient({
  orderId,
  amount,
  accessToken,
  deviceType,
  exp
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
  const [timeLeft, setTimeLeft] = useState(0);
  const t = useTranslations();
  // ⏳ Countdown logic
  useEffect(() => {
    const update = () => {
      const diff = exp - Date.now();

      if (diff <= 0) {
        setTimeLeft(0);

        // 🔥 Auto expire action
        window.location.href = `/payment-result?status=FAILED&orderId=${orderId}&message=Session expired`;
        return;
      }

      setTimeLeft(diff);
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [exp, orderId]);

  // ⏱ format mm:ss
  const formatTime = () => {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;

    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const isLow = timeLeft < 60000; // < 1 min

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
    // console.log("Device type---", deviceType);

    const sent = sendPaymentEvent(payload);
    if (deviceType === 1) {
      window.location.href = `donrifa://square-pay-success?orderId=${orderId}`;
      return;
    }
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
    let message = err?.message || "Payment failed";
    let mobileError = message; // ✅ default fallback

    // ✅ Try parsing JSON message
    try {
      if (typeof err?.message === "string") {
        const parsed = JSON.parse(err.message);
        // console.log("Parsed>>>>>>>", parsed);

        mobileError = parsed?.error?.code || parsed?.message || err.message;
      }
    } catch {
      mobileError = message;
    }

    const encodedError = encodeURIComponent(message);

    const payload = {
      status: "FAILED",
      orderId,
      error: {
        message,
      },
    };

    sendPaymentEvent(payload);

    // ✅ iOS App
    if (deviceType === 1) {
      window.location.href = `donrifa://square-pay-failed?orderId=${orderId}&error=${mobileError}`;
      return;
    }

    // ✅ Android WebView / Mobile
    if (deviceType === 2) {
      window.location.href = `/payment-result?status=FAILED&orderId=${orderId}&error=${mobileError}`;
      return;
    }

    // ✅ Popup
    if (window.opener) {
      window.close();
      return;
    }

    // ✅ Web fallback
    window.location.href = `/payment-result?status=FAILED&orderId=${orderId}&error=${encodedError}`;
  };
  const handleReturn = () => {
    console.log("handle return");

    const message = "Payment not completed"; // ✅ correct semantic
    const mobileError = "USER_CANCELLED"; // ✅ machine-friendly
    const encodedError = encodeURIComponent(message);

    const payload = {
      status: "FAILED", // or "ABANDONED" if you want better semantics
      orderId,
      error: {
        message,
        code: mobileError,
      },
    };

    sendPaymentEvent(payload);

    // ✅ iOS App
    if (deviceType === 1) {
      window.location.href = `donrifa://square-pay-failed?orderId=${orderId}&error=${mobileError}`;
      return;
    }

    // ✅ Android WebView / Mobile
    if (deviceType === 2) {
      window.location.href = `/payment-result?status=FAILED&orderId=${orderId}&error=${mobileError}`;
      return;
    }

    // ✅ Popup
    if (window.opener) {
      window.close();
      return;
    }

    // ✅ Web fallback
    window.location.href = `/payment-result?status=FAILED&orderId=${orderId}&error=${encodedError}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* 🔥 Top countdown bar */}
      <div
        className={`sticky top-0 z-50 w-full text-center py-3 text-sm font-semibold shadow-sm backdrop-blur
  ${isLow
            ? "bg-red-500 text-white animate-pulse"
            : "bg-yellow-100 text-yellow-800"
          }`}
      >
        ⏳ {t("sessionExpiryCountDownMessage")} {formatTime()}
      </div>

      {/* Payment UI */}
      <div className="max-w-3xl mx-auto p-4">
        <SquarePayment
          orderId={orderId}
          amount={amount}
          authToken={accessToken}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );

}