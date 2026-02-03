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

  const navItems = [
    { key: "howItWorks", href: "#howItWorks" },
    { key: "raffles", href: "#raffles" },
    { key: "winners", href: "#winners" },
    { key: "contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#2F2F2F] backdrop-blur border-b border-black/10 shadow-[0px_4px_10px_0px_#00000059] mb-4">
      <div className="mx-auto w-full max-w-[1648px] px-2 md:px-6">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={website_logo}
              alt="DonRifa"
              width={200}
              height={40}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-14 text-sm text-white uppercase font-semibold">
            {[
              { label: "How It Works", href: "#howItWorks" },
              { label: "Raffles", href: "#raffles" },
              { label: "Winners", href: "#winners" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative hover:text-[#FECB02] transition
                  after:absolute after:-bottom-1 after:left-0 after:h-0.5
                  after:w-0 after:bg-[#FECB02] after:transition-all hover:after:w-full"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Login */}
            <Link
              href="/login"
              className="hidden lg:flex items-center gap-2 text-sm
                         text-black hover:text-theme transition btn-primary px-3 py-2 rounded-md border border-black/10 font-semibold"
            >
              <User size={18} />
              {t("Login")}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-md hover:bg-black/5 transition btn-primary flex items-center justify-center"
            >
              <ShoppingCart className="mr-1" size={20} />
              <span className="bg-[#2F2F2F] text-white
                               text-sm font-semibold rounded-full w-5 h-5 inline-flex items-center justify-center">
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-medium"
              >
                {t(item.key)}
              </Link>
            ))}

            <Link
              href="/auth/login"
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
