"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HOW_IT_WORKS } from "@/src/lib/config";

export default function HowItWorksSection() {
  const t = useTranslations();

  return (
    <section
      id="howItWorks"
      className="mx-auto w-full max-w-[1648px] px-2 md:px-6 pt-10 pb-[60px] lg:pb-[80px] xl:pb-[100px]"
    >
      <div className="text-center mb-14">
        <div className="text-center section_heading min-w-[200px] sm:min-w-[400px] inline-block px-8 py-3">
        <h2 className="pt-2
        pb-2
        text-lg md:text-2xl lg:text-3xl xl:text-4xl
        font-bold
        uppercase
        tracking-[1px]
        leading-[1.35]
        text-[#2F2F2F]
        overflow-hidden
        text-ellipsis">
          {t("howItWorks")}
        </h2>
        </div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
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
