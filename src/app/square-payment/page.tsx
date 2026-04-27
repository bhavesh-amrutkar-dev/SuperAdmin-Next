
import { decryptPaymentToken } from "@/src/lib/security/paymentToken";
import SquarePaymentClient from "./squarePaymentClient";
import { ShieldX } from "lucide-react";
import { useTranslations } from "next-intl";

export default async function SquarePaymentPage({ searchParams }: any) {
  const params = await searchParams;
  const token = decodeURIComponent(params?.t);
  // const t = useTranslations();
  if (!token) {
    console.warn("[SquarePaymentPage] Missing token in query params");
    return <div className="p-6 text-center">Invalid payment link</div>;
  }

  let data;

  try {
    data = decryptPaymentToken(token);
    // console.log("data", data);

  } catch (err: any) {
    console.warn("[SquarePaymentPage] Token decryption failed", {
      error: err?.message,
      stack: err?.stack,
      tokenPreview: token?.slice(0, 10) + "...",
      fullTokenLength: token?.length,
    });


    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1bd,transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 p-8 text-center">

            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <ShieldX className="h-8 w-8" />
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900">
              Invalid or expired link
            </h1>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-500 leading-6">
              This payment link is no longer valid. It may have expired or already been used.
            </p>

          </div>


        </div>
      </div>
    );
  }

  const { orderId, amount, accessToken, deviceType } = data;
  if (Date.now() > data.exp) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc]">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

          <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <ShieldX size={28} />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Payment session expired
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            This payment session has expired. Please restart checkout.
          </p>


        </div>

        {/* 🔥 Smart script handling */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                const payload = { status: "EXPIRED" };

                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage(payload, window.location.origin);

                  // 🔥 ONLY close if this is a popup
                  if (window.opener !== window) {
                    setTimeout(() => window.close(), 1200);
                  }
                }
              } catch (e) {
                console.warn("PostMessage failed", e);
              }
            })();
          `,
          }}
        />
      </div>
    );
  }
  return (
    <SquarePaymentClient
      orderId={orderId}
      amount={amount}
      accessToken={accessToken}
      deviceType={deviceType}
      exp={data.exp}
    />
  );
}