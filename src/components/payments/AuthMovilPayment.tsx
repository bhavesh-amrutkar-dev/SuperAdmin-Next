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

    // 1️⃣ Define global callbacks
    (window as any).authorizationATHM = async (res: any) => {
      console.log("ATH SUCCESS", res);
      await onSuccess(res);
    };

    (window as any).cancelATHM = async (res:any) => {
      console.log("ATH CANCELLED");
      await onCancel();
    };

    (window as any).expiredATHM = async (res: any) => {
      console.log("ATH EXPIRED");
      await onCancel();
    };

    // 2️⃣ Define config
    (window as any).ATHM_Checkout = {
      env: "production",
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

    // 3️⃣ Load SDK AFTER config exists
    if (!document.getElementById("athmovil-sdk")) {
      const script = document.createElement("script");

      script.src = "https://payments.athmovil.com/api/js/athmovil_base.js";
      script.id = "athmovil-sdk";

      script.onload = () => {
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
    } else {
      setTimeout(() => {
        document.dispatchEvent(
          new Event("DOMContentLoaded", { bubbles: true })
        );
        window.dispatchEvent(new Event("load", { bubbles: true }));
      }, 300);
    }
  }, [total, publicToken, orderId, userId]);

  return (
    <div className="ATH_Movil">
      <div id="ATHMovil_Checkout_Button_payment" />
    </div>
  );
}