"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart, User, Globe } from "lucide-react";
import {
  COUNTRY,
  DEFAULT_COUNTRY,
  website_logo,
} from "@/src/lib/config";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";
import { getCookie } from "cookies-next";
import CountrySelectorModal from "./CountrySelectorModal";
import { logout as logoutUser } from "@/src/lib/utils/logout";
import { useRouter } from "next/navigation";
import { CartService } from "@/src/lib/services/cart";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState(DEFAULT_COUNTRY);
  const [cartCount, setCartCount] = useState(0);

  const t = useTranslations();
  const router = useRouter();

  const navItems = [
    { key: "howItWorks", href: "/#howItWorks" },
    { key: "raffles", href: "/raffles" },
    { key: "winners", href: "/winners" },
    { key: "contact", href: "/contact" },
  ];

  const fetchCartCount = async () => {
    try {
      const response = await CartService.getCart();
      const data = (response as any)?.data?.data || (response as any)?.data || response;

      if (data && typeof data === "object" && data.message === "Data not found") {
        setCartCount(0);
        return;
      }

      if (data?.sellers && Array.isArray(data.sellers)) {
        let count = 0;
        data.sellers.forEach((seller: any) => {
          if (seller.products && Array.isArray(seller.products)) {
            count += seller.products.length;
          }
        });
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    setIsLoggedIn(!!getCookie("access_token"));

    const country =
      (getCookie(COUNTRY) as string | undefined) || DEFAULT_COUNTRY;
    setCurrentCountry(country);

    if (!getCookie("C_code")) setCountryModalOpen(true);

    fetchCartCount();

    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#2F2F2F]">

      {/* MAIN BAR */}
      <div className="mx-auto max-w-412 px-4">
        <div className="flex h-16 md:h-20 items-center justify-between">


          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 text-white hover: cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>

          {/* LOGO CENTERED ON MOBILE */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:translate-x-0">
            <Image
              src={website_logo}
              alt="DonRifa"
              width={160}
              height={40}
              priority
              className="md:w-50"
            />
          </Link>



          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10 text-sm font-semibold uppercase text-white ml-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[#FECB02] transition"
              >
                {t(item.key)}
              </Link>
            ))}

            {/* Country */}
            <button
              onClick={() => setCountryModalOpen(true)}
              className="hidden md:flex items-center gap-1 rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-white hover:bg-white/20"
            >
              <Globe size={14} />
              {currentCountry}
            </button>

            <LanguageSwitcher />

            {!isLoggedIn ? (
              <Link
                href="/auth/login"
                className="btn-primary gap-1 px-3 py-2 rounded-md text-sm font-semibold flex items-center"
              >
                <User size={16} /> {t("login")}
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-3 py-2 rounded-full"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FECB02] flex items-center justify-center text-black font-semibold text-sm">
                    B
                  </div>
                  <span className="hidden md:block text-sm font-medium text-white">
                    Account
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                    {/* User Info Section */}
                    <div className="px-4 py-3 bg-gray-50 border-b">
                      <p className="text-sm font-semibold text-gray-800">
                        Bhavesh
                      </p>
                      <p className="text-xs text-gray-500">
                        Welcome back 👋
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <User size={16} />
                        {t("manageProfile")}
                      </Link>

                      <Link
                        href="/addresses"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        {t("savedAddresses")}
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t" />

                    {/* Logout */}
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logoutUser();
                        router.replace("/auth/login");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>

            )}
          </nav>

          {/* CART ICON RIGHT */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative flex items-center rounded-md btn-primary p-2"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />

        <aside className="relative z-50 w-64 h-full bg-white shadow-xl p-6 flex flex-col">
          <button
            onClick={() => setMenuOpen(false)}
            className="self-end mb-4 text-gray-700"
          >
            <X size={22} />
          </button>

          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-gray-800 font-medium"
              >
                {t(item.key)}
              </Link>
            ))}

            <button
              onClick={() => {
                setCountryModalOpen(true);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 pt-4 text-gray-800"
            >
              <Globe size={16} />
              {currentCountry}
            </button>

            {!isLoggedIn ? (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 pt-4 text-gray-800"
              >
                <User size={16} /> {t("login")}
              </Link>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="pt-4 text-gray-800"
                >
                  {t("manageProfile")}
                </Link>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await logoutUser();
                    router.replace("/auth/login");
                  }}
                  className="text-left pt-2 text-red-600"
                >
                  {t("logout")}
                </button>
              </>
            )}
          </nav>
        </aside>
      </div>

      <CountrySelectorModal
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onCountryChange={(country) => setCurrentCountry(country.name)}
      />
    </header>
  );
}
