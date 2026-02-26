"use client";

import { mapAuthSession } from "@/src/lib/mappers/auth";
import { AuthService } from "@/src/lib/services/auth";
import { persistAuthSession } from "@/src/lib/session/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { apiClient } from "@/src/lib/api/axios";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { setCookie } from "cookies-next";

export default function VerifyOtpPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  const flow = searchParams.get("flow") || "login";
  const method = searchParams.get("method") || "mobile"; // email or mobile
  const value = searchParams.get("value") || "";
  const otpId = searchParams.get("otpId");

  const [step, setStep] = useState<"otp" | "resetPassword">("otp");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const expiry = Number(searchParams.get("expiry") || 180);
  const [timer, setTimer] = useState(expiry);
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [loading, setLoading] = useState(false);

  // Extract countryCode and mobile if method is mobile
  const { countryCode, mobile } = useMemo(() => {
    if (!value) return { countryCode: "", mobile: "" };
    if (method === "mobile") {
      const match = value.match(/^(\+\d+)(\d+)$/);
      return {
        countryCode: match?.[1] || "",
        mobile: match?.[2] || "",
      };
    }
    return { countryCode: "", mobile: value };
  }, [value, method]);

  const handleChange = (val: string, index: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  useEffect(() => {
    if (timer <= 0) return;
    const tId = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(tId);
  }, [timer]);

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
        verifyType: method === "mobile" ? 2 : 1,
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

      if (flow === "forgotPassword" && method === "email") {
        toast.success("Password reset link sent to your email.");
        router.push("/auth/login");
        return;
      }
      if (flow === "forgotPassword" && method === "mobile") {
        console.log("OTP verified, opening reset form");

        // Save token directly for reset API
        localStorage.setItem("reset_token", res.data.accessToken);
        setCookie("token", res.data.accessToken, {
          path: "/",
          sameSite: "lax",
        });
        setStep("resetPassword");
        setOtp(Array(4).fill(""));
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
    if (method === "mobile" && (!mobile || !countryCode)) return;

    try {
      let res;
      if (method === "mobile") {
        res = await AuthService.mobileLogin({ mobile, countryCode });
      } else {
        res = await AuthService.forgotPassword({
          verifyType: 1,
          email: value,
        });
      }

      if (!res?.data) throw new Error("Failed to resend OTP");

      const { otpId: newOtpId, otpExpiryTime } = res.data || {};

      setOtp(Array(4).fill(""));
      setTimer(otpExpiryTime || expiry);

      if (method === "mobile") {
        router.replace(
          `/auth/verify-otp?method=mobile&value=${encodeURIComponent(
            `${countryCode}${mobile}`
          )}&otpId=${newOtpId}&expiry=${otpExpiryTime}`
        );
      } else {
        toast.success("Password reset link sent again to your email.");
      }
    } catch {
      toast.error(t("otpInvalidGeneric"));
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl p-6 sm:p-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {step === "otp"
              ? t("verifyOtpTitle")
              : t("resetPasswordTitle")}
          </h1>

          <p className="text-sm text-muted-foreground">
            {step === "otp"
              ? t("verifyOtpSubtitle", { method })
              : t("resetPasswordSubtitle")}
          </p>

          {step === "otp" && (
            <p className="text-sm font-medium break-all text-foreground">
              {value}
            </p>
          )}
        </div>

        {/* OTP Form */}
        {step === "otp" && (
          <form onSubmit={onSubmit} className="mt-8 space-y-6">
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
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-border bg-muted/30 text-center text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FECB02]/40 focus:border-[#FECB02]"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-[#FECB02] to-[#FFD84D] hover:from-[#FFD84D] hover:to-[#FECB02] text-black shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
              disabled={loading || otp.some((d) => !d)}
            >
              {loading ? t("verifying") : t("verifyContinue")}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t("didntReceiveCode")}{" "}
              {timer > 0 ? (
                <span className="font-medium text-foreground">
                  {t("resendIn", { time: timer })}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  className="font-bold text-[#FECB02] hover:underline transition"
                >
                  {t("resendOtp")}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Reset Password Form */}
        {step === "resetPassword" && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (password !== confirmPassword) {
                toast.error(t("passwordMismatch"));
                return;
              }

              setLoading(true);
              try {
                await AuthService.resetPassword({
                  newPassword: password,
                  resetType: 1,
                });

                toast.success(t("passwordResetSuccess"));
                router.push("/auth/login");
              } catch (err: any) {
                toast.error(err?.message || t("passwordResetFailed"));
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-5 mt-6"
          >
            <div className="space-y-2">
              <Label>{t("newPassword")}</Label>
              <Input
                type="password"
                placeholder={t("enterNewPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("confirmPassword")}</Label>
              <Input
                type="password"
                placeholder={t("enterConfirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("resetting") : t("resetPassword")}
            </Button>
          </form>
        )}
        
      </div>
    </div>
  );
}