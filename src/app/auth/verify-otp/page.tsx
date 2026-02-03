"use client";

import { useState } from "react";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log({ otp });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Verify OTP
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter OTP"
            className="auth-input text-center tracking-widest text-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button className="auth-button" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
