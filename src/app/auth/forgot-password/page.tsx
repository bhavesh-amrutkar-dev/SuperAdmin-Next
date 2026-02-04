"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log({ email });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold section_title mb-1 block">
          Forgot password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          We’ll send you a verification code
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#2f2f2f]">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            className="auth-input w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
              focus:outline-none focus:!border-[#f3c200]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className="auth-button w-full rounded-lg btn-primary py-3 text-white font-semibold
            hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 !border-0" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <p className="text-center text-sm text-[#2f2f2f]">
          <span className="font-semibold text-[#2f2f2f] hover:text-[#f3c200] hover:underline transition">Back To Login</span>
        </p>

      </form>
    </div>
  );
}
