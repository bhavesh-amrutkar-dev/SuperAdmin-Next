"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type Method = "email" | "mobile" | "";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [method, setMethod] = useState<Method>("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const value = method === "email" ? email : mobile;

      console.log({ method, value });
      // 🔹 call forgot-password API here

      // ✅ redirect after success
      router.push(
        `/auth/verify-otp?method=${method}&value=${encodeURIComponent(value)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold section_title mb-1">
          Forgot password
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Choose how you want to receive the verification code
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Method Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#2f2f2f]">
            Select method
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMethod("email")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium
                ${method === "email"
                  ? "border-[#f3c200] bg-yellow-50"
                  : "border-[#2f2f2f]"
                }`}
            >
              Email
            </button>

            <button
              type="button"
              onClick={() => setMethod("mobile")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium
                ${method === "mobile"
                  ? "border-[#f3c200] bg-yellow-50"
                  : "border-[#2f2f2f]"
                }`}
            >
              Mobile
            </button>
          </div>
        </div>

        {method === "email" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#2f2f2f]">
              Email address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="auth-input w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
                focus:outline-none focus:!border-[#f3c200]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        {method === "mobile" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#2f2f2f]">
              Mobile number
            </label>

            <PhoneInput
              country="us"
              value={mobile}
              onChange={(phone) => setMobile(phone)}
              inputClass="!w-full !h-[44px] !text-sm !rounded-lg !border-[#2f2f2f]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!method || loading}
          className="auth-button w-full rounded-lg btn-primary py-3 font-semibold
            hover:bg-yellow-400 hover:text-black transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <p className="text-center text-sm">
          <Link
            href="/auth/login"
            className="font-semibold hover:text-[#f3c200] hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
}
