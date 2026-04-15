"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import ErrorMessage from "@/src/components/ui/errorMessage";
import { AuthService } from "@/src/lib/services/auth";
import { IEmailLoginRM } from "@/src/models/api/request/auth";
import { mapAuthSession } from "@/src/lib/mappers/auth";
import { persistAuthSession } from "@/src/lib/session/auth";
import { useAuth } from "@/src/context/authContext";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const t = useTranslations();
    const { setUser } = useAuth();
    const pathname = usePathname();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IEmailLoginRM>({});

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            // Disable body scroll
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        // Cleanup function
        return () => {
            if (isOpen) {
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }
        };
    }, [isOpen]);

    const onSubmit = async (payload: IEmailLoginRM) => {
        try {
            const res = await AuthService.login(payload);
            if (res) {
                const session = mapAuthSession(res.data);
                persistAuthSession(session);

                // Update auth context - Header will automatically react to this change
                setUser(session);

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
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-4 sm:p-6 md:p-8">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    {/* Header */}
                    <div className="mb-4 sm:mb-6 md:mb-8 text-center">
                        <h1 className="text-xl sm:text-2xl font-bold section_title">
                            {t("welcomeBack")}
                        </h1>
                        <p className="text-xs sm:text-sm text-[#7c7878] mt-1">
                            {t("signInToAccount")}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                        {/* Email */}
                        <div className="space-y-1">
                            <Label>
                                {t("email")}
                            </Label>
                            <Input
                                type="email"
                                placeholder={t("emailPlaceholder")}
                                className={`w-full rounded-lg border !border-[#2f2f2f] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base
                  focus:outline-none focus:!border-[#f3c200]
                  ${errors.email ? "border-red-400" : "border-gray-300"}`}
                                {...register("email", {
                                    required: t("emailRequired"),
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: t("emailInvalid"),
                                    },
                                })}
                                onKeyDown={(e) => {
                                    if (e.key === " ") e.preventDefault();
                                }}
                            />
                            <ErrorMessage message={errors.email?.message} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <Label className="text-xs sm:text-sm font-medium text-[#2f2f2f]">
                                {t("password")}
                            </Label>

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("passwordPlaceholder")}
                                    className={`w-full rounded-lg border !border-[#2f2f2f] px-3 py-2 sm:px-4 sm:py-2.5 pr-10 text-sm sm:text-base
      focus:outline-none focus:!border-[#f3c200]
      ${errors.password ? "border-red-400" : "border-gray-300"}`}
                                    {...register("password", {
                                        required: t("passwordRequired"),
                                    })}
                                    onKeyDown={(e) => {
                                        if (e.key === " ") e.preventDefault();
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <ErrorMessage message={errors.password?.message} />
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <Link
                                href="/auth/forgot-password"
                                className="text-xs sm:text-sm font-medium text-[#2f2f2f] hover:text-[#f3c200] transition"
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
                            className="w-full rounded-lg btn-primary py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold
                hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 !border-0"
                        >
                            {isSubmitting ? t("signingIn") : t("signIn")}
                        </button>
                    </form>

                    {/* OR CONNECT WITH */}
                    <div className="mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex-1 h-px bg-gray-300" />
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                {t("orConnectWith")}
                            </span>
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        <Link
                            href={`/auth/login-mobile?redirect=${encodeURIComponent(pathname)}`}
                            className="mt-3 sm:mt-4 flex items-center justify-center rounded-lg border border-[#2f2f2f]
              py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#2f2f2f]
              hover:border-[#f3c200] hover:text-[#f3c200] transition"
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                window.location.href = `/auth/login-mobile?redirect=${encodeURIComponent(pathname)}`;
                            }}
                        >
                            {t("loginWithNumber")}
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#2f2f2f]">
                        {t("dontHaveAccount")}{" "}
                        <Link
                            href={`/auth/register?redirect=${encodeURIComponent(pathname)}`}
                            className="font-semibold text-[#2f2f2f] hover:text-[#f3c200] hover:underline transition"
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                window.location.href = `/auth/register?redirect=${encodeURIComponent(pathname)}`;
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

