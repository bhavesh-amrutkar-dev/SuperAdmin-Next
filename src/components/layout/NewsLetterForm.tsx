"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HomeService } from "@/src/lib/services/home";
import { ConfirmationModal } from "@/src/components/ui/confirmationModal";

interface Props {
  mailIcon: string;
}

export default function NewsletterForm({ mailIcon }: Props) {
  const t = useTranslations(); // translations in client component

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setError(t("invalidEmail"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      await HomeService.newsletter(email);

      setEmail("");
      setSuccessModalOpen(true); // Show success modal
    } catch (err) {
      console.warn("Newsletter error:", err);
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
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
            }}
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
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        open={successModalOpen}
        onConfirm={() => setSuccessModalOpen(false)}
        onCancel={() => setSuccessModalOpen(false)}
        title={t("newsletterSuccessTitle") || "Thank you for subscribing!"}
        message={
          t("newsletterSuccessMessage") ||
          "Thank you registering to our newsletter. We will send you some really interesting content which we hope you will love."
        }
        confirmText={t("close") || "CLOSE"}
        variant="default"
        disableOutsideClose={true} // force user to click close
      />
    </div>
  );
}