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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CartService } from "@/src/lib/services/cart";
import { Button } from "../ui/button";
import { useAuth } from "@/src/context/authContext";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams?.toString();
  const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

  const redirectPath =
    fullPath && !fullPath.startsWith("/auth") ? fullPath : "/";
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
  const { user, setUser } = useAuth();
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
    if (pathname !== "/") return;

    const sections = document.querySelectorAll("#howItWorks, #raffles");

    const observer = new IntersectionObserver(
      (entries) => {
        let visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) {
          const id = visibleSection.target.getAttribute("id");
          if (id && window.location.hash !== `#${id}`) {
            history.replaceState(null, "", `#${id}`);
          }
        }
      },
      {
        threshold: [0.3, 0.6, 0.9],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [pathname]);
  useEffect(() => {
    // console.log("user", user);

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

  const fetchingCartRef = useRef(false);

  const fetchCartCount = async () => {
    // Prevent duplicate calls
    if (fetchingCartRef.current) return;

    fetchingCartRef.current = true;
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
    } finally {
      fetchingCartRef.current = false;
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
  }, [pathname, user]); // React to user context changes

  // Separate effect for cart fetching - only on mount and cart updates
  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => {
      // Reset the ref to allow fetching on cart update events
      fetchingCartRef.current = false;
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []); // Only run once on mount

  const handleLogout = async () => {
    // Close all menus immediately
    setUserMenuOpen(false);
    setMenuOpen(false);

    // Reset local UI state immediately
    setIsLoggedIn(false);
    setCookieUser(null);
    setUser(null);

    // Call logout utility (clears cookies)
    await logoutUser();

    // Redirect
    router.replace(`/auth/login-mobile?redirect=${encodeURIComponent(redirectPath)}`);
  };

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
    <header className="sticky top-0 z-50 bg-[#2F2F2F] border-b border-white/10">

      {/* MAIN BAR */}
      <div className="mx-auto max-w-412 px-4">
        <div className="flex h-16 md:h-18 lg:h-20 items-center justify-between">


          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 text-white hover: cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>

          {/* LOGO CENTERED ON MOBILE */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:translate-x-0 lg:max-w-[160px] xl:max-w-[200px]">
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
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[12px] xl:text-sm font-semibold uppercase text-white ml-10 lg:mr-4 lg:ml-[4%] xl:ml-[10%]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                // scroll={false}
                className="hover:text-[#FECB02] transition"
                // onClick={(e) => {
                //   const id = item.href.split("#")[1];

                //   // 👉 If NOT on homepage → allow normal navigation
                //   if (pathname !== "/") {

                //     return;
                //   }

                //   // 👉 If already on homepage → do smooth scroll
                //   e.preventDefault();

                //   const el = document.getElementById(id);
                //   if (el) {
                //     el.scrollIntoView({ behavior: "smooth" });
                //     history.replaceState(null, "", `#${id}`);
                //   }
                // }}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* CART ICON RIGHT */}
          <div className="flex items-center gap-2">
            <Button
              variant="dark"
              size="sm"
              onClick={() => setCountryModalOpen(true)}
              className="hidden lg:flex uppercase text-xs min-h-10 btn-primary"
            >
              <Globe size={14} />
              {currentCountry}
            </Button>
            <LanguageSwitcher variant="header" />


            {!isLoggedIn && !displayUser ? (
              <Button asChild size="sm" className="hidden lg:inline-flex">
                <Link href={`/auth/login-mobile?redirect=${encodeURIComponent(redirectPath)}`} className="btn-primary min-h-10">
                  <User size={16} /> {t("login")}
                </Link>
              </Button>

            ) : (
              <div
                ref={userMenuRef}
                className="relative user-menu-container hidden lg:inline-block"
              >
                <Button
                  variant="dark"
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="rounded-full p-0 w-10 h-10 overflow-hidden"
                >
                  {displayUser?.profilePic ? (
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={displayUser.profilePic}
                        alt={displayUser.name || "User"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full btn-primary flex items-center justify-center text-black font-semibold text-sm">
                      {displayUser?.name?.charAt(0).toUpperCase() || <User />}
                    </div>
                  )}
                </Button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                    {/* User Info Section */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">
                        {displayUser?.name || t("user")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("welcomeBackShort")}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 px-2 flex flex-col gap-1">

                      <Button
                        className="hover:bg-[#FECB02]/30 font-medium"
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
                        className="hover:bg-[#FECB02]/30 font-medium"
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
                        className="hover:bg-[#FECB02]/30 font-medium"
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
                    <div className="border-t border-gray-200" />

                    <div className="px-2 pb-2 mt-2">

                      <Button
                        className="hover:bg-red-500/10 hover:text-red-500 font-medium"
                        variant="logout"
                        size="sm"
                        onClick={handleLogout}

                      >
                        <LogOut size={16} />
                        {t("logout")}
                      </Button>

                    </div>


                  </div>
                )}
              </div>

            )}

            <Button
              size="icon"
              className="relative btn-primary"
              onClick={() => {
                if (isLoggedIn || displayUser) {
                  router.push("/cart");
                } else {
                  router.push("/guest-checkout");
                }
              }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
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
                  {t("welcome")}

                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {t("loginOrCreateAccount")}
                </p>

                <div className="flex gap-3">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 btn-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link href={`/auth/login-mobile?redirect=${encodeURIComponent(redirectPath)}`}>
                      {t("login")}
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 btn-primary"
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
                  <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center text-black font-semibold">
                    {displayUser?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-800">
                    {displayUser?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("welcomeBackShort")}
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
                  onClick={handleLogout}
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
