"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HOW_IT_WORKS } from "@/src/lib/config";

export default function HowItWorksSection() {
  const t = useTranslations();

  return (
    <section
   
      className=" mx-auto w-full max-w-[1648px] px-2 md:px-6 pt-8 lg:pt-4 xl:pt-8 pb-7 lg:pb-9 xl:pb-10"
    >
      <div className="text-center mb-10 lg:mb-12">
        <div className="text-center section_heading min-w-[200px] lg:min-w-[400px] inline-block px-8 py-3">
        <h2 className="
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

      <div  id="howItWorks" className="scroll-mt-24 relative w-full max-w-7xl mx-auto overflow-hidden">
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
