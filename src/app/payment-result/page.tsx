"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

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

    // ✅ PUT IT HERE
    const payload = { status, orderId, error };

    if (window.opener) {
      window.opener.postMessage(payload, window.location.origin);
    }

    window.postMessage(payload, window.location.origin);

    // existing redirects
    const token = document.cookie.includes("access_token");

    const isGuest = !token;

    if (status === "SUCCESS") {
      router.replace(`/thank-you?payment=square&orderId=${orderId}`);
    } else {
      const basePath = isGuest ? "/guest-checkout" : "/secure-checkout";

      router.replace(
        `${basePath}?status=FAILED&orderId=${orderId}&message=${encodeURIComponent(
          error?.message || "Payment failed"
        )}`
      );
    }
  }, [searchParams, router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      {t("payment.processing")}
    </div>
  );
}