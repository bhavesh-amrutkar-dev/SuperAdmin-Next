"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const t = useTranslations();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const validate = () => {
    if (password.length < 8) {
      return t("passwordMinError");
    }
    if (password !== confirmPassword) {
      return t("passwordMismatchError");
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
            {t("resetPasswordTitle")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("resetPasswordSubtitle")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 relative">
          {/* New Password */}
          <div>
            <Label>{t("newPassword")}</Label>

            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm
      ${error
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:border-yellow-400 focus:ring-yellow-200"
                  }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.replace(/^\s+/, ""));
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
                placeholder={t("passwordPlaceholder")}
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              {t("passwordHint")}
            </p>
          </div>

          {/* Confirm Password */}
          <div className="relative mt-1">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm
    ${error
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:border-yellow-400 focus:ring-yellow-200"
                }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value.replace(/^\s+/, ""));
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault();
              }}
              placeholder={t("confirmPasswordPlaceholder")}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className=" absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
            {loading ? t("saving") : t("savePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
