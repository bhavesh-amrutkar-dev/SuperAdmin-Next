"use client";

import { getSquareConfig } from "@/src/lib/config/square";
import { useEffect, useRef, useState } from "react";

type SquarePaymentProps = {
  amount: number;
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

declare global {
  interface Window {
    Square: any;
  }
}

export default function SquarePayment({
  amount,
  orderId,
  onSuccess,
  onError
}: SquarePaymentProps) {
  const cardRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("SquarePayment mounted for order:", orderId);

    const initSquare = async () => {
      if (!window.Square) {
        console.error("Square SDK not loaded");
        return;
      }
      const { appId, locationId } = getSquareConfig();

      console.log("Square Config:", { appId, locationId });

      try {
        const payments = window.Square.payments(
          appId,
          locationId
        );

        const card = await payments.card();

        await card.attach("#square-card-container");

        cardRef.current = card;

        console.log("Square card attached successfully");
      } catch (err) {
        console.error("Square initialization failed:", err);
      }
    };

    initSquare();
  }, [orderId]);

  const handlePayment = async () => {
    console.log("Square payment started");

    if (!cardRef.current) {
      console.error("Card not initialized");
      return;
    }

    setLoading(true);

    try {
      const result = await cardRef.current.tokenize();

      console.log("Tokenization result:", result);

      if (result.status !== "OK") {
        throw new Error("Card tokenization failed");
      }

      const token = result.token;

      console.log("Sending payment request:", {
        tokenExists: !!token,
        orderId,
        amount
      });

      const res = await fetch("/api/square-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          orderId,
          amount
        })
      });

      const data = await res.json();

      console.log("Square API response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      console.log("Square payment successful");

      onSuccess?.();

    } catch (err: any) {
      console.error("Square payment error:", err);

      onError?.(err);

      alert(err?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div id="square-card-container" className="border p-3 rounded"></div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="mt-4 w-full bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay with Card"}
      </button>
    </div>
  );
}