"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import ErrorMessage from "@/src/components/ui/errorMessage";
import { setupAuthSession } from "@/src/lib/auth";
import { AuthService } from "@/src/lib/services/auth";
import { IEmailLoginRM } from "@/src/models/api/request/auth";
import { mapAuthSession } from "@/src/lib/mappers/auth";
import { persistAuthSession } from "@/src/lib/session/auth";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { useAuth } from "@/src/context/authContext";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getErrorMessage } from "@/src/lib/utils/errorMessage";

export default function LoginPage() {
    const t = useTranslations();
    const router = useRouter();
    const { setUser } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IEmailLoginRM>({
    });
    const searchParams = useSearchParams();
    const redirect = searchParams?.get("redirect");
    const [showPassword, setShowPassword] = useState(false);

    const forgotPasswordHref =
        redirect && !redirect.startsWith("/auth")
            ? `/auth/forgot-password?redirect=${encodeURIComponent(redirect)}`
            : "/auth/forgot-password";
    const loginMobileHref =
        redirect && !redirect.startsWith("/auth")
            ? `/auth/login-mobile?redirect=${encodeURIComponent(redirect)}`
            : "/auth/login-mobile";
    const onSubmit = async (payload: IEmailLoginRM) => {
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: payload.email.trim(),
                    password: payload.password.trim(),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || t("loginFailed"));
            }

            const data = await res.json();

            const session = mapAuthSession(data.data);

            persistAuthSession(session);
            setUser(session);
            const safeRedirect =
                redirect && !redirect.startsWith("/auth")
                    ? redirect
                    : "/";

            router.replace(safeRedirect);
        }
        catch (parseError) {
            toast.error(getErrorMessage(parseError, t("loginFailed")));
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] border border-gray-200 p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8 text-center">
                <h1 className="text-2xl font-bold section_title">
                    {t("welcomeBack")}
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    {t("signInToAccount")}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">

                {/* Email */}
                <div className="space-y-2">
                    <Label
                        htmlFor="email"
                        error={!!errors.email}
                        required
                    >
                        {t("email")}
                    </Label>

                    <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        onKeyDown={(e) => {
                            if (e.key === " ") e.preventDefault();
                        }}
                        error={!!errors.email}
                        {...register("email", {
                            required: t("emailRequired"),
                            setValueAs: (value) => value.trim(),
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: t("emailInvalid"),
                            },
                        })}
                    />

                    <ErrorMessage message={errors.email?.message} />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password" error={!!errors.password} required>
                        {t("password")}
                    </Label>

                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t("passwordPlaceholder")}
                            onKeyDown={(e) => {
                                if (e.key === " ") e.preventDefault();
                            }}
                            error={!!errors.password}
                            className="pr-10"
                            {...register("password", {
                                required: t("passwordRequired"),
                                setValueAs: (value) => value.trim(),
                                validate: (value) =>
                                    value.trim().length > 0 || t("passwordRequired"),
                            })}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <ErrorMessage message={errors.password?.message} />
                </div>
                {/* Forgot Password */}
                <div className="flex justify-end">
                    <Link
                        href={forgotPasswordHref}
                        className="text-sm font-medium text-foreground hover:text-[#d6ab00] transition"
                    >
                        {t("forgotPassword")}
                    </Link>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg btn-primary py-3 font-semibold
      hover:bg-yellow-400 hover:text-black transition disabled:opacity-50"
                >
                    {isSubmitting ? t("signingIn") : t("signIn")}
                </button>

            </form>

            {/* OR CONNECT WITH */}
            <div className="mt-4">
                <div className="flex items-center gap-3 max-w-[80%] mx-auto">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-sm text-muted-foreground font-medium">
                        {t("orConnectWith")}
                    </span>
                    <div className="flex-1 h-px bg-gray-300" />
                </div>

                <Link
                    href={redirect ? `/auth/login-mobile?redirect=${encodeURIComponent(redirect)}` : "/auth/login-mobile"}
                    className="mt-4 w-full rounded-lg btn-primary py-3 font-semibold
    hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {t("loginWithNumber")}
                </Link>
            </div>

            {/* <div className="mt-4 text-center text-sm text-gray-500">
                {t("havingTrouble")}{" "}
                <Link
                    href="/contact"
                    className="font-medium text-[#d6ab00] hover:underline"
                >
                    {t("contactSupport")}
                </Link>
            </div> */}
            {/* Footer */}
            <p className="mt-5 sm:mt-6 text-center text-sm text-foreground">
                {t("dontHaveAccount")}{" "}
                <Link
                    href={redirect ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : "/auth/register"}
                    className="font-semibold text-[#2f2f2f] hover:text-[#f3c200] hover:underline transition"
                >
                    {t("signUp")}
                </Link>
            </p>

            {/* <div className="mt-4 text-center text-sm text-gray-500">
                {t("havingTrouble")}{" "}
                <Link
                    href="/contact"
                    className="font-medium text-[#d6ab00] hover:underline"
                >
                    {t("contactSupport")}
                </Link>
            </div> */}
            {/* We're Here to Help */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-base font-semibold text-[#2f2f2f] mb-4">
                    {t("hereToHelp")}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    {/* Call Us */}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">{t("callUs")}</p>
                        <a
                            href="tel:+17873023322"
                            className="flex items-center justify-center gap-2 border border-[#f3c200] bg-[#fffdf0] rounded-full px-3 py-2.5 text-sm font-medium text-[#2f2f2f] hover:bg-yellow-100 transition whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                            </svg>
                            +1 7873023322
                        </a>
                    </div>

                    {/* Chat With Us */}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">{t("chatWithUs")}</p>
                        <a
                            href="https://wa.me/message/3W4K2DPCDJV3C1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 border border-green-400 bg-green-50 rounded-full px-3 py-2.5 text-sm font-medium text-[#2f2f2f] hover:bg-green-100 transition text-center leading-tight"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {t("chatOnWhatsApp")}
                        </a>
                    </div>
                </div>

                {/* Social Media Icons */}
                <div className="flex justify-center gap-4 mt-5">
                    <a href="https://www.instagram.com/donrifallc" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                            <defs>
                                <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                                    <stop offset="0%" stopColor="#fdf497" />
                                    <stop offset="5%" stopColor="#fdf497" />
                                    <stop offset="45%" stopColor="#fd5949" />
                                    <stop offset="60%" stopColor="#d6249f" />
                                    <stop offset="90%" stopColor="#285AEB" />
                                </radialGradient>
                            </defs>
                            <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
                            <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5" />
                            <circle cx="17" cy="7" r="1" fill="white" />
                            <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="white" strokeWidth="1.5" />
                        </svg>
                    </a>
                    <a href="https://www.facebook.com/donrifallc/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="12" fill="#1877F2" />
                            <path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.2 12.5H13V20H10.5V12.5H9V10H10.5V8.5C10.5 6.6 11.6 5.5 13.5 5.5H15.5V8Z" fill="white" />
                        </svg>
                    </a>
                    <a href="https://www.youtube.com/channel/UCeeQ4yfMdHvK_ViM_5oRvow/videos" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="12" fill="#FF0000" />
                            <path d="M19.6 8.4C19.4 7.6 18.8 7 18 6.8 16.6 6.5 12 6.5 12 6.5S7.4 6.5 6 6.8C5.2 7 4.6 7.6 4.4 8.4 4.1 9.8 4 12 4 12S4.1 14.2 4.4 15.6C4.6 16.4 5.2 17 6 17.2 7.4 17.5 12 17.5 12 17.5S16.6 17.5 18 17.2C18.8 17 19.4 16.4 19.6 15.6 19.9 14.2 20 12 20 12S19.9 9.8 19.6 8.4Z" fill="white" />
                            <polygon points="10,9.5 10,14.5 15,12" fill="#FF0000" />
                        </svg>
                    </a>
                    <a href="https://x.com/donrifallc/" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="12" fill="#000000" />
                            <path d="M17.75 5h-2.5l-3.25 4.5L8.75 5H4l5.5 7.5L4 19h2.5l3.5-4.75L13.5 19H18l-5.75-7.75L17.75 5Z" fill="white" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
