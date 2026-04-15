"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GuestProfileClient({ email, token }: any) {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validate = () => {
        if (password.length < 8) {
            return "Password must be at least 8 characters";
        }
        if (password !== confirmPassword) {
            return "Passwords do not match";
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/api/setPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    newPassword: password,
                    token: token
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to set password");
            }

            // ✅ success
            router.push("/auth/login");

        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    const isDisabled =
        loading || !password || !confirmPassword || !!validate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">

                <h2 className="text-xl font-semibold text-center mb-6">
                    Complete Your Profile
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email (readonly) */}
                    <div>
                        <Label>Email</Label>
                        <Input
                            value={email}
                            disabled
                            placeholder="Your email address"
                            className="mt-1 bg-gray-100"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <Label>New Password</Label>
                        <div className="relative mt-1">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                placeholder="Enter new password"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <Label>Confirm Password</Label>
                        <div className="relative mt-1">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                placeholder="Confirm your password"
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isDisabled}
                        className="w-full bg-yellow-400 py-2 rounded-lg font-semibold"
                    >
                        {loading ? "Saving..." : "Set Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}