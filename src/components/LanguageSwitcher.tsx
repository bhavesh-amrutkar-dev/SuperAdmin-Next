"use client";

import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { setCookie } from "cookies-next";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/src/i18n/config";

const languageLabels: Record<Locale, string> = {
  en: "English",
  es: "Spanish",
};

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const changeLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    setCookie("NEXT_LOCALE", nextLocale, { path: "/" });
    setOpen(false);

    // Dispatch custom event for locale change
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("localeChanged", { detail: { locale: nextLocale } }));
    }

    // Preserve all query parameters when changing language
    const currentSearchParams = searchParams.toString();
    const newUrl = currentSearchParams
      ? `${pathname}?${currentSearchParams}`
      : pathname;

    router.replace(newUrl);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-black/10 
                   btn-primary text-sm text-black
                   hover:bg-black/5 transition focus:outline-none font-semibold"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">
          {languageLabels[locale]}
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-xl border border-black/10
                     bg-white shadow-xl overflow-hidden z-50"
        >
          {locales.map((lng) => (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={`w-full px-4 py-3 text-left text-sm transition cursor-pointer
                ${locale === lng
                  ? "text-[#f3c200] font-semibold"
                  : "hover:bg-[#2f2f2f]/10 text-black"
                }
              `}
            >
              {languageLabels[lng]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
