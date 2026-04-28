"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Loader2,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import ErrorMessage from "@/src/components/ui/errorMessage";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/src/components/ui/input-otp";

const OTP_LENGTH = 6;

type Props = {
  email: string;
  onSuccess: () => void;
};

export default function MobileOTPStep({ email, onSuccess }: Props) {
  const t = useTranslations();

  const [countryCode, setCountryCode] = useState("+971");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  const handleSendOtp = async () => {
    const cleaned = mobile.replace(/\D/g, "");
    if (!cleaned) {
      setError(t("fieldRequired"));
      return;
    }

    try {
      setSendingOtp(true);
      setError(null);

      // TODO: replace with actual endpoint when ready
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, mobile: cleaned, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setOtpSent(true);
      startResendCooldown();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < OTP_LENGTH) {
      setError(t("guestProfileOtpInvalid"));
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      // TODO: replace with actual endpoint when ready
      const res = await fetch("/api/verify-mobile-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          mobile: mobile.replace(/\D/g, ""),
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("guestProfileOtpInvalid"));
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="grid w-full overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[0.95fr_1.05fr]">
      {/* Left panel */}
      <div className="bg-[linear-gradient(160deg,#111827_0%,#1f2937_35%,#374151_100%)] p-8 text-white sm:p-10">
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#FECB02] backdrop-blur-sm">
              <Phone className="h-7 w-7" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FECB02]">
              {t("guestProfileBadge")}
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              {t("guestProfileMobileTitle")}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
              {t("guestProfileMobileSubtitle")}
            </p>

            {/* Step indicator */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white/60">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-sm text-white/60 line-through">
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

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              {t("guestProfileWhyMobileTitle")}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/70">
              {t("guestProfileWhyMobileDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="p-8 sm:p-10">
        <div className="mx-auto max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#111827]">
              {t("guestProfileMobileFormTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {t("guestProfileMobileFormSubtitle")}
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* Mobile number row */}
            <div>
              <Label htmlFor="guest-mobile" required>
                {t("guestProfileMobileNumber")}
              </Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="guest-country-code"
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setError(null);
                    setOtpSent(false);
                  }}
                  className="w-24 shrink-0"
                  placeholder="+971"
                  disabled={otpSent}
                />
                <Input
                  id="guest-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    setError(null);
                    setOtpSent(false);
                    setOtp("");
                  }}
                  placeholder={t("guestProfileMobilePlaceholder")}
                  disabled={otpSent}
                />
              </div>
            </div>

            {/* Send OTP button — shown before OTP is sent */}
            {!otpSent && (
              <Button
                type="button"
                size="lg"
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

            {/* OTP input — shown after OTP is sent */}
            {otpSent && (
              <>
                <div>
                  <Label required>{t("guestProfileOtpLabel")}</Label>
                  <p className="mb-3 mt-1 text-sm text-gray-500">
                    {t("guestProfileOtpSentTo")} {countryCode} {mobile}
                  </p>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={OTP_LENGTH}
                      value={otp}
                      onChange={(val) => {
                        setOtp(val);
                        setError(null);
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="h-12 w-12 text-lg"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {/* Resend */}
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendCooldown > 0 || sendingOtp}
                    className="flex items-center gap-1.5 font-semibold text-[#8a6a00] transition-colors hover:text-[#6f5600] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${sendingOtp ? "animate-spin" : ""}`}
                    />
                    {resendCooldown > 0
                      ? `${t("guestProfileOtpResendIn")} ${resendCooldown}s`
                      : t("guestProfileOtpResend")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setError(null);
                    }}
                    className="text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {t("guestProfileMobileChange")}
                  </button>
                </div>

                <ErrorMessage message={error || undefined} />

                <Button
                  type="submit"
                  size="lg"
                  disabled={verifying || otp.length < OTP_LENGTH}
                  className="w-full"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("guestProfileOtpVerifying")}
                    </>
                  ) : (
                    t("guestProfileOtpVerify")
                  )}
                </Button>
              </>
            )}

            {/* Show error before OTP is sent */}
            {!otpSent && <ErrorMessage message={error || undefined} />}
          </form>
        </div>
      </div>
    </div>
  );
}