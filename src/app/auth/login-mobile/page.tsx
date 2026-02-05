"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";

import { AuthService } from "@/src/lib/services/auth";
import { IMobileLoginRM } from "@/src/models/api/request/auth";

export default function LoginMobilePage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobile || !countryCode) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    const payload: IMobileLoginRM = {
      mobile,
      countryCode,
    };

    setLoading(true);
    try {
      const res = await AuthService.mobileLogin(payload);

      if (!res?.data) {
        throw new Error("Invalid OTP response");
      }

      const { otpId, otpExpiryTime } = res.data;

      router.push(
        `/auth/verify-otp?method=mobile&value=${encodeURIComponent(
          `${countryCode}${mobile}`
        )}&otpId=${otpId}&expiry=${otpExpiryTime}`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] border border-gray-200 p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold section_title">
          Log in with phone
        </h1>
        <p className="text-sm text-[#7c7878] mt-1">
          We’ll send a one-time password to your number
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Mobile */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#2f2f2f]">
            Mobile number
          </label>

          <PhoneInput
            country="in"
            value={`${countryCode.replace("+", "")}${mobile}`}
            onChange={(value, data: any) => {
              setCountryCode(`+${data.dialCode}`);
              setMobile(value.slice(data.dialCode.length));
            }}
            inputClass="!w-full !h-[44px] !text-sm !rounded-lg !border-[#2f2f2f] focus:!border-[#f3c200]"
            buttonClass="!border-[#2f2f2f]"
            containerClass="!w-full"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !mobile}
          className="w-full rounded-lg btn-primary py-3 text-white font-semibold hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 !border-0"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        {/* OR CONNECT WITH */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-500 font-medium">
              OR CONNECT WITH
            </span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <Link
            href="/auth/login"
            className="mt-4 flex items-center justify-center rounded-lg border border-[#2f2f2f] py-2.5 text-sm font-semibold text-[#2f2f2f] hover:border-[#f3c200] hover:text-[#f3c200] transition"
          >
            LOG IN WITH EMAIL
          </Link>
        </div>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-[#2f2f2f]">
        Don’t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold hover:text-[#f3c200] hover:underline transition"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
