"use client";

import SquarePayment from "@/src/components/payments/SquarePayment";
import { useSearchParams } from "next/navigation";

export default function SquarePaymentPage() {
  const searchParams = useSearchParams();

  const orderId = searchParams?.get("orderId");
  const amount = Number(searchParams?.get("amount"));

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">


      {orderId && amount && (
        <SquarePayment
          orderId={orderId}
          amount={amount}
          onSuccess={() => {
            window.opener?.postMessage(
              { status: "SUCCESS", orderId },
              window.location.origin
            );
            window.close();
          }}

          onError={(err) => {
            window.opener?.postMessage(
              { status: "FAILED", orderId, error: err },
              window.location.origin
            );
            window.close();
          }}
        />
      )}
    </div>

  );
}