"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HOW_IT_WORKS } from "@/src/lib/config";

export default function HowItWorksSection() {
  const t = useTranslations();

  return (
    <section
      id="howItWorks"
      className="mx-auto max-w-7xl px-6 py-16"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-black">
          {t("howItWorks")}
        </h2>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl border border-black/10">
        <Image
          src={HOW_IT_WORKS} 
          alt={t("howItWorks")}
          width={1400}
          height={700}
          className="w-full h-auto "
          priority
        />
      </div>
    </section>
  );
}
