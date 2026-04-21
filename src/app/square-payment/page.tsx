import { decryptPaymentToken } from "@/src/lib/security/paymentToken";
import SquarePaymentClient from "./squarePaymentClient";

export default async function SquarePaymentPage({ searchParams }: any) {
  const params = await searchParams;
  const token = decodeURIComponent(params?.t);

  if (!token) {
    console.warn("[SquarePaymentPage] Missing token in query params");
    return <div className="p-6 text-center">Invalid payment link</div>;
  }

  let data;

  try {
    data = decryptPaymentToken(token);
    console.log("data", data);
    
  } catch (err: any) {
    console.error("[SquarePaymentPage] Token decryption failed", {
      error: err?.message,
      stack: err?.stack,
      tokenPreview: token?.slice(0, 10) + "...",
      fullTokenLength: token?.length,
    });

    return (
      <div className="p-6 text-center">
        Invalid or expired payment link
      </div>
    );
  }

  const { orderId, amount, accessToken, deviceType } = data;

  if (Date.now() > data.exp) {
    console.warn("[SquarePaymentPage] Token expired", {
      orderId,
      exp: data.exp,
      now: Date.now(),
    });

    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.opener?.postMessage({status:"EXPIRED"}, window.location.origin);
            window.close();
          `,
        }}
      />
    );
  }

  return (
    <SquarePaymentClient
      orderId={orderId}
      amount={amount}
      accessToken={accessToken}
      deviceType={deviceType}
    />
  );
}