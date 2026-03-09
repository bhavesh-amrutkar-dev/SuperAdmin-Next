"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentResponse() {
  const params = useSearchParams();

  useEffect(() => {
    const status = params?.get("status");

    if (window.opener) {
      window.opener.postMessage(
        { status },
        window.location.origin
      );

      window.close();
    }
  }, []);

  return <p>Processing payment...</p>;
}