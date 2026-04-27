"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import ErrorMessage from "@/src/components/ui/errorMessage";
import { toast } from "sonner";

type TokenStatus = "validating" | "valid" | "invalid";

type GuestProfileClientProps = {
  token?: string;
};

const PASSWORD_RULES = {
  minLength: /^.{8,}$/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  noSpaces: /^\S+$/,
};

export default function GuestProfileClient({ token }: GuestProfileClientProps) {
  const t = useTranslations();
  const router = useRouter();

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const getMessage = (data: any) => {
    let msg = data?.message || data?.msg;

    // 🔥 Handle stringified JSON
    if (typeof msg === "string") {
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.msg) {
          return parsed.msg;
        }
      } catch {
        // not JSON, ignore
      }
    }

    return msg || "Something went wrong";
  };
  const handleResendToken = async () => {
    if (!token) return;

    try {
      setResendLoading(true);

      const res = await fetch("/api/validatePasswordToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          validateType: 2,
        }),
      });
      const data = await res.json();
      const message = getMessage(data);

      if (!res.ok) {
        toast.error(message);
        return;
      }

      toast.success(message);

    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setResendLoading(false);
    }
  };
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        return;
      }

      try {
        const res = await fetch("/api/validatePasswordToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              token,
              validateType: 1,
            }),
        });

        if (!res.ok) {
          setTokenStatus("invalid");
          return;
        }

        const data = await res.json();
        setEmail(data?.emailId || "");
        setTokenStatus("valid");
      } catch {
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [token]);

  const passwordChecks = useMemo(
    () => ({
      minLength: PASSWORD_RULES.minLength.test(password),
      uppercase: PASSWORD_RULES.uppercase.test(password),
      lowercase: PASSWORD_RULES.lowercase.test(password),
      number: PASSWORD_RULES.number.test(password),
      noSpaces: PASSWORD_RULES.noSpaces.test(password),
      matches: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
    }),
    [password, confirmPassword]
  );

  const validationError = useMemo(() => {
    if (!password) return t("fieldRequired");
    if (!passwordChecks.minLength) return t("passwordMinError");
    if (!passwordChecks.uppercase) return t("guestProfilePasswordUppercase");
    if (!passwordChecks.lowercase) return t("guestProfilePasswordLowercase");
    if (!passwordChecks.number) return t("guestProfilePasswordNumber");
    if (!passwordChecks.noSpaces) return t("guestProfilePasswordNoSpaces");
    if (!confirmPassword) return t("fieldRequired");
    if (password !== confirmPassword) return t("passwordMismatch");
    return "";
  }, [confirmPassword, password, passwordChecks, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/setPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword: password,
          token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("passwordResetFailed"));
      }

      router.push("/auth/login-mobile");
    } catch (err: any) {
      setError(err.message || t("checkoutError"));
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !password || !confirmPassword || !!validationError;

  if (tokenStatus === "validating") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6cf,transparent_40%),linear-gradient(180deg,#f9fafb_0%,#f3f4f6_100%)] px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-white/70 bg-white/95 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FECB02]/15 text-[#8a6a00]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#1f2937]">{t("guestProfileVerifyingTitle")}</h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">{t("guestProfileVerifyingDescription")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1bd,transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
            <div className="bg-[linear-gradient(135deg,#fff7d6_0%,#ffffff_60%)] px-8 pb-6 pt-8 text-center">
              <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm">
                <ShieldX className="h-9 w-9" />
              </div>
              <h1 className="text-2xl font-bold text-[#111827]">{t("guestProfileInvalidTitle")}</h1>
              <p className="mt-3 text-sm leading-6 text-gray-500">{t("guestProfileInvalidDescription")}</p>
            </div>

            <div className="space-y-4 px-8 pb-8">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <p>{t("guestProfileInvalidHint")}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  onClick={handleResendToken}
                  disabled={resendLoading}
                >
                  {resendLoading ? "Sending..." : t("guestProfileResetPassword")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff5cb,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[linear-gradient(160deg,#111827_0%,#1f2937_35%,#374151_100%)] p-8 text-white sm:p-10">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#FECB02] backdrop-blur-sm">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FECB02]">
                  {t("guestProfileBadge")}
                </p>
                <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                  {t("guestProfileTitle")}
                </h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                  {t("guestProfileSubtitle")}
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  {t("guestProfileSecurityTitle")}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-white/80">
                  {[
                    t("guestProfilePasswordRuleMin"),
                    t("guestProfilePasswordRuleUpperLower"),
                    t("guestProfilePasswordRuleNumber"),
                    t("guestProfilePasswordRuleNoSpaces"),
                  ].map((rule) => (
                    <li key={rule} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FECB02]" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#111827]">{t("guestProfileFormTitle")}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">{t("guestProfileFormSubtitle")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="guest-email">{t("email")}</Label>
                  <Input
                    id="guest-email"
                    value={email}
                    disabled
                    placeholder={t("emailPlaceholder")}
                    className="mt-1 bg-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="guest-password" required>
                    {t("newPassword")}
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="guest-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder={t("enterNewPassword")}
                      error={!!password && !!validationError}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((state) => !state)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-800"
                      aria-label={showPassword ? t("hide") : t("show")}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="guest-confirm-password" required>
                    {t("confirmPassword")}
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="guest-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      placeholder={t("enterConfirmPassword")}
                      error={!!confirmPassword && password !== confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((state) => !state)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-800"
                      aria-label={showConfirmPassword ? t("hide") : t("show")}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {t("guestProfileChecklistTitle")}
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {[
                      { ok: passwordChecks.minLength, label: t("guestProfilePasswordRuleMin") },
                      { ok: passwordChecks.uppercase && passwordChecks.lowercase, label: t("guestProfilePasswordRuleUpperLower") },
                      { ok: passwordChecks.number, label: t("guestProfilePasswordRuleNumber") },
                      { ok: passwordChecks.noSpaces, label: t("guestProfilePasswordRuleNoSpaces") },
                      { ok: passwordChecks.matches, label: t("guestProfilePasswordRuleMatch") },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm">
                        {item.ok ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                        )}
                        <span className={item.ok ? "text-gray-800" : "text-gray-500"}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <ErrorMessage message={error || undefined} />

                <Button type="submit" size="lg" disabled={isDisabled} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("guestProfileSaving")}
                    </>
                  ) : (
                    t("guestProfileSubmit")
                  )}
                </Button>

                {/* <p className="text-center text-sm text-gray-500">
                  {t("guestProfileNeedNewLink")}{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                    className="font-semibold text-[#8a6a00] transition-colors hover:text-[#6f5600]"
                  >
                    {t("guestProfileResetPassword")}
                  </button>
                </p> */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
