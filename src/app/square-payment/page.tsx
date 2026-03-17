import { decryptPaymentToken } from "@/src/lib/security/paymentToken";
import SquarePaymentClient from "./squarePaymentClient";
import Link from "next/link";
import { useTranslations } from "next-intl";

function ErrorScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const t = useTranslations();
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
            {t("goHome")}
          </Link>

          <Link
            href="/checkout"
            className="block w-full border py-2 rounded-lg text-sm"
          >
            {t("tryAgain")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function SquarePaymentPage({ searchParams }: any) {
  const params = await searchParams;
  const token = params?.t;
  const t = useTranslations();
  // ❌ Missing token
  if (!token) {
    return (
      <ErrorScreen
        title={t("invalidLink")}
        description={t("invalidLinkDesc")}
      />
    );
  }

  let data;

  try {
    data = decryptPaymentToken(token);
  } catch (error) {
    console.warn("Payment token decryption failed", {
      token,
      error: error instanceof Error ? error.message : error,
    });

    // ❌ Invalid token
    return (
      <ErrorScreen
        title={t("corruptedLink")}
        description={t("corruptedLinkDesc")}
      />
    );
  }

  const { orderId, amount, accessToken, exp } = data;

  // ⏰ Expired token
  if (Date.now() > exp) {
    return (
      <>
        {/* ✅ Notify parent (popup case) */}
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

        {/* ✅ Fallback UI (mobile / direct open) */}
        <ErrorScreen
          title={t("expired")}
          description={t("expiredDesc")}
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