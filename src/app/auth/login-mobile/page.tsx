"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { AuthService } from "@/src/lib/services/auth";
import { IMobileLoginRM } from "@/src/models/api/request/auth";

export default function LoginMobilePage() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const router = useRouter();
  const t = useTranslations();

  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [loading, setLoading] = useState(false);


  const loginHref =
    redirect && !redirect.startsWith("/auth")
      ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
      : "/auth/login";
  const registerHref =
    redirect && !redirect.startsWith("/auth")
      ? `/auth/register?redirect=${encodeURIComponent(redirect)}`
      : "/auth/register";
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobile || !countryCode) {
      toast.error(t("invalidMobile"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          countryCode,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t("otpSendFailed"));
      }

      const data = await res.json();
      const { otpId, otpExpiryTime } = data.data;

      const redirectQuery =
        redirect && !redirect.startsWith("/auth")
          ? `&redirect=${encodeURIComponent(redirect)}`
          : "";

      router.push(
        `/auth/verify-otp?method=mobile&value=${encodeURIComponent(
          `${countryCode}${mobile}`
        )}&otpId=${otpId}&expiry=${otpExpiryTime}${redirectQuery}`
      );
    } catch (err: any) {
      toast.error(err?.message || t("otpSendFailed"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] border border-gray-200 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl font-bold section_title">
          {t("loginWithPhoneTitle")}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {t("loginWithPhoneSubtitle")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
        {/* Mobile */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2f2f2f]">
            {t("mobileNumberLabel")}
          </label>
          <div className="phone-input">
            <PhoneInput
              country="us"
              value={`${countryCode.replace("+", "")}${mobile}`}
              onChange={(value, data: any) => {
                setCountryCode(`+${data.dialCode}`);
                setMobile(value.slice(data.dialCode.length));
              }}
              inputClass="!bg-transparent !w-full !h-[44px] !text-sm !rounded-lg !border-[#2f2f2f] focus:!border-[#f3c200]"
              buttonClass="!border-[#2f2f2f]"
              containerClass="!w-full"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !mobile}
          className="w-full rounded-lg btn-primary py-3 text-white font-semibold hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 !border-0 disabled:pointer-events-none"
        >
          {loading ? t("sendingOtp") : t("sendOtp")}
        </button>

        {/* OR CONNECT WITH */}
        <div>
          <div className="flex items-center gap-3 max-w-[80%] mx-auto">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-muted-foreground font-medium">
              {t("orConnectWith")}
            </span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <Link
            href={loginHref}
            className="mt-4 w-full rounded-lg btn-primary py-3 font-semibold
  hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {t("loginWithEmail")}
          </Link>
        </div>
      </form>

      {/* Footer */}
      <p className="mt-5 sm:mt-6 text-center text-sm text-foreground">
        {t("noAccount")}{" "}
        <Link
          href={registerHref}
          className="font-semibold text-[#2f2f2f] hover:text-[#f3c200] hover:underline transition"
        >
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
