"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslations } from "next-intl";

type Method = "email" | "mobile" | "";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations();

  const [method, setMethod] = useState<Method>("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const value = method === "email" ? email : mobile;

      router.push(
        `/auth/verify-otp?method=${method}&value=${encodeURIComponent(value)}`
      );
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
            <button
              type="button"
              onClick={() => setMethod("email")}
              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer
                ${method === "email"
                  ? "border-[#f3c200] bg-yellow-50"
                  : "border-transparent bg-gray-300"
                }`}
            >
              <svg className="w-5 h-5 leading-1" viewBox="0 0 640 640"><path d="M125.4 128C91.5 128 64 155.5 64 189.4C64 190.3 64 191.1 64.1 192L64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192L575.9 192C575.9 191.1 576 190.3 576 189.4C576 155.5 548.5 128 514.6 128L125.4 128zM528 256.3L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 256.3L266.8 373.7C298.2 397.6 341.7 397.6 373.2 373.7L528 256.3zM112 189.4C112 182 118 176 125.4 176L514.6 176C522 176 528 182 528 189.4C528 193.6 526 197.6 522.7 200.1L344.2 335.5C329.9 346.3 310.1 346.3 295.8 335.5L117.3 200.1C114 197.6 112 193.6 112 189.4z"/></svg>
              {t("email")}
            </button>

            <button
              type="button"
              onClick={() => setMethod("mobile")}
              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-4 py-2.5 text-sm font-medium
                ${method === "mobile"
                  ? "border-[#f3c200] bg-yellow-50"
                  : "border-transparent bg-gray-300 cursor-pointer"
                }`}
            >
              <svg className="w-5 h-5 leading-1" x="0" y="0" viewBox="0 0 32 32"><g><path d="M22.56 30a5.16 5.16 0 0 1-2-.41A34.53 34.53 0 0 1 2.4 11.42a5 5 0 0 1 1.06-5.51l3-3a3 3 0 0 1 4.24 0l3.53 3.53a3 3 0 0 1 0 4.24l-1.63 1.65a12.54 12.54 0 0 0 7.07 7.07l1.68-1.67a3 3 0 0 1 4.24 0l3.53 3.53a3 3 0 0 1 0 4.24l-3 3a5 5 0 0 1-3.56 1.5zM8.62 4a1 1 0 0 0-.71.29l-3 3a3 3 0 0 0-.64 3.31 32.47 32.47 0 0 0 17.1 17.16 3 3 0 0 0 3.31-.64l3-3a1 1 0 0 0 0-1.42l-3.54-3.53a1 1 0 0 0-1.41 0l-2.12 2.12a1 1 0 0 1-1 .24 14.42 14.42 0 0 1-9.12-9.12 1 1 0 0 1 .24-1l2.12-2.12a1 1 0 0 0 .29-.71 1 1 0 0 0-.29-.7L9.33 4.29A1 1 0 0 0 8.62 4z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>
              {t("mobile")}
            </button>
          </div>
        </div>

        {method === "email" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#2f2f2f]">
              {t("emailAddress")}
            </label>
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
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
              {t("mobileNumber")}
            </label>
            <div className="phone-input">
            <PhoneInput
              country="us"
              value={mobile}
              onChange={(phone) => setMobile(phone)}
              inputClass="!bg-transparent !w-full !h-[46px] !text-sm !rounded-lg !border-[#2f2f2f] focus:!border-[#f3c200]"
            />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!method || loading}
          className="auth-button w-full rounded-lg btn-primary py-3 font-semibold
            hover:bg-yellow-400 hover:text-black transition disabled:opacity-50"
        >
          {loading ? t("sending") : t("sendOtp")}
        </button>

        <p className="text-center text-sm">
          <Link
            href="/auth/login"
            className="font-semibold hover:text-[#f3c200] hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </p>
      </form>
    </div>
  );
}
