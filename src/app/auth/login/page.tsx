"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import ErrorMessage from "@/src/components/ui/errorMessage";
import { setupAuthSession } from "@/src/lib/auth";
import { AuthService } from "@/src/lib/services/auth";
import { IEmailLoginRM } from "@/src/models/api/request/auth";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IEmailLoginRM>({
  });

  /** Redirect if already logged in */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) router.replace("/");
  }, [router]);

  /** Submit handler */
  const onSubmit = async (payload: IEmailLoginRM) => {
    try {
      const res = await AuthService.login(payload);
      setupAuthSession(res.data);
      router.replace("/");
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            {...register("email", {
              required: t("emailRequired"),
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: t("emailInvalid"),
              },
            })}
          />
          <ErrorMessage message={errors.email?.message} />
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
            {...register("password", {
              required: t("passwordRequired"),
            })}
          />
          <ErrorMessage message={errors.password?.message} />
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
          disabled={isSubmitting}
          className="w-full rounded-lg bg-black py-2.5 text-white font-medium
            hover:bg-yellow-400 hover:text-black transition disabled:opacity-50"
        >
          {isSubmitting ? t("signingIn") : t("signIn")}
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
