"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 🔹 Reset password API
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading || !password || !confirmPassword || !!validate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-gray-100 px-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-xl
        shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] p-8">

        {/* Accent */}
        <div className="absolute inset-x-0 -top-1 h-1 rounded-t-3xl bg-gradient-to-r from-yellow-300 to-yellow-500" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose a strong password you haven’t used before
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              New password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full rounded-xl border px-4 py-3 pr-14 text-sm
                  transition focus:outline-none focus:ring-2
                  ${
                    error
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:border-yellow-400 focus:ring-yellow-200"
                  }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-4 text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Minimum 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm
                transition focus:outline-none focus:ring-2
                ${
                  error
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:border-yellow-400 focus:ring-yellow-200"
                }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              placeholder="Re-enter new password"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-center">
              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500
              py-3 text-sm font-semibold text-black shadow-md
              hover:from-yellow-500 hover:to-yellow-600
              transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}
