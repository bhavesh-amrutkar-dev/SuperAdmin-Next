"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslations } from "next-intl";
import { AuthService } from "@/src/lib/services/auth";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/input";

type Method = "email" | "mobile" | "";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // default country code
  const [loading, setLoading] = useState(false);
  const isDisabled =
    loading ||
    (method === "email" && !email.trim()) ||
    (method === "mobile" && !mobile.trim());
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (method === "email") {
      if (!email) {
        toast.error(t("invalidEmail"));
        return;
      }
    }

    if (method === "mobile") {
      if (!mobile || !countryCode) {
        toast.error(t("invalidMobile"));
        return;
      }
    }

    setLoading(true);
    try {
      if (method === "email") {
        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verifyType: 1,
            email,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message);
        }

        toast.success("Password reset link sent to your email.");
        const redirectQuery =
          redirect && !redirect.startsWith("/auth")
            ? `?redirect=${encodeURIComponent(redirect)}`
            : "";

        router.push(`/auth/login-mobile${redirectQuery}`);
      }

      if (method === "mobile") {
        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verifyType: 2,
            mobile,
            countryCode,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message);
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
          )}&otpId=${otpId}&expiry=${otpExpiryTime}&flow=forgotPassword${redirectQuery}`
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold section_title mb-1">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {t("forgotPasswordSubtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Method Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#2f2f2f]">
            {t("selectMethod")}
          </label>

          <div className="flex gap-3">
            {/* Email Button */}
            <button
              type="button"
              onClick={() => setMethod("email")}
              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer
                ${method === "email"
                  ? "border-[#f3c200] bg-yellow-50"
                  : "border-transparent bg-gray-300"
                }`}
            >
              {t("email")}
            </button>

            {/* Mobile Button */}
            <button
              type="button"
              onClick={() => setMethod("mobile")}
              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-4 py-2.5 text-sm font-medium
                ${method === "mobile"
                  ? "border-[#f3c200] bg-yellow-50"
                  : "border-transparent bg-gray-300 cursor-pointer"
                }`}
            >
              {t("mobile")}
            </button>
          </div>
        </div>

        {/* Email Input */}
        {method === "email" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#2f2f2f]">
              {t("emailAddress")}
            </label>
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="auth-input w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
                focus:outline-none focus:!border-[#f3c200]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault();
              }}
              required
            />
          </div>
        )}

        {/* Mobile Input */}
        {method === "mobile" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#2f2f2f]">
              {t("mobileNumber")}
            </label>
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
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!method || loading || isDisabled}
          className="auth-button w-full rounded-lg btn-primary py-3 font-semibold
            hover:bg-yellow-400 hover:text-black transition disabled:opacity-50"
        >
          {loading
            ? t("sending")
            : method === "email"
              ? t("sendResetLink")
              : t("sendOtp")}
        </button>

        {/* Back to login */}
        <p className="text-center text-sm">
          <Link
            href="/auth/login-mobile"
            className="font-semibold hover:text-[#f3c200] hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </p>
      </form>
    </div>
  );
}