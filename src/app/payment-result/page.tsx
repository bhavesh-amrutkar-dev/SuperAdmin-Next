"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams?.get("status");
    const orderId = searchParams?.get("orderId");
    const errorParam = searchParams?.get("error");

    let error = null;
    try {
      if (errorParam) error = JSON.parse(decodeURIComponent(errorParam));
    } catch { }

    if (!status) {
      router.replace("/");
      return;
    }

    // still notify opener if exists
    if (window.opener) {
      window.opener.postMessage(
        { status, orderId, error },
        window.location.origin
      );
    }

    if (status === "SUCCESS") {
      router.replace(`/thank-you?payment=square&orderId=${orderId}`);
    } else {
      // ✅ preserve error context
      router.replace(
        `/checkout?paymentError=true&message=${encodeURIComponent(
          error?.message || "Payment failed"
        )}`
      );
    }
  }, [searchParams, router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      Processing payment...
    </div>
  );
}