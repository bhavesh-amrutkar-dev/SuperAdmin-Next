"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart, User, Globe, MapPin, LogOut, Package } from "lucide-react";
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
import { usePathname, useRouter } from "next/navigation";
import { CartService } from "@/src/lib/services/cart";
import { Button } from "../ui/button";
import { useAuth } from "@/src/context/authContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState(DEFAULT_COUNTRY);
  const [cartCount, setCartCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  const [cookieUser, setCookieUser] = useState<{ name?: string; profilePic?: string } | null>(null);

  // Get user data from cookies on client side only (prevents hydration mismatch)
  useEffect(() => {
    const getUserFromCookies = () => {
      const token = getCookie("access_token");
      if (!token) return null;
      return {
        name: (getCookie("user_name") as string) || undefined,
        profilePic: (getCookie("profile_pic") as string) || undefined,
      };
    };
    setCookieUser(getUserFromCookies());
  }, [user]); // Re-check cookies when user context changes

  // Use user from context, or fallback to cookies (only on client)
  const displayUser = user || cookieUser;

  const navItems = [
    { key: "howItWorks", href: "/#howItWorks" },
    { key: "raffles", href: "/raffles" },
    { key: "winners", href: "/winners" },
    { key: "contact", href: "/contact" },
  ];
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    console.log("user", user);

  }, []);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

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
    setUserMenuOpen(false);
  }, [pathname]);
  // Check authentication status - reactive to changes in user context and cookies
  // Only run on client side to prevent hydration mismatch
  useEffect(() => {
    const checkAuth = () => {
      const token = getCookie("access_token");
      setIsLoggedIn(!!token || !!user);
    };

    // Check on mount and when pathname/user changes
    checkAuth();

    const country =
      (getCookie(COUNTRY) as string | undefined) || DEFAULT_COUNTRY;
    setCurrentCountry(country);

    if (!getCookie("C_code")) setCountryModalOpen(true);

    fetchCartCount();

    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [pathname, user]); // React to user context changes

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

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

            <Button
              variant="dark"
              size="sm"
              onClick={() => setCountryModalOpen(true)}
              className="hidden md:flex uppercase text-xs"
            >
              <Globe size={14} />
              {currentCountry}
            </Button>

            <LanguageSwitcher variant="header" />


            {!isLoggedIn && !displayUser ? (
              <Button asChild size="sm">
                <Link href="/auth/login">
                  <User size={16} /> {t("login")}
                </Link>
              </Button>

            ) : (
              <div ref={userMenuRef} className="relative user-menu-container">
                <Button
                  variant="dark"
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="rounded-full px-3"
                >
                  {displayUser?.profilePic ? (
                    <Image
                      src={displayUser.profilePic}
                      alt={displayUser.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#FECB02] flex items-center justify-center text-black font-semibold text-sm">
                      {displayUser?.name?.charAt(0).toUpperCase() || <User />}
                    </div>
                  )}
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                    {/* User Info Section */}
                    <div className="px-4 py-3 bg-gray-50 border-b">
                      <p className="text-sm font-semibold text-gray-800">
                        {displayUser?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Welcome back 👋
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 px-2 flex flex-col gap-1">

                      <Button
                        asChild
                        variant="dropdown"
                        size="sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Link href="/profile">
                          <User size={16} />
                          {t("manageProfile")}
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="dropdown"
                        size="sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Link href="/addresses">
                          <MapPin size={16} />
                          {t("savedAddresses")}
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="dropdown"
                        size="sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Link href="/orders">
                          <Package size={16} />
                          {t("myOrders")}
                        </Link>
                      </Button>

                    </div>


                    {/* Divider */}
                    <div className="border-t" />

                    <div className="px-2 pb-2">

                      <Button
                        variant="logout"
                        size="sm"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logoutUser();
                          router.replace("/auth/login");
                        }}
                      >
                        <LogOut size={16} />
                        {t("logout")}
                      </Button>

                    </div>


                  </div>
                )}
              </div>

            )}
          </nav>

          {/* CART ICON RIGHT */}
          <div className="flex items-center gap-2">
            <Button asChild size="icon" className="relative">
              <Link
                href="/cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>

        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${menuOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* HEADER SECTION */}
          <div className="p-6 border-b">
            {!isLoggedIn && !displayUser ? (
              <>
                <p className="text-lg font-semibold text-gray-900">
                  Welcome 👋
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Login or create an account
                </p>

                <div className="flex gap-3">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link href="/auth/login">
                      {t("login")}
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link href="/auth/register">
                      {t("signUp")}
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {displayUser?.profilePic ? (
                  <Image
                    src={displayUser.profilePic}
                    alt={displayUser.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#FECB02] flex items-center justify-center text-black font-semibold">
                    {displayUser?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-800">
                    {displayUser?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Welcome back 👋
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* MENU SECTION */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">

            {/* Navigation Links */}
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="dropdown"
                size="sm"
                className="w-full justify-start"
                onClick={() => setMenuOpen(false)}
              >
                <Link href={item.href}>
                  {t(item.key)}
                </Link>
              </Button>
            ))}

            <div className="border-t my-3" />

            {/* Country */}
            <Button
              variant="dropdown"
              size="sm"
              onClick={() => {
                setCountryModalOpen(true);
                setMenuOpen(false);
              }}
            >
              <Globe size={16} />
              {currentCountry}
            </Button>

            {/* Language */}
            <div className="pt-1">
              <LanguageSwitcher variant="sidebar" />
            </div>

            {isLoggedIn && (
              <>
                <div className="border-t my-3" />

                <Button
                  asChild
                  variant="dropdown"
                  size="sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <Link href="/profile">
                    <User size={16} />
                    {t("manageProfile")}
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="dropdown"
                  size="sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <Link href="/addresses">
                    <MapPin size={16} />
                    {t("savedAddresses")}
                  </Link>
                </Button>


                <Button
                  asChild
                  variant="dropdown"
                  size="sm"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Link href="/orders">
                    <Package size={16} />
                    {t("myOrders")}
                  </Link>
                </Button>

                <Button
                  variant="logout"
                  size="sm"
                  onClick={async () => {
                    setMenuOpen(false);
                    await logoutUser();
                    router.replace("/auth/login");
                  }}
                >
                  <LogOut size={16} />
                  {t("logout")}
                </Button>
              </>
            )}
          </div>
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
