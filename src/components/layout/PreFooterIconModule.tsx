"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
    APP_STORE_IMG_NEW,
    GOOGLE_STORE_IMG_NEW,
    MAIL_DISCOUNT,
    ASSISTANCE,
} from "@/src/lib/config";

export default function PreFooterIconModule() {
    const t = useTranslations();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async () => {
        if (!email || !email.includes("@")) {
            setError(t("invalidEmail"));
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error("Failed to subscribe");

            setSuccess(t("subscribeSuccess"));
            setEmail("");
        } catch (err) {
            setError(t("subscribeError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* App Download Box */}
            <div className="bg-[#f3f3f3] rounded-[92px] max-w-150 mx-auto mb-20 download-app-box mt-6 xl:mt-0">
                <div className="px-15 py-7.5">
                    <h3 className="font-bold text-[#2f2f2f] text-2xl text-center">
                        {t("downloadTitle")}
                    </h3>

                    <div className="flex gap-3 mt-4 justify-center flex-wrap">
                        <Link
                            href="https://apps.apple.com/us/app/don-rifa/id1497938169"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Download Don Rifa on App Store"
                        >
                            <Image
                                src={APP_STORE_IMG_NEW}
                                alt="Download on the App Store"
                                width={160}
                                height={60}
                                className="hover:scale-105 transition-transform"
                            />
                        </Link>

                        <Link
                            href="https://play.google.com/store/apps/details?id=com.donrifa.donrifa&hl=en_IN"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Download Don Rifa on Google Play"
                        >
                            <Image
                                src={GOOGLE_STORE_IMG_NEW}
                                alt="Get it on Google Play"
                                width={160}
                                height={60}
                                className="hover:scale-105 transition-transform"
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <section className="bg-[#e7e5e5]">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 xl:gap-25 relative">

                        {/* Newsletter */}
                        <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-4 xl:gap-6 px-4 xl:px-10 xl:py-5">
                            <Image src={MAIL_DISCOUNT} alt="" width={86} height={86} />

                            <div className="flex-1 w-full">
                                <p className="text-sm lg:text-base xl:text-xl font-semibold mb-4">
                                    {t("newsletterTitle")}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t("emailPlaceholderPF")}
                                        className="input-style w-full text-[#2f2f2f] border-b border-[#2f2f2f] outline-none placeholder:text-[#2f2f2f] placeholder:opacity-50 p-2 px-1 focus:border-[#EFCE60]"
                                    />

                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn-primary font-medium py-2 px-6 web_button_section disabled:opacity-50 uppercase"
                                    >
                                        {loading ? t("sendingPF") : t("sendPF")}
                                    </button>
                                </div>

                                {error && <p className="errMessage">{error}</p>}
                                {success && (
                                    <p className="text-green-400 text-sm">{success}</p>
                                )}
                            </div>
                        </div>

                        <div className="w-px h-25 bg-[#2f2f2f]/10 absolute top-0 bottom-0 right-0 left-0 m-auto" />

                        {/* WhatsApp Support */}
                        <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-4 xl:gap-6">
                            <Image src={ASSISTANCE} alt="" width={86} height={86} />

                            <div>
                                <p className="text-sm lg:text-base xl:text-xl font-semibold mb-4">
                                    {t("assistanceText")} <br />
                                    <a
                                        href="https://wa.me/message/3W4K2DPCDJV3C1"
                                        target="_blank"
                                        className="underline hover:text-[#f3c200]"
                                    >
                                        {t("whatsappLabel")}
                                    </a>
                                </p>

                                <p className="text-xs text-[#2f2f2f] opacity-50">
                                    {t("assistanceTime")}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}
