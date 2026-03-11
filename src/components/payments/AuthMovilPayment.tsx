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

    console.log("────────────────────────────────────────");
    console.log("🚀 ATH MÓVIL INITIALIZATION STARTED");
    console.log("────────────────────────────────────────");

    console.log("1️⃣ Incoming Props");
    console.log({
      total,
      publicToken,
      orderId,
      userId
    });

    if (!total || !publicToken || !orderId) {
      console.error("❌ Missing required ATH Móvil parameters");
      return;
    }

    console.log("2️⃣ Defining global callbacks");

    (globalThis as any).authorizationATHM = async (res: any) => {
      console.log("🟢 authorizationATHM CALLBACK TRIGGERED");
      console.log("Response from ATH:", res);

      try {
        await onSuccess(res);
      } catch (err) {
        console.error("❌ Error in success handler:", err);
      }
    };

    (globalThis as any).cancelATHM = async (res?: any) => {
      console.log("🟡 cancelATHM CALLBACK TRIGGERED");
      console.log("Cancel payload:", res);

      try {
        await onCancel();
      } catch (err) {
        console.error("❌ Error in cancel handler:", err);
      }
    };

    (globalThis as any).expiredATHM = async (res?: any) => {
      console.log("🔴 expiredATHM CALLBACK TRIGGERED");
      console.log("Expired payload:", res);

      try {
        await onCancel();
      } catch (err) {
        console.error("❌ Error in expired handler:", err);
      }
    };

    console.log("3️⃣ Creating ATHM_Checkout configuration");

    const checkoutConfig = {
      env: "production",
      publicToken,
      timeout: 600,
      theme: "btn",
      lang: "en",

      callbackUrl: `${process.env.NEXT_PUBLIC_APP_WEBSITE}/thank-you`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_WEBSITE}/secure-checkout`,

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

    console.log("📦 ATHM_Checkout Config:");
    console.log(checkoutConfig);

    (globalThis as any).ATHM_Checkout = checkoutConfig;

    console.log("4️⃣ Verifying globals before SDK load");

    console.log("authorizationATHM:", (globalThis as any).authorizationATHM);
    console.log("cancelATHM:", (globalThis as any).cancelATHM);
    console.log("expiredATHM:", (globalThis as any).expiredATHM);
    console.log("ATHM_Checkout:", (globalThis as any).ATHM_Checkout);

    console.log("5️⃣ Checking if SDK already exists");

    if (!document.getElementById("athmovil-sdk")) {

      console.log("📥 SDK not found. Loading ATH Móvil SDK...");

      const script = document.createElement("script");

      script.src = "https://payments.athmovil.com/api/modal/js/athmovil_base.js";
      script.id = "athmovil-sdk";
      script.async = true;

      script.onload = () => {
        console.log("✅ ATH Móvil SDK successfully loaded");

        console.log("6️⃣ Triggering DOM lifecycle events for SDK");

        setTimeout(() => {
          document.dispatchEvent(
            new Event("DOMContentLoaded", { bubbles: true })
          );

          window.dispatchEvent(
            new Event("load", { bubbles: true })
          );

          console.log("✅ DOM events dispatched");
        }, 300);
      };

      script.onerror = (err) => {
        console.error("❌ Failed to load ATH Móvil SDK");
        console.error(err);
      };

      document.head.appendChild(script);

    } else {

      console.log("ℹ️ SDK already loaded. Re-triggering initialization");

      setTimeout(() => {
        document.dispatchEvent(
          new Event("DOMContentLoaded", { bubbles: true })
        );

        window.dispatchEvent(
          new Event("load", { bubbles: true })
        );

        console.log("✅ DOM events re-triggered");
      }, 300);

    }

    console.log("────────────────────────────────────────");
    console.log("🚀 ATH MÓVIL INITIALIZATION COMPLETE");
    console.log("────────────────────────────────────────");

  }, [total, publicToken, orderId, userId]);

  return (
    <div className="ATH_Movil">
      <div id="ATHMovil_Checkout_Button_payment" />
    </div>
  );
}