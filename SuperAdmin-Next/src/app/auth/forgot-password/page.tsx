"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslations } from "next-intl";
import { AuthService } from "@/src/lib/services/auth";
import { getCookie } from "cookies-next";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/input";
import { CountryCurrency } from "@/src/models/api/response/auth";
import { getErrorMessage } from "@/src/lib/utils/errorMessage";

type Method = "email" | "mobile" | "";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const defaultCountry = (getCookie("C_code") as string || "pr").toLowerCase();
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // default country code
  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDisabled =
    loading ||
    (method === "email" && !email.trim()) ||
    (method === "mobile" && !mobile.trim());
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (method === "email") {
      if (!email) {
        toast.error(t("emailRequired"));
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error(t("emailInvalid"));
        return;
      }
    }

    if (method === "mobile") {
      if (!mobile || !countryCode) {
        setMobileError(t("invalidMobile"));
        return;
      }
      if (mobile.length < 10) {
        setMobileError(t("invalidMobile"));
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
      toast.error(getErrorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchCountries = async () => {

      setCountriesLoading(true);
      try {
        const res = await AuthService.getCurrency();
        const list = res?.data ?? [];
        setCountries(list);


      } catch {
        toast.error("Failed to load countries");
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);
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

      <form onSubmit={onSubmit} noValidate className="space-y-6">
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
            />
          </div>
        )}

        {/* Mobile Input */}
        {method === "mobile" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#2f2f2f]">
              {t("mobileNumber")}
            </label>
            {countriesLoading || countries.length === 0 ? (
              <div className="w-full h-[44px] rounded-lg border border-[#2f2f2f] px-4 flex items-center text-sm text-gray-400">
                Loading...
              </div>
            ) : (
              <div
                className="flex items-center rounded-lg border border-[#2f2f2f] hover:border-[#f3c200] focus-within:border-[#f3c200] transition-colors duration-200"
                style={{ height: "44px", overflow: "visible", width: "100%" }}
              >
                <div className="shrink-0 flex items-center pl-2">
                  <PhoneInput
                    key={defaultCountry}
                    country={defaultCountry}
                    onlyCountries={countries.map(c => c.countryCode.toLowerCase())}
                    containerStyle={{ height: "44px", width: "40px", flexShrink: 0 }}
                    containerClass="!h-full"
                    countryCodeEditable={false}
                    disableCountryCode={false}
                    inputStyle={{ display: "none" }}
                    buttonStyle={{
                      height: "44px",
                      width: "40px",
                      border: "none",
                      backgroundColor: "transparent",
                      position: "static",
                    }}
                    buttonClass="!border-0 !bg-transparent !shadow-none !static"
                    dropdownStyle={{ zIndex: 9999 }}
                    onMount={(_value, data: any) => {
                      setCountryCode(`+${data.dialCode}`);
                    }}
                    onChange={(_value, data: any) => {
                      setCountryCode(`+${data.dialCode}`);
                    }}
                  />
                </div>
                <span className="text-sm text-gray-700 shrink-0 mx-1">
                  {countryCode}
                </span>
                <input
                  style={{ height: "44px" }}
                  placeholder="Phone Number"
                  className="flex-1 min-w-0 border-0 shadow-none outline-none ring-0 text-sm px-3 bg-transparent focus:outline-none focus:ring-0"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setMobile(digits);
                    if (mobileError) setMobileError("");
                  }}
                  onBlur={() => {
                    if (mobile && mobile.length < 10) {
                      setMobileError(t("invalidMobile"));
                    }
                  }}
                />
              </div>
            )}
            {mobileError && (
              <p className="text-xs text-red-500 mt-1">{mobileError}</p>
            )}
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
      {/* We're Here to Help */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-base font-semibold text-[#2f2f2f] mb-4">
          {t("hereToHelp")}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Call Us */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">{t("callUs")}</p>
            <a
              href="tel:+17873023322"
              className="flex items-center justify-center gap-2 border border-[#f3c200] bg-[#fffdf0] rounded-full px-3 py-2.5 text-sm font-medium text-[#2f2f2f] hover:bg-yellow-100 transition whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
              </svg>
              +1 7873023322
            </a>
          </div>

          {/* Chat With Us */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">{t("chatWithUs")}</p>
            <a
              href="https://wa.me/message/3W4K2DPCDJV3C1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-green-400 bg-green-50 rounded-full px-3 py-2.5 text-sm font-medium text-[#2f2f2f] hover:bg-green-100 transition text-center leading-tight"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("chatOnWhatsApp")}
            </a>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-4 mt-5">
          <a href="https://www.instagram.com/donrifallc" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <defs>
                <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                  <stop offset="0%" stopColor="#fdf497" />
                  <stop offset="5%" stopColor="#fdf497" />
                  <stop offset="45%" stopColor="#fd5949" />
                  <stop offset="60%" stopColor="#d6249f" />
                  <stop offset="90%" stopColor="#285AEB" />
                </radialGradient>
              </defs>
              <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
              <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5" />
              <circle cx="17" cy="7" r="1" fill="white" />
              <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="white" strokeWidth="1.5" />
            </svg>
          </a>
          <a href="https://www.facebook.com/donrifallc/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#1877F2" />
              <path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.2 12.5H13V20H10.5V12.5H9V10H10.5V8.5C10.5 6.6 11.6 5.5 13.5 5.5H15.5V8Z" fill="white" />
            </svg>
          </a>
          <a href="https://www.youtube.com/channel/UCeeQ4yfMdHvK_ViM_5oRvow/videos" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#FF0000" />
              <path d="M19.6 8.4C19.4 7.6 18.8 7 18 6.8 16.6 6.5 12 6.5 12 6.5S7.4 6.5 6 6.8C5.2 7 4.6 7.6 4.4 8.4 4.1 9.8 4 12 4 12S4.1 14.2 4.4 15.6C4.6 16.4 5.2 17 6 17.2 7.4 17.5 12 17.5 12 17.5S16.6 17.5 18 17.2C18.8 17 19.4 16.4 19.6 15.6 19.9 14.2 20 12 20 12S19.9 9.8 19.6 8.4Z" fill="white" />
              <polygon points="10,9.5 10,14.5 15,12" fill="#FF0000" />
            </svg>
          </a>
          <a href="https://x.com/donrifallc/" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#000000" />
              <path d="M17.75 5h-2.5l-3.25 4.5L8.75 5H4l5.5 7.5L4 19h2.5l3.5-4.75L13.5 19H18l-5.75-7.75L17.75 5Z" fill="white" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
