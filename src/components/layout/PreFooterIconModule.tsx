"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Footer_Email,
    Footer_Mobile,
    Footer_Phone,
    AppleStoreM,
    GooglePlayM,
    APP_STORE_IMG_NEW,
    GOOGLE_STORE_IMG_NEW,
    MAIL_DISCOUNT,
    ASSISTANCE,
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

        <>
            <div className="bg-[#f3f3f3] rounded-[92px] max-w-[600px] mx-auto mb-20 download-app-box mt-6 xl:mt-0">
                <div className="px-[60px] py-[30px]">
                    <h3 className="font-bold text-[#2f2f2f] text-2xl text-center">
                        Download DONRIFA on your mobile
                    </h3>
                    <div className="flex gap-3 mt-4 justify-center">
                        <Image src={APP_STORE_IMG_NEW} alt="App Store" width={160} height={60} />
                        <Image src={GOOGLE_STORE_IMG_NEW} alt="App Store" width={160} height={60} />
                    </div>
                </div>
            </div>

            <section className="bg-[#e7e5e5]">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-[40px] xl:gap-[100px] relative">

                        {/* Newsletter */}
                        <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-4 xl:gap-6 px-4 xl:px-10 xl:py-5">
                            <div className="">
                                <Image src={MAIL_DISCOUNT} alt="" width={86} height={86} />
                            </div>
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3">
                                    {/* <Image src={Footer_Email} alt="" width={22} height={22} /> */}
                                    <p className="text-sm lg:text-base xl:text-xl font-semibold mb-4">
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
                                                placeholder="Your Email"
                                                className="input-style w-full text-[#2f2f2f] border-b border-color-[#2f2f2f] outline-none placeholder:text-[#2f2f2f] placeholder:opacity-50 p-2 px-1 focus:border-[#EFCE60]"
                                            />
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn-primary font-medium py-2 px-6 web_button_section disabled:opacity-50 uppercase"
                                    >
                                        {loading ? "Sending..." : "Send"}
                                    </button>
                                </div>

                                {error && <p className="errMessage">{error}</p>}
                                {success && (
                                    <p className="text-green-400 text-sm">{success}</p>
                                )}
                            </div>
                        </div>
                        <div className="w-[1px] h-[100px] bg-[#2f2f2f]/10 absolute top-0 bottom-0 right-0 left-0 m-auto"></div>
                        {/* App Download */}
                        {/* <div className="space-y-4 text-center lg:text-left">
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

                        </div> */}

                        {/* WhatsApp Support */}
                        <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-4 xl:gap-6">
                            <div className="">
                                <Image src={ASSISTANCE} alt="" width={86} height={86} />
                            </div>
                            <div className="">
                                <div className="flex items-center justify-start gap-3">
                                    {/* <Image src={Footer_Phone} alt="" width={22} height={22} /> */}
                                    <p className="text-sm lg:text-base xl:text-xl font-semibold mb-4">
                                        For any assistance you can contact us via : <br />
                                        <a
                                            href="https://wa.me/message/3W4K2DPCDJV3C1"
                                            target="_blank"
                                            className=" underline hover:text-[#f3c200]"
                                        >
                                            WhatsApp +1 (787) 302-3322
                                        </a>
                                    </p>
                                </div>

                                <p className="text-xs text-[#2f2f2f] opacity-50">(Monday to Saturday,8AM to 10PM and Sunday, 10AM to 7PM)</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}
