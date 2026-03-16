
import { decryptPaymentToken } from "@/src/lib/security/paymentToken";
import SquarePaymentClient from "./squarePaymentClient";

export default async function SquarePaymentPage({ searchParams }: any) {

  const params = await searchParams;
  const token = params?.t;

  if (!token) {
    return <div className="p-6 text-center">Invalid payment link</div>;
  }

  let data;

  try {
    data = decryptPaymentToken(token);
  } catch {
    return <div className="p-6 text-center">Invalid or expired payment link</div>;
  }

  const { orderId, amount, accessToken } = data;
  if (Date.now() > data.exp) {
    throw new Error("Token expired");
  }
  return (
    <SquarePaymentClient
      orderId={orderId}
      amount={amount}
      accessToken={accessToken}
    />
  );
}