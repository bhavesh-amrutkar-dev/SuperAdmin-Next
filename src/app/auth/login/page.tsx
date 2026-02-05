"use client";

import ErrorMessage from "@/src/components/ui/errorMessage";
import { setupAuthSession } from "@/src/lib/auth";
import { AuthService } from "@/src/lib/services/auth";
import { IEmailLoginRM } from "@/src/models/api/request/auth";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
    const submitLogin = async (payload: IEmailLoginRM) => {
        setLoading(true);

        try {
            const res = await AuthService.login(payload);

            setupAuthSession(res.data);
            router.replace("/");
        } catch (err: any) {
            toast.error(err?.message || "Login failed");
            setErrors({
                email: err?.errors?.email,
                password: err?.errors?.password,
            });
        } finally {
            setLoading(false);
        }
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: IEmailLoginRM = {
            email,
            password,
        };

        submitLogin(payload);
    };



    return (
        <div className="w-full max-w-md rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] border border-gray-200 p-8">
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label className="text-sm font-medium text-[#2f2f2f]">
                        {t("password")}
                    </label>
                    <input
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        className={`w-full rounded-lg border !border-[#2f2f2f] px-4 py-2.5
              focus:outline-none focus:!border-[#f3c200]
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
                        className="text-sm font-medium text-[#2f2f2f] hover:text-[#f3c200] transition"
                    >
                        {t("forgotPassword")}
                    </Link>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg btn-primary py-3 text-white font-semibold
            hover:bg-yellow-400 hover:text-black transition disabled:opacity-50 !border-0"
                >
                    {loading ? t("signingIn") : t("signIn")}
                </button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-[#2f2f2f]">
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
