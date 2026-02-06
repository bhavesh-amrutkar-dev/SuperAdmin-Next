"use client";

import { mapAuthSession } from "@/src/lib/mappers/auth";
import { AuthService } from "@/src/lib/services/auth";
import { persistAuthSession } from "@/src/lib/session/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function VerifyOtpPage() {


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

  /** Extract countryCode & mobile from value */
  const { countryCode, mobile } = useMemo(() => {
    if (!value) return { countryCode: "", mobile: "" };
    const match = value.match(/^(\+\d+)(\d+)$/);
    return {
      countryCode: match?.[1] || "",
      mobile: match?.[2] || "",
    };
  }, [value]);

  /** Countdown */
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  /** OTP Input */
  const handleChange = (val: string, index: number) => {
    if (!/^\d?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  /** Verify OTP */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    if (!otpId) {
      toast.error("OTP session expired");
      return;
    }


    setLoading(true);
    try {
      const res = await AuthService.verifyOtp({
        otpCode,
        otpId,
        verifyType: 2,
      });

      if (!res?.data) {
        throw new Error("Authentication failed");
      }
      if (flow === "signup") {
        const payload = sessionStorage.getItem("signup_payload");
        if (!payload) throw new Error("Signup data missing");

        const signupData = JSON.parse(payload);

        const signupRes = await AuthService.signUp(signupData);

        const session = mapAuthSession(signupRes.data);
        persistAuthSession(session);

        sessionStorage.removeItem("signup_payload");
        router.replace("/");
        return;
      }


      // login flow (existing behavior)
      const session = mapAuthSession(res.data);
      persistAuthSession(session);
      router.replace("/");
    } catch (err: any) {
      toast.error(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };



  /** Resend OTP */
  const resendOtp = async () => {
    if (!mobile || !countryCode) return;

    try {
      const res = await AuthService.mobileLogin({
        mobile,
        countryCode,
      });

      if (!res?.data) {
        throw new Error("Failed to resend OTP");
      }

      const { otpId, otpExpiryTime } = res.data;

      setOtp(Array(4).fill(""));
      setTimer(otpExpiryTime);

      router.replace(
        `/auth/verify-otp?method=mobile&value=${encodeURIComponent(
          `${countryCode}${mobile}`
        )}&otpId=${otpId}&expiry=${otpExpiryTime}`
      );
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1">Verify OTP</h1>
          <p className="text-sm text-gray-500">
            We sent a 4-digit code to your {method}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800 break-all">
            {value}
          </p>
        </div>

        {/* OTP Input */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                className="h-12 w-12 rounded-lg border border-gray-300 text-center text-lg font-semibold
                  focus:outline-none focus:border-[#f3c200] focus:ring-2 focus:ring-yellow-200"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some((d) => !d)}
            className="w-full rounded-lg bg-[#f3c200] py-3 font-semibold text-black
              hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Didn’t receive the code?{" "}
          {timer > 0 ? (
            <span className="font-medium text-gray-700">
              Resend in {timer}s
            </span>
          ) : (
            <button
              onClick={resendOtp}
              className="font-semibold text-[#f3c200] hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
