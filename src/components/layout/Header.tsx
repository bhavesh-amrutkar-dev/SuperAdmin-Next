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
    { key: "raffles", href: "/reffles" },
    { key: "winners", href: "/winners" },
    { key: "contact", href: "/contact" },
  ];

  // Fetch cart count function
  const fetchCartCount = async () => {
    try {
      const response = await CartService.getCart();
      const data = (response as any)?.data?.data || (response as any)?.data || response;

      // Check if cart is empty
      if (data && typeof data === 'object' && data.message === "Data not found") {
        setCartCount(0);
        return;
      }

      // Count items in cart
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
    } catch (error: any) {
      // Handle empty cart or errors gracefully
      if (error?.response?.data?.message === "Data not found" || error?.message === "Data not found") {
        setCartCount(0);
      } else {
        // Silently fail for other errors
        setCartCount(0);
      }
    }
  };

  useEffect(() => {
    setIsLoggedIn(!!getCookie("access_token"));

    const country =
      (getCookie(COUNTRY) as string | undefined) || DEFAULT_COUNTRY;
    setCurrentCountry(country);

    if (!getCookie("C_code")) {
      setCountryModalOpen(true);
    }

    // Fetch cart count on mount
    fetchCartCount();

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#2F2F2F]">
      {/* MAIN BAR */}
      <div className="mx-auto max-w-412 px-4">
        <div className="flex h-16 md:h-20 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
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
          <nav className="hidden lg:flex items-center gap-10 text-sm font-semibold uppercase text-white">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[#FECB02] transition"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* Country (Desktop) */}
            <button
              onClick={() => setCountryModalOpen(true)}
              className="hidden md:flex items-center gap-1 rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-white hover:bg-white/20"
            >
              <Globe size={14} />
              {currentCountry}
            </button>

            <LanguageSwitcher />

            {/* Login / User */}
            {!isLoggedIn ? (
              <Link
                href="/auth/login"
                className="hidden lg:flex btn-primary px-3 py-2 rounded-md text-sm font-semibold"
              >
                <User size={16} />
                {t("login")}
              </Link>
            ) : (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="btn-primary px-3 py-2 rounded-md"
                >
                  <User size={18} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg border">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t("manageProfile")}
                    </Link>
                    <Link
                      href="/addresses"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t("savedAddresses")}
                    </Link>
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logoutUser();
                        router.replace("/auth/login");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center rounded-md btn-primary p-2"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-white"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
          } bg-white`}
      >
        <nav className="flex flex-col px-6 py-6 space-y-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}

          <button
            onClick={() => setCountryModalOpen(true)}
            className="flex items-center gap-2 pt-4"
          >
            <Globe size={16} />
            {currentCountry}
          </button>

          {!isLoggedIn ? (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 pt-4"
            >
              <User size={16} />
              {t("login")}
            </Link>
          ) : (
            <>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="pt-4"
              >
                {t("manageProfile")}
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logoutUser();
                  router.replace("/auth/login");
                }}
                className="text-left text-red-600"
              >
                {t("logout")}
              </button>
            </>
          )}
        </nav>
      </div>

      <CountrySelectorModal
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onCountryChange={(country) => setCurrentCountry(country.name)}
      />
    </header>
  );
}
