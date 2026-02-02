"use client";

import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { setCookie } from "cookies-next";
import { useRouter, usePathname } from "next/navigation";
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

  const changeLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    setCookie("NEXT_LOCALE", nextLocale, { path: "/" });
    setOpen(false);

    router.replace(pathname);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-black/10 
                   bg-white text-sm font-medium text-black
                   hover:bg-black/5 transition focus:outline-none"
      >
        <Globe size={16} className="opacity-70" />
        <span className="hidden sm:inline">
          {languageLabels[locale]}
        </span>
        <ChevronDown size={14} className="opacity-60" />
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
              className={`w-full px-4 py-3 text-left text-sm transition
                ${
                  locale === lng
                    ? "bg-theme/10 text-theme font-semibold"
                    : "hover:bg-black/5 text-black"
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
