"use client";

import { useEffect } from "react";

interface Props {
  total: number;
  publicToken: string;
  orderId: string;
  userId: string;
  onSuccess: (res: any) => Promise<void>;
  onCancel: () => Promise<void>;
}

export default function AthMovilPayment({
  total,
  publicToken,
  orderId,
  userId,
  onSuccess,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!total || !publicToken || !orderId) return;

    console.log("🚀 Initializing ATH Component");

    // 1️⃣ Attach global callbacks
    (window as any).authorizationATHM = async (res: any) => {
      console.log("✅ AUTH CALLBACK:", res);
      await onSuccess(res);
    };

    (window as any).cancelATHM = async (res: any) => {
      console.log("❌ CANCEL CALLBACK:", res);
      await onCancel();
    };

    (window as any).expiredATHM = async (res: any) => {
      console.log("⏳ EXPIRED CALLBACK:", res);
      await onCancel();
    };

    // 2️⃣ Configure checkout BEFORE SDK loads
    (window as any).ATHM_Checkout = {
      env: "production", // change to sandbox if needed
      publicToken,
      timeout: 600,
      theme: "btn",
      lang: "en",

      total: Number(total),
      subtotal: Number(total),
      tax: 0,

      ecommerceId: orderId,
      metadata1: orderId,
      metadata2: userId,

      items: [
        {
          name: "Order",
          description: "Order Payment",
          quantity: "1",
          price: String(total),
          tax: "0",
          metadata: orderId,
        },
      ],
    };

    console.log("🟢 ATH CONFIG SET:", (window as any).ATHM_Checkout);

    // 3️⃣ Remove old SDK if exists (important)
    const oldScript = document.getElementById("athmovil-sdk");
    if (oldScript) {
      oldScript.remove();
    }

    // 4️⃣ Load SDK
    const script = document.createElement("script");
    script.src = "https://payments.athmovil.com/api/js/athmovil_base.js";
    script.id = "athmovil-sdk";

    script.onload = () => {
      console.log("✅ ATH SDK Loaded");

      setTimeout(() => {
        document.dispatchEvent(
          new Event("DOMContentLoaded", { bubbles: true })
        );
        window.dispatchEvent(new Event("load", { bubbles: true }));
      }, 300);
    };

    script.onerror = () => {
      console.error("❌ Failed to load ATH SDK");
    };

    document.head.appendChild(script);

    return () => {
      console.log("🧹 Cleaning ATH globals");

      delete (window as any).authorizationATHM;
      delete (window as any).cancelATHM;
      delete (window as any).expiredATHM;
      delete (window as any).ATHM_Checkout;
    };
  }, [total, publicToken, orderId]);

  return (
    <div className="ATH_Movil">
      <div id="ATHMovil_Checkout_Button_payment" />
    </div>
  );
}
