"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setCookie } from "cookies-next";
import { toast } from "sonner";
import {
  ShoppingBag, User, MapPin, CreditCard,
  Lock, ChevronRight, Plus, Minus,
} from "lucide-react";

import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { GuestService } from "@/src/lib/services/guest";
import { CartService } from "@/src/lib/services/cart";
import { AuthService } from "@/src/lib/services/auth";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import Loader from "@/src/components/loader";
import { getMyIP } from "@/src/lib/utils/getIp";
import ExpressRegisterForm from "@/src/components/express/ExpressRegisterForm";
import { CDN_IMAGE } from "@/src/lib/config";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type CartItem = {
  _id?: string;
  name?: string;
  productName?: string;
  drawDateTimeStemp?: number;
  brandName?: string;
  quantity?: number | { value?: number };
  images?: { large?: string; medium?: string; small?: string } | any;
  productImage?: string;
  image?: string;
  accounting?: {
    finalUnitPrice?: number | string;
    unitPrice?: number | string;
    subTotal?: number | string;
  };
  price?: number | string;
};

type CartData = {
  _id?: string;
  currencySymbol?: string;
  sellers?: Array<{
    sellerName?: string;
    storeId?: string;
    products?: CartItem[];
  }>;
  accounting?: {
    bagTotal?: number | string;
    subTotal?: number | string;
    tax?: number | string;
    deliveryFee?: number | string;
    shippingFee?: number | string;
    finalTotal?: number | string;
    grandTotal?: number | string;
  };
};


// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmt(value: number | string | undefined) {
  return (Number(value) || 0).toFixed(2);
}

function getProductImage(item: CartItem): string {
  const img = item.images && typeof item.images === "object" && !Array.isArray(item.images) ? item.images : null;
  if (img?.large) return img.large;
  if (img?.medium) return img.medium;
  if (img?.small) return img.small;
  if (item.productImage) return item.productImage;
  if (item.image) return item.image;
  return "/placeholder-product.png";
}

