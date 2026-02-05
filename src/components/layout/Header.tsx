"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { website_logo } from "@/src/lib/config";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";
import { getCookie } from "cookies-next";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const t = useTranslations();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { key: "howItWorks", href: "#howItWorks" },
    { key: "raffles", href: "#raffles" },
    { key: "winners", href: "#winners" },
    { key: "contact", href: "#contact" },
  ];

  /** Check session on client */
  useEffect(() => {
    const token = getCookie("access_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#2F2F2F] border-b shadow mb-4">
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
          <nav className="hidden lg:flex items-center gap-10 xl:gap-14 text-sm text-white uppercase font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative hover:text-[#FECB02] transition"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Login / Account */}
            {!isLoggedIn ? (
              <Link
                href="/auth/login"
                className="hidden lg:flex items-center gap-2 text-sm font-semibold btn-primary px-3 py-2 rounded-md"
              >
                <User size={18} />
                {t("Login")}
              </Link>
            ) : (
              <div className="relative hidden lg:block">
                {/* User Button */}
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-semibold btn-primary px-3 py-2 rounded-md"
                >
                  <User size={18} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg border z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Manage Profile
                    </Link>

                    <button
                      onClick={() => {
                        // logout logic
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}


            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-md btn-primary flex items-center"
            >
              <ShoppingCart size={20} />
              <span className="ml-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-black/5 transition text-white"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t">
          <nav className="flex flex-col px-6 py-6 space-y-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}

            {!isLoggedIn && (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 pt-4 font-medium"
              >
                <User size={18} />
                {t("Login")}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
