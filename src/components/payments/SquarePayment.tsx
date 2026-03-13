"use client";

import { getSquareConfig } from "@/src/lib/config/square";
import {
  PaymentForm,
  CreditCard,
  ApplePay,
  GooglePay,
  CashAppPay
} from "react-square-web-payments-sdk";


export default function SquarePayment({
  amount,
  orderId,
  onSuccess,
  onError
}: any) {

  const { appId, locationId } = getSquareConfig();

  const handleToken = async (token: any) => {
    try {
      console.log(token);

      const res = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token.token,
          orderId,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      onSuccess?.();

    } catch (error) {
      onError?.(error);
    }
  };

  return (
    <PaymentForm
      applicationId={appId!}
      locationId={locationId!}
      cardTokenizeResponseReceived={handleToken}
    >

      {/* Card */}
      <CreditCard />

      {/* Apple Pay */}
      {/* <ApplePay /> */}

      {/* Google Pay */}
      {/* <GooglePay /> */}

      {/* Cash App Pay */}
      {/* <CashAppPay /> */}

    </PaymentForm>
  );
}