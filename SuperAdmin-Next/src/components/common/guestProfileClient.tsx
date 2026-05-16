"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldX,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import SetPasswordStep from "@/src/components/common/SetPasswordStep";
import MobileOTPStep from "@/src/components/common/MobileOTPStep";
import { getErrorMessage } from "@/src/lib/utils/errorMessage";

type TokenStatus = "validating" | "valid" | "invalid";
type Step = "password" | "mobile" | "done";

type GuestProfileClientProps = {
  token?: string;
};

export default function GuestProfileClient({ token }: GuestProfileClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("password");
  const [resendLoading, setResendLoading] = useState(false);
  const [mobileToken, setMobileToken] = useState<string>("");
  const getMessage = (data: any) => {
    let msg = data?.message || data?.msg;
    if (typeof msg === "string") {
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.msg) return parsed.msg;
      } catch {
        // not JSON
      }
    }
    return msg || "Something went wrong";
  };

  useEffect(() => {
    const validateToken = async () => {
      const mobileTokenFromUrl = searchParams.get("mobileToken");

      // 🔥 pick token dynamically
      const effectiveToken = mobileTokenFromUrl || token;

      if (!effectiveToken) {
        setTokenStatus("invalid");
        return;
      }

      try {
        const res = await fetch("/api/validatePasswordToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: effectiveToken,
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

        // 🔥 if mobileToken exists → go to mobile step
        if (mobileTokenFromUrl) {
          setMobileToken(mobileTokenFromUrl);
          setStep("mobile");
        }

      } catch {
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [token, searchParams]);
  useEffect(() => {
    if (tokenStatus !== "valid") return; // 🔥 IMPORTANT

    const tokenFromUrl = searchParams.get("mobileToken");

    if (tokenFromUrl) {
      setMobileToken(tokenFromUrl);
      setStep("mobile");
    }
  }, [searchParams, tokenStatus]);
  // Auto-redirect after "done" step
  useEffect(() => {
    if (step !== "done") return;
    const timer = setTimeout(() => router.push("/auth/login-mobile"), 3000);
    return () => clearTimeout(timer);
  }, [step, router]);

  const handleResendToken = async () => {
    if (!token) return;

    try {
      setResendLoading(true);
      const res = await fetch("/api/validatePasswordToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, validateType: 2 }),
      });
      const data = await res.json();
      const message = getMessage(data);

      if (!res.ok) {
        toast.error(message);
        return;
      }
      toast.success(message);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Something went wrong"));
    } finally {
      setResendLoading(false);
    }
  };

  // ── Validating ──────────────────────────────────────────────────────────────
  if (tokenStatus === "validating") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6cf,transparent_40%),linear-gradient(180deg,#f9fafb_0%,#f3f4f6_100%)] px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-white/70 bg-white/95 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FECB02]/15 text-[#8a6a00]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#1f2937]">
              {t("guestProfileVerifyingTitle")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              {t("guestProfileVerifyingDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Invalid token ────────────────────────────────────────────────────────────
  if (tokenStatus === "invalid") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1bd,transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
            <div className="bg-[linear-gradient(135deg,#fff7d6_0%,#ffffff_60%)] px-8 pb-6 pt-8 text-center">
              <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm">
                <ShieldX className="h-9 w-9" />
              </div>
              <h1 className="text-2xl font-bold text-[#111827]">
                {t("guestProfileInvalidTitle")}
              </h1>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                {t("guestProfileInvalidDescription")}
              </p>
            </div>

            <div className="space-y-4 px-8 pb-8">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <p>{t("guestProfileInvalidHint")}</p>
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={handleResendToken}
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : t("guestProfileResetPassword")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e8fdf0,transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-white/70 bg-white/95 p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827]">
              {t("guestProfileDoneTitle")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              {t("guestProfileDoneDescription")}
            </p>
            <p className="mt-6 text-xs text-gray-400">
              {t("guestProfileDoneRedirect")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Active steps ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff5cb,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        {step === "password" && (
          <SetPasswordStep
            email={email}
            token={token!}
            onSuccess={(verifyMobileToken) => {
              setMobileToken(verifyMobileToken);
              setStep("mobile");

              const params = new URLSearchParams(searchParams.toString());
              params.set("mobileToken", verifyMobileToken);

              router.replace(`?${params.toString()}`, { scroll: false });
            }}
          />
        )}

        {step === "mobile" && (
          <MobileOTPStep
            email={email}
            mobileToken={mobileToken} // 👈 NEW
            onSuccess={() => setStep("done")}
          />
        )}
      </div>
    </div>
  );
}
