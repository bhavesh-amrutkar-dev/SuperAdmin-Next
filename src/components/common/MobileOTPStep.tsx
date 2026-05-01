"use client";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Loader2,
  Phone,
} from "lucide-react";

import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import ErrorMessage from "@/src/components/ui/errorMessage";
import { AuthService } from "@/src/lib/services/auth";
import { toast } from "sonner";
import { getCookie } from "cookies-next";
import { CountryCurrency } from "@/src/models/api/response/auth";
import { getErrorMessage } from "@/src/lib/utils/errorMessage";

const OTP_LENGTH = 4;

type Props = {
  email: string;
  mobileToken: string;
  onSuccess: () => void;
};

export default function MobileOTPStep({ email, mobileToken, onSuccess }: Props) {
  const t = useTranslations();
  const defaultCountry = (getCookie("C_code") as string || "pr").toLowerCase();

  const [countryCode, setCountryCode] = useState("");
  const [mobile, setMobile] = useState("");

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpId, setOtpId] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [countries, setCountries] = useState<CountryCurrency[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const [countrySortCode, setCountrySortCode] = useState("us");
  // ⏱ cooldown timer
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🔢 OTP input handling (paste + auto focus)
  const handleChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;

    if (val.length > 1) {
      const digits = val.slice(0, OTP_LENGTH).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < newOtp.length) newOtp[i] = d;
      });
      setOtp(newOtp);
      return;
    }

    const next = [...otp];
    next[index] = val;
    setOtp(next);

    if (val && index < OTP_LENGTH - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // 📲 Auto OTP read (same as verify page)
  useEffect(() => {
    if (!("OTPCredential" in window)) return;

    const ac = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      } as any)
      .then((otp: any) => {
        if (!otp?.code) return;

        const code = otp.code.split("");
        setOtp(code);

        document.querySelector("form")?.requestSubmit();
      })
      .catch(() => { });

    return () => ac.abort();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {

      setCountriesLoading(true);
      try {
        const res = await AuthService.getCurrency();
        setCountries(res?.data ?? []);
      } catch {
        console.log("Failed to load countries");
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // 📩 SEND OTP FLOW
  const handleSendOtp = async () => {
    const cleaned = mobile.replace(/\D/g, "");

    if (!cleaned) {
      setError(t("fieldRequired"));
      return;
    }

    try {
      setSendingOtp(true);
      setError(null);

      // 1️⃣ set mobile
      const res = await fetch("/api/setMobileNumber", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: mobileToken,
          phone: cleaned,
          countryCode,
          mobileNumberSortCode: countrySortCode.toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // 2️⃣ send OTP
      const otpRes = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryCode,
          mobile: cleaned,
          email,
        }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        throw new Error(otpData.message);
      }

      setOtpId(otpData?.data?.otpId); // 🔥 important
      setOtpSent(true);
      startResendCooldown();

    } catch (err: any) {
      toast.error(getErrorMessage(err, "Something went wrong"));
    } finally {
      setSendingOtp(false);
    }
  };

  // ✅ VERIFY OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
      toast.error(t("guestProfileOtpInvalid"));
      return;
    }

    if (!otpId) {
      toast.error("OTP session expired. Please resend OTP.");
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      const res = await AuthService.verifyOtp({
        otpCode,
        otpId,
        verifyType: 2,
      });

      if (!res?.data) {
        throw new Error(t("guestProfileOtpInvalid"));
      }

      onSuccess();

    } catch (err: any) {
      toast.error(getErrorMessage(err, "Invalid OTP"));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="grid w-full overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[0.95fr_1.05fr]">

      {/* LEFT PANEL */}
      <div className="bg-[#2F2F2F] p-8 text-white sm:p-10">
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#FECB02]">
              <Phone className="h-7 w-7" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FECB02]">
              {t("guestProfileBadge")}
            </p>

            <h1 className="mt-4 text-3xl font-bold">
              {t("guestProfileMobileTitle")}
            </h1>

            <p className="mt-4 text-sm text-white/70">
              {t("guestProfileMobileSubtitle")}
            </p>

            {/* Step indicator */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-black">
                ✓
              </div>
              <span className="text-sm text-white">
                {t("guestProfileStepPassword")}
              </span>
            </div>

            <div className="mt-3 ml-3.5 h-8 w-px bg-white/20" />

            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FECB02] text-xs font-bold text-black">
                2
              </div>
              <span className="text-sm font-semibold text-white">
                {t("guestProfileStepMobile")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="p-8 sm:p-10">
        <div className="mx-auto max-w-md">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#111827]">
              {t("guestProfileMobileFormTitle")}
            </h2>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-5">

            {/* 📱 Phone Input */}
            <div>
              <Label>{t("guestProfileMobileNumber")}</Label>
              {countriesLoading || countries.length === 0 ? (
                <div className="w-full h-[44px] rounded-lg border border-[#2f2f2f] px-4 flex items-center text-sm text-gray-400">
                  Loading...
                </div>
              ) : (
                <PhoneInput
                  country={defaultCountry}
                  countryCodeEditable={false}
                  value={`${countryCode.replace("+", "")}${mobile}`}
                  onlyCountries={countries.map(c => c.countryCode.toLowerCase())}
                  onChange={(value, data: any) => {
                    setCountryCode(`+${data.dialCode}`);
                    setMobile(value.slice(data.dialCode.length));
                    setCountrySortCode(data.countryCode);
                    setOtpSent(false);
                    setOtp(Array(OTP_LENGTH).fill(""));
                    setError(null);
                  }}
                  inputClass="!w-full !h-[44px]"
                />)}
            </div>

            {/* SEND OTP */}
            {!otpSent && (
              <Button
                type="button"
                className="w-full"
                onClick={handleSendOtp}
                disabled={sendingOtp || !mobile}
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("guestProfileOtpSending")}
                  </>
                ) : (
                  t("guestProfileOtpSend")
                )}
              </Button>
            )}

            {/* OTP SECTION */}
            {otpSent && (
              <div className="border-t pt-6 mt-6 space-y-5">

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {t("guestProfileOtpSentTo")} {countryCode} {mobile}
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, i)}
                      className="h-12 w-12 rounded-xl border text-center text-lg focus:ring-2 focus:ring-yellow-400"
                    />
                  ))}
                </div>
                {/* 
                <div className="text-center text-sm text-gray-500">
                  {resendCooldown > 0 ? (
                    <span>{t("resendIn", { time: resendCooldown })}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-yellow-600 font-semibold hover:underline"
                    >
                      {t("resendOtp")}
                    </button>
                  )}
                </div> */}

                {/* <ErrorMessage message={error || undefined} /> */}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifying || otp.some((d) => !d)}
                >
                  {verifying ? "Verifying..." : t("guestProfileOtpVerify")}
                </Button>
              </div>
            )}

            {/* {!otpSent && <ErrorMessage message={error || undefined} />} */}

          </form>
        </div>
      </div>
    </div>
  );
}
