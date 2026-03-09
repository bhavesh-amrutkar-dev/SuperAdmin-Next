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

export default function AthMovilCheckout({
  total,
  publicToken,
  orderId,
  userId,
  onSuccess,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!total || !publicToken || !orderId) return;

    if (typeof window === "undefined") return;

    // Prevent duplicate initialization (Next.js strict mode fix)
    if ((window as any).ATHM_Checkout) return;

    // Global callbacks required by ATH SDK
    (window as any).authorizationATHM = async (res: any) => {
      await onSuccess(res);
    };

    (window as any).cancelATHM = async () => {
      await onCancel();
    };

    (window as any).expiredATHM = async () => {
      await onCancel();
    };

    // ATH configuration
    (window as any).ATHM_Checkout = {
      env: "production",
      publicToken,
      timeout: 600,
      theme: "btn-dark",
      lang: "en",

      total: Number(total),
      tax: 0,
      subtotal: Number(total),

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

    // Load ATH SDK
    if (!document.getElementById("athmovil-sdk")) {
      const script = document.createElement("script");
      script.src = "https://payments.athmovil.com/api/js/athmovil_base.js";
      script.id = "athmovil-sdk";
      script.async = true;

      document.body.appendChild(script);
    }

    return () => {
      (window as any).authorizationATHM = () => {};
      (window as any).cancelATHM = () => {};
      (window as any).expiredATHM = () => {};
    };
  }, [total, publicToken, orderId, userId, onSuccess, onCancel]);

  return (
    <div className="ATH_Movil">
      <div id="ATHMovil_Checkout_Button"></div>
    </div>
  );
}