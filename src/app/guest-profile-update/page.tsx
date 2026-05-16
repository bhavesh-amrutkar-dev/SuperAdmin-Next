import Footer from "@/src/components/layout/Footer";
import Header from "@/src/components/layout/Header";
import GuestProfileClient from "@/src/components/common/guestProfileClient";

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
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <GuestProfileClient token={token} />
      </main>
      <Footer />
    </div>
  );
}
