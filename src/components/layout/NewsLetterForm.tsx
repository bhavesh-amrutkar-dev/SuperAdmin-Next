"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HomeService } from "@/src/lib/services/home";

interface Props {
  mailIcon: string;
}

export default function NewsletterForm({ mailIcon }: Props) {
  const t = useTranslations(); // translations in client component

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

      // Use HomeService instead of fetch
      await HomeService.newsletter(email);

      setSuccess(t("subscribeSuccess"));
      setEmail("");
    } catch (err) {
      console.error("Newsletter error:", err);
      setError(t("subscribeError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <Image src={mailIcon} alt="" width={56} height={56} />

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
  );
}
