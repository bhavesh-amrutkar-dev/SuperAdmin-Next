"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const method = searchParams.get("method");
  const value = searchParams.get("value");

  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer === 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const code = otp.join("");
      console.log({ code, method, value });

      // 🔹 Verify OTP API
      router.push("/auth/reset-password");
    } finally {
      setLoading(false);
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

          {/* Verify Button */}
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
              onClick={() => setTimer(30)}
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
