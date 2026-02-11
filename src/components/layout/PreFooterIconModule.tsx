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

      if (!res.ok) throw new Error();

      setSuccess(t("subscribeSuccess"));
      setEmail("");
    } catch {
      setError(t("subscribeError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* App Download */}
      <div className="px-4 mt-8">
        <div className="max-w-4xl mx-auto bg-[#f3f3f3] rounded-2xl sm:rounded-full px-5 py-6">
          <h3 className="text-center font-semibold text-lg sm:text-xl text-[#2f2f2f]">
            {t("downloadTitle")}
          </h3>

          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <Link href="https://apps.apple.com/us/app/don-rifa/id1497938169" target="_blank">
              <Image
                src={APP_STORE_IMG_NEW}
                alt="App Store"
                width={140}
                height={44}
                className="hover:scale-105 transition"
              />
            </Link>

            <Link href="https://play.google.com/store/apps/details?id=com.donrifa.donrifa&hl=en_IN" target="_blank">
              <Image
                src={GOOGLE_STORE_IMG_NEW}
                alt="Google Play"
                width={140}
                height={44}
                className="hover:scale-105 transition"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <section className="bg-[#e7e5e5] mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Newsletter */}
            <div className="flex gap-4 items-start">
              <Image src={MAIL_DISCOUNT} alt="" width={56} height={56} />

              <div className="w-full">
                <p className="font-semibold text-sm sm:text-base mb-3">
                  {t("newsletterTitle")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholderPF")}
                    className="w-full bg-transparent border-b border-[#2f2f2f] py-2 text-sm outline-none focus:border-[#EFCE60]"
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary text-sm px-6 py-2 uppercase disabled:opacity-50"
                  >
                    {loading ? t("sendingPF") : t("sendPF")}
                  </button>
                </div>

                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                {success && <p className="text-green-500 text-xs mt-2">{success}</p>}
              </div>
            </div>

            {/* Assistance */}
            <div className="flex gap-4 items-start">
              <Image src={ASSISTANCE} alt="" width={56} height={56} />

              <div>
                <p className="font-semibold text-sm sm:text-base mb-2">
                  {t("assistanceText")}
                </p>

                <a
                  href="https://wa.me/message/3W4K2DPCDJV3C1"
                  target="_blank"
                  className="underline text-sm hover:text-[#f3c200]"
                >
                  {t("whatsappLabel")}
                </a>

                <p className="text-xs opacity-50 mt-1">
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
