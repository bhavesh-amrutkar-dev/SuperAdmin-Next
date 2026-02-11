"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import ErrorMessage from "@/src/components/ui/errorMessage";
import { AuthService } from "@/src/lib/services/auth";
import { IEmailLoginRM } from "@/src/models/api/request/auth";
import { mapAuthSession } from "@/src/lib/mappers/auth";
import { persistAuthSession } from "@/src/lib/session/auth";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const t = useTranslations();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IEmailLoginRM>({});

    const onSubmit = async (payload: IEmailLoginRM) => {
        try {
            const res = await AuthService.login(payload);
            if (res) {
                const session = mapAuthSession(res.data);
                persistAuthSession(session);

                toast.success(t("loginSuccess") || "Login successful");
                onClose();

                // Call the success callback if provided
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            }
        } catch (err: any) {
            toast.error(err?.message || t("loginFailed"));
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-8">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold section_title">
                            {t("welcomeBack")}
                        </h1>
                        <p className="text-sm text-[#7c7878] mt-1">
                            {t("signInToAccount")}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#2f2f2f]">
                                {t("email")}
                            </label>
                            <input
                                type="email"
                                placeholder={t("emailPlaceholder")}
                                className={`w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
                  focus:outline-none focus:!border-[#f3c200]
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
                            <label className="text-sm font-medium text-[#2f2f2f]">
                                {t("password")}
                            </label>
                            <input
                                type="password"
                                placeholder={t("passwordPlaceholder")}
                                className={`w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
                  focus:outline-none focus:!border-[#f3c200]
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
                                className="text-sm font-medium text-[#2f2f2f] hover:text-[#f3c200] transition"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onClose();
                                    window.location.href = "/auth/forgot-password";
                                }}
                            >
                                {t("forgotPassword")}
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg btn-primary py-3 text-white font-semibold
                hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 !border-0"
                        >
                            {isSubmitting ? t("signingIn") : t("signIn")}
                        </button>
                    </form>

                    {/* OR CONNECT WITH */}
                    <div className="mt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-300" />
                            <span className="text-xs text-gray-500 font-medium">
                                {t("orConnectWith")}
                            </span>
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        <Link
                            href="/auth/login-mobile"
                            className="mt-4 flex items-center justify-center rounded-lg border border-[#2f2f2f]
              py-2.5 text-sm font-semibold text-[#2f2f2f]
              hover:border-[#f3c200] hover:text-[#f3c200] transition"
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                window.location.href = "/auth/login-mobile";
                            }}
                        >
                            {t("loginWithNumber")}
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-[#2f2f2f]">
                        {t("dontHaveAccount")}{" "}
                        <Link
                            href="/auth/register"
                            className="font-semibold text-[#2f2f2f] hover:text-[#f3c200] hover:underline transition"
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                window.location.href = "/auth/register";
                            }}
                        >
                            {t("signUp")}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

