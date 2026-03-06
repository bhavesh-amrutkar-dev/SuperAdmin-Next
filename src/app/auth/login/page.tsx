"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
    const [showPassword, setShowPassword] = useState(false);
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
            router.replace("/");
        } catch (err: any) {
            toast.error(err?.message || t("loginFailed"));
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
                        href="/auth/forgot-password"
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
                    href="/auth/login-mobile"
                    className="mt-4 w-full rounded-lg btn-primary py-3 font-semibold
      hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 flex items-center justify-center gap-2"

                >
                    {t("loginWithNumber")}
                </Link>
            </div>


            {/* Footer */}
            <p className="mt-5 sm:mt-6 text-center text-sm text-foreground">
                {t("dontHaveAccount")}{" "}
                <Link
                    href="/auth/register"
                    className="font-semibold text-[#2f2f2f] hover:text-[#f3c200] hover:underline transition"
                >
                    {t("signUp")}
                </Link>
            </p>
        </div>
    );
}
