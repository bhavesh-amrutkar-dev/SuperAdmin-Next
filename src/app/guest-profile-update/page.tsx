import GuestProfileClient from "@/src/components/common/guestProfileClient";
import { decryptPaymentToken } from "@/src/lib/security/paymentToken";

export default async function GuestProfilePage({ searchParams }: any) {
  const params = await searchParams;
  const token = decodeURIComponent(params?.t || "");

  // if (!token) {
  //   return <div className="p-6 text-center">Invalid link</div>;
  // }

  // let data;

  // try {
  //   data = decryptPaymentToken(token);
  //   console.log("data", data);

  // } catch (err: any) {
  //   console.error("[GuestProfilePage] Token decryption failed", err);
  //   return (
  //     <div className="p-6 text-center">
  //       Invalid or expired link
  //     </div>
  //   );
  // }

  // // ✅ Expiry check (if exists)
  // if (data?.exp && Date.now() > data.exp) {
  //   return (
  //     <div className="p-6 text-center">
  //       Link expired
  //     </div>
  //   );
  // }

  // const { email, accessToken } = data;
  // console.log("accessToken");
  console.log(token);

  return <GuestProfileClient token={token} />;
}