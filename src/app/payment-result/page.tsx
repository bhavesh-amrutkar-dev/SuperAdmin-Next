"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams?.get("status");
    const orderId = searchParams?.get("orderId");

    if (!status) {
      router.replace("/");
      return;
    }

    // Optional: notify opener if exists (hybrid safety)
    if (window.opener) {
      window.opener.postMessage(
        { status, orderId },
        window.location.origin
      );
    }

    if (status === "SUCCESS") {
      router.replace(`/thank-you?payment=square&orderId=${orderId}`);
    } else {
      router.replace(`/checkout?paymentError=true`);
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Processing payment...
    </div>
  );
}