function getQty(item: CartItem): number {
  if (typeof item.quantity === "object") return item.quantity?.value || 1;
  return item.quantity || 1;
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function GuestCheckoutPage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"square" | "athMovil" | "manual">("square");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // ── Init guest session & load cart ──────────────────
  useEffect(() => {
    initAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const initAndLoad = async () => {
    try {
      // If there's no token already, initialise a guest session
      const existingToken = document.cookie.includes("token=");
      if (!existingToken) {
        const res = await GuestService.initGuest();
        const token = (res as any)?.data?.token?.accessToken;
        if (token) {
          const cookieOpts = {
            path: "/",
            sameSite: "none" as const,
            secure: true,
            maxAge: 60 * 60 * 24,
          };
          setCookie("token", token, cookieOpts);
          setCookie("access_token", token, cookieOpts);
        }
      }
      await fetchCart();
    } catch (err) {
      console.warn("Guest init error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await CartService.getCart();
      const data = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      setCartData(data as CartData);
    } catch (err: any) {
      if (err?.status === 404) {
        setCartData({ sellers: [], accounting: {} });
      } else {
        console.warn("Cart fetch error:", err);
      }
    }
  };

  // ── Sync quantities when cart loads ─────────────────
  useEffect(() => {
    const items: CartItem[] = [];
    (cartData?.sellers || []).forEach((s) => (s.products || []).forEach((p) => items.push(p)));
    if (items.length === 0) return;
    setQuantities((prev) => {
      const next = { ...prev };
      items.forEach((item, idx) => {
        const key = item._id || String(idx);
        if (!(key in next)) next[key] = getQty(item);
      });
      return next;
    });
  }, [cartData]);

  // ── Derived cart values ─────────────────────────────
  const cartItems = useMemo(() => {
    const items: CartItem[] = [];
    (cartData?.sellers || []).forEach((seller) => {
      (seller.products || []).forEach((p) => items.push(p));
    });
    return items;
  }, [cartData]);

  const accounting = cartData?.accounting || {};
  const currency = cartData?.currencySymbol || "$";

  const updateQty = (key: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] ?? 1) + delta) }));
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item, idx) => {
        const key = item._id || String(idx);
        const qty = quantities[key] ?? getQty(item);
        const unitPrice =
          Number(item.accounting?.finalUnitPrice) ||
          Number(item.accounting?.unitPrice) ||
          Number(item.price) ||
          0;
        return sum + unitPrice * qty;
      }, 0),
    [cartItems, quantities]
  );

  const tax = Number(accounting.tax) || 0;
  const shipping = Number(accounting.deliveryFee ?? accounting.shippingFee ?? 0);
  const grandTotal = subtotal + tax + shipping;




  const isRaffle = useMemo(() => {
    return cartItems.some((item: any) => !!item?.campaignId);
  }, [cartItems]);


  const Countdown = ({ timestamp }: { timestamp?: number }) => {
    const [time, setTime] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    useEffect(() => {
      if (!timestamp || timestamp <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const interval = setInterval(() => {
        const end = new Date(timestamp * 1000).getTime();
        const now = Date.now();
        const diff = end - now;

        if (diff > 0) {
          setTime({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          });
        } else {
          setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [timestamp]);

    return (
      <div className="flex items-center gap-4 text-center">
        {[
          { label: "DAYS", value: time.days },
          { label: "HRS", value: time.hours },
          { label: "MINS", value: time.minutes },
          { label: "SECS", value: time.seconds },
        ].map((t, i, arr) => (
          <div key={i} className="flex items-center gap-2">
            <div>
              <p className="text-[10px] text-yellow-500 font-semibold">
                {t.label}
              </p>
              <p className="text-sm font-bold text-gray-800">
                {String(t.value).padStart(2, "0")}
              </p>
            </div>

            {/* ✅ Separator only if NOT last */}
            {i < arr.length - 1 && (
              <span className="h-6 w-px bg-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>
    );
  };

  // ── section card wrapper ──
  const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 ${className}`}>
      {children}
    </div>
  );

  // ── section heading ──
  const SectionHeading = ({
    step, icon, title,
  }: {
    step: number;
    icon: React.ReactNode;
    title: string;
  }) => (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
      <span className="text-gray-400">{icon}</span>
      <h2 className="font-semibold text-gray-800 text-[15px]">{title}</h2>
    </div>
  );
  const handleDynamicSubmit = async (formData: any) => {
    try {
      setPlacingOrder(true);

      const ipAddress = await getMyIP();

      const onlinePaymentMethodCode =
        paymentMethod === "athMovil" ? 10 :
          paymentMethod === "manual" ? 12 :
            21;

      const orderPayload = {
        ...formData, // ✅ comes from dynamic form

        ipAddress,
        storeType: 8,
        orderType: 2,
        paymentType: 1,
        onlinePaymentMethod: onlinePaymentMethodCode,

        tip: 0,
        extraNote: "",
        orderImages: [],
        payByWallet: false,
        payByRewardWallet: false,
      };

      const res = await fetch("/api/orders/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData?.orderId) {
        throw new Error(orderData?.message || "Order failed");
      }

      localStorage.setItem("orderId", orderData.orderId);

      if (paymentMethod === "manual") {
        router.push("/thank-you");
        return;
      }

      window.location.href = orderData.checkoutProcessUrl;

    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
      setPlacingOrder(false);
    }
  };

  const baseCls = `
flex items-center justify-between w-full px-4 py-3 rounded-xl
border text-sm transition-all cursor-pointer
`;


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader />
          <p className="text-sm text-gray-400 animate-pulse">Preparing your checkout…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      <Header />

      <main className="flex-1 py-8 px-4 pb-28 lg:pb-8">
        <div className="max-w-7xl mx-auto">


          {/* ── 2-column grid ──
               Mobile  → 1 col
               Desktop → 2 col (cart+forms | payment+summary)     ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start">

            {/* ════════════════════════════
                COL 1 — Cart Items + Personal Info + Address
                ════════════════════════════ */}
            <div className="space-y-5">

              {/* Cart Items */}
              <SectionCard>
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <h2 className="font-semibold text-gray-800 text-[15px]">Your Items</h2>
                  </div>
                  {cartItems.length > 0 && (
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                      {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                    <ShoppingBag className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-medium">Your cart is empty</p>
                    <button
                      onClick={() => router.push("/")}
                      className="text-xs text-[var(--theme-color)] font-semibold hover:underline"
                    >
                      Browse raffles →
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto pr-2 custom-scroll">
                    <ul className="space-y-3 ">
                      {cartItems.map((item, idx) => {
                        const key = item._id || String(idx);

                        const qty = quantities[key] ?? getQty(item);

                        const unitPrice =
                          Number(item.accounting?.finalUnitPrice) ||
                          Number(item.accounting?.unitPrice) ||
                          Number(item.price) ||
                          0;

                        const itemTotal = fmt(unitPrice * qty);


                        return (
                          <li
                            key={`${item._id}-${idx}`}
                            className="flex items-center gap-5 p-5 rounded-2xl bg-gray-50 border border-gray-200"
                          >
                            {/* LEFT - IMAGE */}
                            <div className="relative w-28 h-24 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                              <Image
                                src={getProductImage(item)}
                                alt={item.name || "Product"}
                                fill
                                className="object-contain"
                              />
                            </div>

                            {/* CENTER */}
                            <div className="flex-1">
                              <p className="text-yellow-500 font-extrabold text-lg leading-none">
                                WIN
                              </p>

                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                {item.name || item.productName}
                              </p>
                            </div>

                            {/* RIGHT */}
                            <div className="flex flex-col items-end gap-3">

                              <Countdown timestamp={item.drawDateTimeStemp} />
                              {/* PRICE + QTY */}
                              <div className="flex items-center gap-2 bg-gray-100 rounded-full">

                                {/* Price */}
                                <div className="flex flex-col justify-center items-center text-center h-10 px-3 min-w-[110px]">
                                  <p className="text-xs text-gray-600 font-medium leading-none">
                                    {currency}{fmt(unitPrice)}
                                  </p>
                                  <p className="text-xs text-green-600 font-semibold leading-none mt-1">
                                    {qty} {t("tickets")}
                                  </p>
                                </div>

                                {/* Stepper */}
                                <div className="flex items-center bg-yellow-400 rounded-full px-3 h-10 gap-3">
                                  <Button
                                    onClick={() => updateQty(key, -1)}
                                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>

                                  <span className="font-bold text-base w-6 text-center">
                                    {qty}
                                  </span>

                                  <Button
                                    onClick={() => updateQty(key, 1)}
                                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* SUBTOTAL */}
                              <p className="text-xs text-gray-500">
                                Sub Total {currency}{itemTotal}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </SectionCard>

              <SectionCard>
                <SectionHeading
                  step={1}
                  icon={<User className="w-4 h-4" />}
                  title="User Details"
                />

                <ExpressRegisterForm
                  cartId={(cartData as any)?._id}
                  isRaffle={isRaffle}
                  onSubmit={async (formData) => {
                    await handleDynamicSubmit(formData);
                  }}
                />
              </SectionCard>

            </div>

            {/* ════════════════════════════
                COL 2 — Order Summary + Payment
                ════════════════════════════ */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100
                              shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden sticky top-24">

                {/* Summary header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800 text-[15px]">Order Summary</h2>
                </div>

                {/* Line items */}
                <div className="px-6 py-4 space-y-3 max-h-52 overflow-y-auto custom-scroll">
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Cart is empty</p>
                  ) : (
                    cartItems.map((item, idx) => {
                      const key = item._id || String(idx);

                      const qty = quantities[key] ?? getQty(item);
                      const unitPrice =
                        Number(item.accounting?.finalUnitPrice) ||
                        Number(item.accounting?.unitPrice) ||
                        Number(item.price) ||
                        0;
                      const total = fmt(unitPrice * qty);
                      return (
                        <div key={`${item._id}-${idx}`} className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                            <Image
                              src={getProductImage(item)}
                              alt={item.name || item.productName || "Product"}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-product.png";
                              }}
                            />
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--footer-dark)]
                                             text-white text-[9px] font-bold flex items-center justify-center leading-none">
                              {qty}
                            </span>
                          </div>
                          <p className="flex-1 text-xs text-gray-600 leading-tight line-clamp-2">
                            {item.name || item.productName || "Product"}
                          </p>
                          <p className="text-xs font-semibold text-gray-800 shrink-0">
                            {currency}{total}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Totals */}
                <div className="px-6 py-4 border-t border-gray-100 space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-700">
                      {currency}{fmt(accounting.bagTotal ?? accounting.subTotal ?? subtotal)}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Shipping</span>
                      <span className="font-medium text-gray-700">{currency}{fmt(shipping)}</span>
                    </div>
                  )}

                  {tax > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Tax</span>
                      <span className="font-medium text-gray-700">{currency}{fmt(tax)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                      {currency}{fmt(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="px-6 py-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-gray-800 text-[15px]">Select Method</h3>
                  </div>

                  <div className="flex flex-col gap-3">

                    {/* ATH Móvil */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("athMovil")}
                      className={`${baseCls} ${paymentMethod === "athMovil"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "athMovil" ? "border-yellow-500" : "border-gray-300"
                          }`}>
                          {paymentMethod === "athMovil" && (
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          )}
                        </span>

                        <span className="font-medium text-gray-700">
                          {t("payWithATHMovil")}
                        </span>
                      </div>

                      {/* RIGHT */}
                      <Image
                        src="/images/icons/authmovil.png"
                        alt="ATH"
                        width={28}
                        height={18}
                      />
                    </button>

                    {/* Manual Payment */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("manual")}
                      className={`${baseCls} ${paymentMethod === "manual"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "manual" ? "border-yellow-500" : "border-gray-300"
                          }`}>
                          {paymentMethod === "manual" && (
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          )}
                        </span>

                        <span className="font-medium text-gray-700">
                          {t("manualPaymentMethods")}
                        </span>
                      </div>

                      {/* RIGHT ICON */}
                      <Image
                        src="/images/icons/mannualPayment.png"
                        alt="Manual"
                        width={40}
                        height={20}
                        className="object-contain"
                      />
                    </button>
                    {/* Credit / Debit Card (Square) */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("square")}
                      className={`${baseCls} ${paymentMethod === "square"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "square"
                            ? "border-yellow-500"
                            : "border-gray-300"
                            }`}
                        >
                          {paymentMethod === "square" && (
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          )}
                        </span>

                        <span className="font-medium text-gray-700">
                          {t("paySqr")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Image src="/images/Profile_new/visa.svg" alt="VISA" width={40} height={25} className="h-5 w-auto object-contain" />
                        <Image src="/images/Profile_new/mastercard.svg" alt="Mastercard" width={40} height={25} className="h-5 w-auto object-contain" />
                        <Image src="/images/Profile_new/amex.jpg" alt="AMEX" width={40} height={25} className="h-5 w-auto object-contain" />
                        <Image src={CDN_IMAGE + "card-8.svg"} alt="Discovery" width={40} height={25} className="h-5 w-auto object-contain" />
                      </div>
                    </button>

                  </div>

                </div>

                {/* Pay button */}
                <div className="px-6 pb-6">

                  <Button
                    type="submit"
                    form="express-form"
                    disabled={placingOrder || cartItems.length === 0}
                    className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                               transition-all duration-200
                               "
                  >
                    {placingOrder ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 opacity-70" />
                        Pay {currency}{fmt(grandTotal)}
                      </>
                    )}
                  </Button>


                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile sticky Pay bar ──
           Visible only on small screens, fixed to bottom          ── */}
      {/* <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
                      px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 leading-tight">Total</p>
          <p className="text-base font-extrabold text-gray-900 leading-tight">
            {currency}{fmt(grandTotal)}
          </p>
        </div>
        <Button
          type="submit"
          form="express-form"
          disabled={placingOrder || cartItems.length === 0}
          className="flex-shrink-0 h-11 px-6 rounded-xl font-bold text-sm flex items-center gap-2 transition-all
                     hover:opacity-90 active:scale-[0.97]
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placingOrder ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 opacity-70" />
              Pay {currency}{fmt(grandTotal)}
            </>
          )}
        </Button>
      </div> */}

      <Footer />
    </div>
  );
}