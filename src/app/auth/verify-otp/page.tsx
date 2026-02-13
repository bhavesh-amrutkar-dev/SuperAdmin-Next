"use client";

import { mapAuthSession } from "@/src/lib/mappers/auth";
import { AuthService } from "@/src/lib/services/auth";
import { persistAuthSession } from "@/src/lib/session/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";

export default function VerifyOtpPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  const flow = searchParams.get("flow");
  const method = searchParams.get("method") || "mobile";
  const value = searchParams.get("value") || "";
  const otpId = searchParams.get("otpId");

  const expiry = Number(searchParams.get("expiry") || 180);
  const [timer, setTimer] = useState(expiry);
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [loading, setLoading] = useState(false);

  const { countryCode, mobile } = useMemo(() => {
    if (!value) return { countryCode: "", mobile: "" };
    const match = value.match(/^(\+\d+)(\d+)$/);
    return {
      countryCode: match?.[1] || "",
      mobile: match?.[2] || "",
    };
  }, [value]);

  useEffect(() => {
    if (timer <= 0) return;
    const tId = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(tId);
  }, [timer]);

  const handleChange = (val: string, index: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[index] = val;
    setOtp(next);

    if (val && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      toast.error(t("otpInvalid"));
      return;
    }

    if (!otpId) {
      toast.error(t("otpExpired"));
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.verifyOtp({
        otpCode,
        otpId,
        verifyType: 2,
      });

      if (!res?.data) throw new Error(t("otpAuthFailed"));

      if (flow === "signup") {
        const payload = sessionStorage.getItem("signup_payload");
        if (!payload) throw new Error("Signup data missing");

        const signupData = JSON.parse(payload);
        const signupRes = await AuthService.signUp(signupData);

        const session = mapAuthSession(signupRes.data);
        persistAuthSession(session);

        sessionStorage.removeItem("signup_payload");
        router.replace("/address");
        return;
      }

      const session = mapAuthSession(res.data);
      persistAuthSession(session);
      router.replace("/");
    } catch (err: any) {
      toast.error(err?.message || t("otpInvalidGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!mobile || !countryCode) return;

    try {
      const res = await AuthService.mobileLogin({
        mobile,
        countryCode,
      });

      if (!res?.data) throw new Error("Failed to resend OTP");

      const { otpId, otpExpiryTime } = res.data;

      setOtp(Array(4).fill(""));
      setTimer(otpExpiryTime);

      router.replace(
        `/auth/verify-otp?method=mobile&value=${encodeURIComponent(
          `${countryCode}${mobile}`
        )}&otpId=${otpId}&expiry=${otpExpiryTime}`
      );
    } catch {
      toast.error(t("otpInvalidGeneric"));
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">

      {/* Container */}
      <div className="w-full max-w-md bg-background rounded-2xl  shadow-xl p-6 sm:p-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t("verifyOtpTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("verifyOtpSubtitle", { method })}
          </p>
          <p className="text-sm font-medium break-all text-foreground">
            {value}
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={onSubmit} className="mt-8 space-y-6">

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 sm:gap-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                className="
                h-12 w-12 sm:h-14 sm:w-14
                rounded-xl border border-border
                bg-muted/30
                text-center text-lg font-semibold
                transition-all duration-200
                focus:outline-none 
                focus:ring-2 focus:ring-primary/40 
                focus:border-primary
              "
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl"
            disabled={loading || otp.some((d) => !d)}
          >
            {loading ? t("verifying") : t("verifyContinue")}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t("didntReceiveCode")}{" "}
          {timer > 0 ? (
            <span className="font-medium text-foreground">
              {t("resendIn", { time: timer })}
            </span>
          ) : (
            <button
              onClick={resendOtp}
              className="font-semibold text-primary hover:underline transition"
            >
              {t("resendOtp")}
            </button>
          )}
        </div>

      </div>
    </div>
  );

}
