"use client";

import SquarePayment from "@/src/components/payments/SquarePayment";
import { useSearchParams } from "next/navigation";

export default function SquarePaymentPage() {
  const searchParams = useSearchParams();

  const orderId = searchParams?.get("orderId");
  const amount = searchParams?.get("amount");

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Secure Payment
        </h2>

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
          onError={() => {
            window.opener?.postMessage(
              { status: "FAILED", orderId },
              window.location.origin
            );
          }}
        />
      </div>
    </div>
  );
}