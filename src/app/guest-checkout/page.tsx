"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setCookie } from "cookies-next";
import { toast } from "sonner";
import {
  ShoppingBag, User, MapPin, CreditCard,
  Lock, ChevronRight,
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

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type CartItem = {
  _id?: string;
  name?: string;
  productName?: string;
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

type GuestInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ShippingAddress = {
  addLine1: string;
  addLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
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

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [cartData, setCartData] = useState<CartData | null>(null);

  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    addLine1: "",
    addLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"square" | "athMovil" | "manual">("square");

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

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const qty = getQty(item);
        const price =
          Number(item.accounting?.subTotal) ||
          Number(item.accounting?.finalUnitPrice) * qty ||
          Number(item.price) * qty ||
          0;
        return sum + price;
      }, 0),
    [cartItems]
  );

  const tax = Number(accounting.tax) || 0;
  const shipping = Number(accounting.deliveryFee ?? accounting.shippingFee ?? 0);
  const grandTotal = Number(accounting.finalTotal ?? accounting.grandTotal ?? subtotal + tax + shipping);

  // ── Validation ──────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!guestInfo.firstName.trim()) e.firstName = "First name is required";
    if (!guestInfo.lastName.trim()) e.lastName = "Last name is required";
    if (!guestInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email))
      e.email = "Valid email is required";
    if (!guestInfo.phone.trim()) e.phone = "Phone number is required";

    if (!shippingAddress.addLine1.trim()) e.addLine1 = "Address line 1 is required";
    if (!shippingAddress.city.trim()) e.city = "City is required";
    if (!shippingAddress.state.trim()) e.state = "State is required";
    if (!shippingAddress.pincode.trim()) e.pincode = "ZIP / Postal code is required";
    if (!shippingAddress.country.trim()) e.country = "Country is required";

    if (!cartItems.length) e.cart = "Your cart is empty";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Place order ─────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setPlacingOrder(true);

    try {
      const cartId = (cartData as any)?._id || (cartData as any)?.cartId;
      if (!cartId) throw new Error("Cart not found. Please add items and try again.");

      // 1. Create a temporary address for this guest order
      const addressPayload = {
        name: `${guestInfo.firstName} ${guestInfo.lastName}`.trim(),
        addLine1: shippingAddress.addLine1,
        addLine2: shippingAddress.addLine2 || undefined,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        pincode: shippingAddress.pincode,
        mobileNumber: guestInfo.phone,
        mobileNumberCode: "+1",
        mobileNumberSortCode: "US",
        tagged: 1,
        taggedAs: "Home",
        default: true,
        latitude: 0,
        longitude: 0,
      };

      const addressRes = await AuthService.createAddress(addressPayload as any);
      const addressId =
        (addressRes as any)?.data?.data?._id ||
        (addressRes as any)?.data?._id ||
        (addressRes as any)?._id;

      if (!addressId) throw new Error("Could not save delivery address. Please try again.");

      // 2. Place order
      const ipAddress = await getMyIP();

      const onlinePaymentMethodCode =
        paymentMethod === "athMovil" ? 10 :
        paymentMethod === "manual"   ? 12 :
        21; // square

      const orderPayload = {
        cartId,
        addressId,
        billingAddressId: addressId,
        coupon: "",
        promoId: "",
        discount: 0,
        latitude: "0",
        longitude: "0",
        ipAddress,
        storeType: 8,
        delivery: [],
        orderType: 2,
        extraNote: "",
        tip: 0,
        orderImages: [],
        onlinePaymentMethod: onlinePaymentMethodCode,
        payByRewardWallet: false,
        cardId: "",
        paymentType: 1,
        payByWallet: false,
        userId: "1",
      };

      const res = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData?.orderId) {
        throw new Error(orderData?.message || "Failed to create order");
      }

      localStorage.setItem("orderId", orderData.orderId);

      // 3. Route by payment method
      if (paymentMethod === "manual") {
        router.push("/thank-you");
        return;
      }

      const redirectUrl = orderData?.checkoutProcessUrl;
      if (!redirectUrl) throw new Error("Payment URL not received. Please try again.");
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.warn("Guest checkout error:", err);
      toast.error(err?.message || "Something went wrong. Please try again.");
      setPlacingOrder(false);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

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

  // ── shared input class ──
  const inputCls = (field: string) =>
    `h-11 rounded-xl border bg-white px-3 text-sm transition-colors w-full
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-color)] focus-visible:ring-offset-0
     ${errors[field] ? "border-[var(--danger)] bg-red-50/40" : "border-gray-200 hover:border-gray-300"}`;

  // ── step badge ──
  const StepBadge = ({ n }: { n: number }) => (
    <span className="inline-flex w-6 h-6 rounded-full items-center justify-center
                     bg-[var(--theme-color)] text-[var(--footer-dark)] text-xs font-bold shrink-0">
      {n}
    </span>
  );

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
      <StepBadge n={step} />
      <span className="text-gray-400">{icon}</span>
      <h2 className="font-semibold text-gray-800 text-[15px]">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      <Header />

      <main className="flex-1 py-8 px-4 pb-28 lg:pb-8">
        <div className="max-w-7xl mx-auto">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">Guest Checkout</h1>
              <span className="hidden sm:inline-flex items-center gap-1 ml-2 text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                <Lock className="w-3 h-3" /> Secure
              </span>
            </div>

            {/* Sign-in nudge */}
            <button
              onClick={() => router.push("/auth/login?redirect=/secure-checkout")}
              className="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Already have an account?{" "}
              <span className="font-semibold text-[var(--theme-color)] group-hover:underline">Sign in</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* ── 3-column grid ──
               Mobile  → 1 col  (cart → forms → summary)
               Tablet  → 2 col  (cart+forms | summary)
               Desktop → 3 col  (cart | forms | summary)          ── */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_1.4fr_320px] gap-5 items-start">

            {/* ════════════════════════════
                COL 1 — Cart Items
                (order-1 on all breakpoints)
                ════════════════════════════ */}
            <div className="order-1">
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
                  <ul className="space-y-3">
                    {cartItems.map((item, idx) => {
                      const qty = getQty(item);
                      const itemTotal = fmt(
                        item.accounting?.subTotal ||
                          Number(item.accounting?.finalUnitPrice) * qty ||
                          Number(item.price) * qty
                      );
                      const unitPrice = fmt(
                        item.accounting?.finalUnitPrice ||
                          item.accounting?.unitPrice ||
                          item.price
                      );

                      return (
                        <li
                          key={item._id || idx}
                          className="group flex gap-3 p-3 rounded-xl border border-gray-100
                                     hover:border-gray-200 hover:shadow-sm transition-all duration-150 bg-gray-50/50"
                        >
                          {/* Image */}
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-white">
                            <Image
                              src={getProductImage(item)}
                              alt={item.name || item.productName || "Product"}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-product.png";
                              }}
                            />
                            {/* Qty badge */}
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
                                             bg-[var(--footer-dark)] text-white text-[10px] font-bold
                                             flex items-center justify-center leading-none">
                              {qty}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                              {item.name || item.productName || "Product"}
                            </p>
                            {item.brandName && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{item.brandName}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {currency}{unitPrice} × {qty}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="flex flex-col items-end justify-center shrink-0">
                            <p className="text-sm font-bold text-gray-900">
                              {currency}{itemTotal}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>
            </div>

            {/* ════════════════════════════
                COL 2 — Forms
                (order-3 on mobile → shown below summary,
                 order-2 on md/lg)
                ════════════════════════════ */}
            <div className="order-3 md:order-2 space-y-5">

              {/* ── Contact Information ── */}
              <SectionCard>
                <SectionHeading step={1} icon={<User className="w-4 h-4" />} title="Contact Information" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      First Name <span className="text-[var(--danger)]">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo((p) => ({ ...p, firstName: e.target.value }))}
                      className={inputCls("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-[var(--danger)]">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Last Name <span className="text-[var(--danger)]">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo((p) => ({ ...p, lastName: e.target.value }))}
                      className={inputCls("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-[var(--danger)]">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email — full width */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email Address <span className="text-[var(--danger)]">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo((p) => ({ ...p, email: e.target.value }))}
                      className={inputCls("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-[var(--danger)]">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone — full width */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Phone Number <span className="text-[var(--danger)]">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo((p) => ({ ...p, phone: e.target.value }))}
                      className={inputCls("phone")}
                    />
                    {errors.phone && (
                      <p className="text-xs text-[var(--danger)]">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* ── Shipping Address ── */}
              <SectionCard>
                <SectionHeading step={2} icon={<MapPin className="w-4 h-4" />} title="Shipping Address" />

                <div className="space-y-4">
                  {/* Address line 1 */}
                  <div className="space-y-1.5">
                    <Label htmlFor="addLine1" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Address Line 1 <span className="text-[var(--danger)]">*</span>
                    </Label>
                    <Input
                      id="addLine1"
                      placeholder="123 Main Street"
                      value={shippingAddress.addLine1}
                      onChange={(e) => setShippingAddress((p) => ({ ...p, addLine1: e.target.value }))}
                      className={inputCls("addLine1")}
                    />
                    {errors.addLine1 && (
                      <p className="text-xs text-[var(--danger)]">{errors.addLine1}</p>
                    )}
                  </div>

                  {/* Address line 2 */}
                  <div className="space-y-1.5">
                    <Label htmlFor="addLine2" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Address Line 2{" "}
                      <span className="normal-case font-normal text-gray-400">(optional)</span>
                    </Label>
                    <Input
                      id="addLine2"
                      placeholder="Apartment, suite, unit, floor…"
                      value={shippingAddress.addLine2}
                      onChange={(e) => setShippingAddress((p) => ({ ...p, addLine2: e.target.value }))}
                      className={inputCls("addLine2")}
                    />
                  </div>

                  {/* City + State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        City <span className="text-[var(--danger)]">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, city: e.target.value }))}
                        className={inputCls("city")}
                      />
                      {errors.city && (
                        <p className="text-xs text-[var(--danger)]">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        State / Province <span className="text-[var(--danger)]">*</span>
                      </Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, state: e.target.value }))}
                        className={inputCls("state")}
                      />
                      {errors.state && (
                        <p className="text-xs text-[var(--danger)]">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  {/* ZIP + Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        ZIP / Postal Code <span className="text-[var(--danger)]">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        placeholder="10001"
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, pincode: e.target.value }))}
                        className={inputCls("pincode")}
                      />
                      {errors.pincode && (
                        <p className="text-xs text-[var(--danger)]">{errors.pincode}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="country" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Country <span className="text-[var(--danger)]">*</span>
                      </Label>
                      <Input
                        id="country"
                        placeholder="United States"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, country: e.target.value }))}
                        className={inputCls("country")}
                      />
                      {errors.country && (
                        <p className="text-xs text-[var(--danger)]">{errors.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* ── Payment Method ── */}
              <SectionCard>
                <SectionHeading step={3} icon={<CreditCard className="w-4 h-4" />} title="Payment Method" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  {/* ── ATH Móvil ── */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("athMovil")}
                    className={`group relative flex flex-col items-start gap-3 p-4 rounded-xl border-2 text-left
                                transition-all duration-150 cursor-pointer
                                ${paymentMethod === "athMovil"
                                  ? "border-[var(--theme-color)] bg-[var(--theme-color)]/5 shadow-sm"
                                  : "border-dashed border-gray-200 hover:border-gray-300 bg-white"}`}
                  >
                    {/* Radio dot */}
                    <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    transition-colors
                                    ${paymentMethod === "athMovil" ? "border-[var(--theme-color)]" : "border-gray-300"}`}>
                      {paymentMethod === "athMovil" && (
                        <div className="w-2 h-2 rounded-full bg-[var(--theme-color)]" />
                      )}
                    </div>

                    <Image
                      src="/images/Profile_new/ath.jpg"
                      alt="ATH Móvil"
                      width={40}
                      height={24}
                      className="h-6 w-auto object-contain rounded"
                    />
                    <p className="text-xs font-semibold text-gray-700 leading-tight">Pay with ATH Móvil</p>
                  </button>

                  {/* ── Manual Payment ── */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("manual")}
                    className={`group relative flex flex-col items-start gap-3 p-4 rounded-xl border-2 text-left
                                transition-all duration-150 cursor-pointer
                                ${paymentMethod === "manual"
                                  ? "border-[var(--theme-color)] bg-[var(--theme-color)]/5 shadow-sm"
                                  : "border-dashed border-gray-200 hover:border-gray-300 bg-white"}`}
                  >
                    {/* Radio dot */}
                    <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    transition-colors
                                    ${paymentMethod === "manual" ? "border-[var(--theme-color)]" : "border-gray-300"}`}>
                      {paymentMethod === "manual" && (
                        <div className="w-2 h-2 rounded-full bg-[var(--theme-color)]" />
                      )}
                    </div>

                    <div className="w-10 h-6 rounded bg-gray-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">Manual Payment Methods</p>
                  </button>

                  {/* ── Credit / Debit Card (Square) ── */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("square")}
                    className={`group relative flex flex-col items-start gap-3 p-4 rounded-xl border-2 text-left
                                transition-all duration-150 cursor-pointer
                                ${paymentMethod === "square"
                                  ? "border-[var(--theme-color)] bg-[var(--theme-color)]/5 shadow-sm"
                                  : "border-dashed border-gray-200 hover:border-gray-300 bg-white"}`}
                  >
                    {/* Radio dot */}
                    <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    transition-colors
                                    ${paymentMethod === "square" ? "border-[var(--theme-color)]" : "border-gray-300"}`}>
                      {paymentMethod === "square" && (
                        <div className="w-2 h-2 rounded-full bg-[var(--theme-color)]" />
                      )}
                    </div>

                    {/* Card brand logos */}
                    <div className="flex items-center gap-1.5">
                      <Image src="/images/Profile_new/visa.svg"       alt="Visa"       width={32} height={20} className="h-5 w-auto object-contain" />
                      <Image src="/images/Profile_new/mastercard.svg" alt="Mastercard" width={32} height={20} className="h-5 w-auto object-contain" />
                      <Image src="/images/Profile_new/amex.jpg"       alt="Amex"       width={32} height={20} className="h-5 w-auto object-contain rounded-sm" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">Pay with Credit/Debit Card</p>
                  </button>

                </div>

                {/* Secure redirect notice shown when Square or ATH Móvil is selected */}
                {paymentMethod !== "manual" && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500">
                      You'll be securely redirected to complete your payment after placing the order.
                    </p>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* ════════════════════════════
                COL 3 — Order Summary + Pay
                (order-2 on mobile → shown above forms,
                 order-3 on md/lg but sticky)
                ════════════════════════════ */}
            <div className="order-2 md:order-3">
              <div className="bg-white rounded-2xl border border-gray-100
                              shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden sticky top-24">

                {/* Summary header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800 text-[15px]">Order Summary</h2>
                </div>

                {/* Line items */}
                <div className="px-6 py-4 space-y-3 max-h-52 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Cart is empty</p>
                  ) : (
                    cartItems.map((item, idx) => {
                      const qty = getQty(item);
                      const total = fmt(
                        item.accounting?.subTotal ||
                          Number(item.accounting?.finalUnitPrice) * qty ||
                          Number(item.price) * qty
                      );
                      return (
                        <div key={item._id || idx} className="flex items-center gap-3">
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

                {/* Pay button */}
                <div className="px-6 pb-6">
                  {errors.cart && (
                    <p className="text-xs text-[var(--danger)] mb-3">{errors.cart}</p>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || cartItems.length === 0}
                    className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                               transition-all duration-200
                               bg-[var(--footer-dark)] text-white
                               hover:opacity-90 active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
                  </button>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Lock className="w-3 h-3" /> SSL Secured
                    </span>
                    <span className="text-gray-200">|</span>
                    <span className="text-[11px] text-gray-400">Powered by Square</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile sticky Pay bar ──
           Visible only on small screens, fixed to bottom          ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
                      px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 leading-tight">Total</p>
          <p className="text-base font-extrabold text-gray-900 leading-tight">
            {currency}{fmt(grandTotal)}
          </p>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={placingOrder || cartItems.length === 0}
          className="flex-shrink-0 h-11 px-6 rounded-xl font-bold text-sm flex items-center gap-2
                     bg-[var(--footer-dark)] text-white transition-all
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
        </button>
      </div>

      <Footer />
    </div>
  );
}