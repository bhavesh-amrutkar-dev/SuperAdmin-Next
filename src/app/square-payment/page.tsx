import { decryptPaymentToken } from "@/src/lib/security/paymentToken";
import SquarePaymentClient from "./squarePaymentClient";
import Link from "next/link";

function ErrorScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-6 text-center space-y-4">
        <div className="text-red-500 text-3xl">⚠️</div>

        <h2 className="text-lg font-semibold">{title}</h2>

        <p className="text-sm text-gray-500">{description}</p>

        <div className="pt-4 space-y-2">
          <Link
            href="/"
            className="block w-full bg-black text-white py-2 rounded-lg text-sm font-medium"
          >
            Go Home
          </Link>

          <Link
            href="/checkout"
            className="block w-full border py-2 rounded-lg text-sm"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function SquarePaymentPage({ searchParams }: any) {
  const params = searchParams; // ✅ FIXED
  const token = params?.t;

  // ❌ Missing token
  if (!token) {
    return (
      <ErrorScreen
        title="Invalid Link"
        description="This payment link is not valid. Please try again."
      />
    );
  }

  let data: any;

  try {
    data = decryptPaymentToken(token);
  } catch (error) {
    console.warn("Payment token decryption failed", {
      token,
      error: error instanceof Error ? error.message : error,
    });

    return (
      <ErrorScreen
        title="Invalid or Corrupted Link"
        description="This payment link is broken or has already been used."
      />
    );
  }

  // ✅ extra safety
  if (!data) {
    return (
      <ErrorScreen
        title="Invalid Link"
        description="Unable to process this payment link."
      />
    );
  }

  const { orderId, amount, accessToken, exp } = data;

  // ⏰ Expired token
  if (Date.now() > exp) {
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.opener) {
                window.opener.postMessage({ status: "EXPIRED" }, window.location.origin);
                window.close();
              }
            `,
          }}
        />

        <ErrorScreen
          title="Session Expired"
          description="Your payment session has expired. Please restart your checkout."
        />
      </>
    );
  }

  // ✅ Valid case
  return (
    <SquarePaymentClient
      orderId={orderId}
      amount={amount}
      accessToken={accessToken}
    />
  );
}