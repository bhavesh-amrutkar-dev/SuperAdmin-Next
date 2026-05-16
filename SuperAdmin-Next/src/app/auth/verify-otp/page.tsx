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
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/src/context/authContext";
import { getErrorMessage } from "@/src/lib/utils/errorMessage";

export default function VerifyOtpPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth();
  const flow = searchParams?.get("flow") || "login";
  const method = searchParams?.get("method") || "mobile"; // email or mobile
  const value = searchParams?.get("value") || "";
  const otpId = searchParams?.get("otpId");
  const redirect = searchParams?.get("redirect");

  const [step, setStep] = useState<"otp" | "resetPassword">("otp");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const expiry = Number(searchParams?.get("expiry") || 180);
  const [timer, setTimer] = useState(expiry);
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!/^\d*$/.test(val)) return;

    // Handle paste of full OTP
    if (val.length > 1) {
      const digits = val.slice(0, otp.length).split("");
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

    if (val && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

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

        // Auto submit
        document.querySelector("form")?.requestSubmit();
      })
      .catch(() => { });

    return () => ac.abort();
  }, []);
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
        const safeSignupRedirect = redirect && !redirect.startsWith("/auth") ? redirect : "/address";
        router.replace(safeSignupRedirect);
        return;
      }

      if (flow === "forgotPassword" && method === "email") {
        toast.success("Password reset link sent to your email.");
        router.push("/auth/login-mobile");
        return;
      }
      if (flow === "forgotPassword" && method === "mobile") {
        // console.log("OTP verified, opening reset form");

        // Save token directly for reset API
        localStorage.setItem("reset_token", res.data.accessToken);
        setCookie("token", res.data.accessToken, {
          path: "/",
          sameSite: "none",
          secure: true,
          maxAge: 60 * 60 * 24 * 365,
        });
        setStep("resetPassword");
        setOtp(Array(4).fill(""));
        return;
      }

      const session = mapAuthSession(res.data);
      persistAuthSession(session);
      setUser(session);
      const safeRedirect = redirect && !redirect.startsWith("/auth") ? redirect : "/";
      router.replace(safeRedirect);
    } catch (err: any) {
      toast.error(getErrorMessage(err, t("otpInvalidGeneric")));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (method === "mobile" && (!mobile || !countryCode)) {
      toast.error(t("invalidMobile"));
      return;
    }

    try {
      setLoading(true);

      let res;
      let data;

      // Forgot password flow
      if (flow === "forgotPassword") {
        res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verifyType: method === "mobile" ? 2 : 1,
            mobile,
            countryCode,
            email: method === "email" ? value : undefined,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || t("otpSendFailed"));
        }

        data = await res.json();
      }
      // Login / signup flow
      else {
        // console.log(mobile, countryCode);

        res = await fetch("/api/login-mobile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile,
            countryCode,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || t("otpSendFailed"));
        }

        data = await res.json();
      }

      const { otpId: newOtpId, otpExpiryTime } = data.data;

      // reset otp inputs
      setOtp(Array(4).fill(""));

      // reset timer
      setTimer(otpExpiryTime ?? 180);

      // update URL with new otpId
      const redirectQuery =
        redirect && !redirect.startsWith("/auth")
          ? `&redirect=${encodeURIComponent(redirect)}`
          : "";

      router.replace(
        `/auth/verify-otp?method=${method}&value=${encodeURIComponent(
          value
        )}&otpId=${newOtpId}&expiry=${otpExpiryTime}&flow=${flow}${redirectQuery}`
      );

      toast.success(t("otpResent"));
    } catch (err: any) {
      toast.error(getErrorMessage(err, t("otpSendFailed")));
    } finally {
      setLoading(false);
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
                  autoComplete={i === 0 ? "one-time-code" : "off"}
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
                  disabled={loading}
                  className="font-bold text-[#FECB02] hover:underline transition disabled:opacity-50"
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
                router.push("/auth/login-mobile");
              } catch (err: any) {
                toast.error(getErrorMessage(err, t("passwordResetFailed")));
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-5 mt-6"
          >
            <div className="space-y-2">
              <Label>{t("newPassword")}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("enterNewPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="hover:cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("confirmPassword")}</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("enterConfirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="hover:cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("resetting") : t("resetPassword")}
            </Button>
          </form>
        )}
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

    </div>
  );
}
