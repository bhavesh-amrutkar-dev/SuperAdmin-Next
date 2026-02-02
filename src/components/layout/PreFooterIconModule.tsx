"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Footer_Email,
    Footer_Mobile,
    Footer_Phone,
    AppleStoreM,
    GooglePlayM,
} from "@/src/lib/config";

export default function PreFooterIconModule() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async () => {
        if (!email || !email.includes("@")) {
            setError("Enter a valid email");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            // 🔹 API CALL
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error("Failed to subscribe");

            setSuccess("Subscribed successfully!");
            setEmail("");
        } catch (err) {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-[#2F2F2F] text-white">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Image src={Footer_Email} alt="" width={22} height={22} />
                            <p className="text-sm">
                                Get special discounts in your inbox
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative w-full">
                                <label className="input-label w-full">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder=" "
                                        className="input-style w-full text-white"
                                    />
                                    <span className="span-style">Your Email</span>
                                </label>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="web_button_section disabled:opacity-50"
                            >
                                {loading ? "Sending..." : "Send"}
                            </button>
                        </div>

                        {error && <p className="errMessage">{error}</p>}
                        {success && (
                            <p className="text-green-400 text-sm">{success}</p>
                        )}
                    </div>

                    {/* App Download */}
                    <div className="space-y-4 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                            <Image src={Footer_Mobile} alt="" width={22} height={22} />
                            <p className="text-sm">
                                Download DON<span className="rifa_color">RIFA</span> on your mobile
                            </p>
                        </div>

                        <div className="flex justify-center lg:justify-start gap-3">
                            <a href="#" target="_blank">
                                <Image
                                    src={AppleStoreM}
                                    alt="App Store"
                                    width={140}
                                    height={42}
                                    className="hover:scale-105 transition"
                                />
                            </a>

                            <a href="#" target="_blank">
                                <Image
                                    src={GooglePlayM}
                                    alt="Google Play"
                                    width={140}
                                    height={42}
                                    className="hover:scale-105 transition"
                                />
                            </a>
                        </div>

                    </div>

                    {/* WhatsApp Support */}
                    <div className="space-y-3 text-center lg:text-right">
                        <div className="flex items-center justify-center lg:justify-end gap-3">
                            <Image src={Footer_Phone} alt="" width={22} height={22} />
                            <p className="text-sm">
                                For any assistance you can contact us via : <br />
                                <a
                                    href="https://wa.me/message/3W4K2DPCDJV3C1"
                                    target="_blank"
                                    className=" underline hover:text-[#EFCE60]"
                                >
                                   WhatsApp +1 (787) 302-3322
                                </a>
                            </p>
                        </div>

                        <p className="text-xs opacity-70">(Monday to Saturday,8AM to 10PM and Sunday, 10AM to 7PM)</p>
                    </div>

                </div>
            </div>
        </section>
    );
}
