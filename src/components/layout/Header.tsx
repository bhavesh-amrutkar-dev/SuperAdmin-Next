"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { website_logo } from "@/src/lib/config";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";

export default function Header() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-black/10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={website_logo}
              alt="DonRifa"
              width={140}
              height={40}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-black">
            {[
              { label: "How It Works", href: "#howItWorks" },
              { label: "Raffles", href: "#raffles" },
              { label: "Winners", href: "#winners" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative hover:text-theme transition
                  after:absolute after:-bottom-1 after:left-0 after:h-0.5
                  after:w-0 after:bg-theme after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            <LanguageSwitcher />

            {/* Login */}
            <Link
              href="/login"
              className="hidden lg:flex items-center gap-2 text-sm font-medium
                         text-black hover:text-theme transition"
            >
              <User size={18} />
              {t("Login")}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-md hover:bg-black/5 transition"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-black text-white
                               text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-black/5 transition"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-black/10">
          <nav className="flex flex-col px-6 py-6 space-y-4 text-sm text-black">
            {[
              { key: "howItWorks", href: "#howItWorks" },
              { key: "raffles", href: "#raffles" },
              { key: "winners", href: "#winners" },
              { key: "contact", href: "#contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative hover:text-theme transition
      after:absolute after:-bottom-1 after:left-0 after:h-0.5
      after:w-0 after:bg-theme after:transition-all hover:after:w-full"
              >
                {t(`${item.key}`)}
              </Link>
            ))}


            <Link
              href="/login"
              className="flex items-center gap-2 pt-4 font-medium"
            >
              <User size={18} />
              {t("Login")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
