"use client";

import { useTranslations } from "next-intl";
import Header from "./layout/Header";
import Footer from "./layout/Footer";

export default function ComingSoonPage() {
  const t = useTranslations();
  return (
    <>
      <Header />
      <div className="flex items-center justify-center bg-[#0f0f0f] px-4 py-20 min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {t("comingSoon")}
          </h1>

          <p className="mt-4 text-gray-400 text-sm md:text-base">
            {t("comingSoonMessage") || "We're working on something awesome. Stay tuned."}
          </p>

          <div className="mt-8 h-1 w-20 mx-auto bg-yellow-400 rounded-full" />
        </div>
      </div>
      <Footer />
    </>
  );
}
