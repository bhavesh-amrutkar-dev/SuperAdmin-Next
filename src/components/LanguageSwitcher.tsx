"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { setCookie } from "cookies-next";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/src/i18n/config";
import { Button } from "@/src/components/ui/button";

const languageLabels: Record<Locale, string> = {
  en: "English",
  es: "Spanish",
};

type Props = {
  variant?: "header" | "sidebar";
};

export default function LanguageSwitcher({ variant = "header" }: Props) {
  const [open, setOpen] = useState(false);
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    setCookie("NEXT_LOCALE", nextLocale, { path: "/" });
    setOpen(false);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("localeChanged", { detail: { locale: nextLocale } })
      );
    }

    const currentSearchParams = searchParams?.toString();
    const newUrl = currentSearchParams
      ? `${pathname ?? "/"}?${currentSearchParams}`
      : pathname ?? "/";

    router.replace(newUrl);
    router.refresh();
  };

  const isSidebar = variant === "sidebar";

  return (
    <div ref={ref} className={`relative min-h-10 ${isSidebar ? "w-full" : "hidden lg:inline-flex"}`}>
      {/* Trigger */}
      <Button
        variant={isSidebar ? "dropdown" : "dark"}
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className={`
          ${isSidebar ? "w-full justify-start" : "rounded-full btn-primary px-4 min-h-10"}
        `}
      >
        <Globe size={16} />

        <span className={isSidebar ? "flex-1 text-left" : "hidden sm:inline"}>
          {languageLabels[locale]}
        </span>

        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </Button>

      {/* Dropdown */}
      {open && (
        <div
          className={`
            lg:absolute mt-2 w-full lg:w-44 rounded-xl border shadow-xl
            bg-white overflow-hidden z-50
            ${isSidebar
              ? "left-0 border-gray-200"
              : "right-0 border-black/10 top-10"
            }
          `}
        >
          {locales.map((lng) => {
            const isActive = locale === lng;

            return (
              <Button
                key={lng}
                variant="dropdown"
                size="sm"
                onClick={() => changeLanguage(lng)}
                className={`
        w-full justify-start rounded-none transition-colors
        ${isActive
                    ? "text-yellow-500 hover:text-black"
                    : "hover:text-black"
                  }
      `}
              >
                {languageLabels[lng]}
              </Button>
            );
          })}

        </div>
      )}
    </div>
  );
}
