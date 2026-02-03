"use client";

import ErrorMessage from "@/src/components/ui/errorMessage";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) router.replace("/");
  }, [router]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = t("emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("emailInvalid");
    }

    if (!password) {
      newErrors.password = t("passwordRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      console.log({ email, password });
      // TODO: API call
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t("welcomeBack")}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t("signInToAccount")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-800">
            {t("email")}
          </label>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            className={`w-full rounded-lg bg-yellow-50 border px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-yellow-400
              ${errors.email ? "border-red-400" : "border-gray-300"}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
          />
          <ErrorMessage message={errors.email} />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-800">
            {t("password")}
          </label>
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            className={`w-full rounded-lg bg-yellow-50 border px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-yellow-400
              ${errors.password ? "border-red-400" : "border-gray-300"}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
          />
          <ErrorMessage message={errors.password} />
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-2.5 text-white font-medium
            hover:bg-yellow-400 hover:text-black transition disabled:opacity-50"
        >
          {loading ? t("signingIn") : t("signIn")}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-600">
        {t("dontHaveAccount")}{" "}
        <Link
          href="/auth/register"
          className="font-medium text-yellow-600 hover:underline"
        >
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
