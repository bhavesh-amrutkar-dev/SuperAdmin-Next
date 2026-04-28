"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCookie, setCookie } from "cookies-next";
import { toast } from "sonner";
import {
  ShoppingBag, User, MapPin, CreditCard,
  Lock, ChevronRight, Plus, Minus,
  Trash2,
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
import ExpressRegisterForm, { ExpressRegisterFormRM } from "@/src/components/express/ExpressRegisterForm";
import { CDN_IMAGE, DEFAULT_COUNTRY_CODE } from "@/src/lib/config";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { trackEvent } from "@/src/lib/analytics";
import { BankDetail, PaymentService } from "@/src/lib/services/payment";
import { FileUploader } from "@/src/components/ui/fileUploader";
import AthMovilPayment from "@/src/components/payments/AuthMovilPayment";
import { useForm } from "react-hook-form";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CartItem {
  _id?: string;
  productId?: string;
  centralProductId?: string;
  productName?: string;
  name?: string;
  brandName?: string;
  storeName?: string;
  unitId?: string;
  ticketId?: string;
  product?: {
    name?: string;
    price?: number | string;
    ticketPrice?: number | string;
    unitPrice?: number | string;
    image?: string;
    images?: Array<{ medium?: string; large?: string; small?: string } | string> | { medium?: string; large?: string; small?: string };
    productImage?: string;
  };
  productImage?: string;
  image?: string;
  images?: {
    medium?: string;
    large?: string;
    small?: string;
  };
  sellerName?: string;
  storeId?: string;
  quantity?: number | { value?: number };
  price?: number | string;
  unitPrice?: number | string;
  ticketPrice?: number | string;
  ticketCount?: number;
  ticketDetails?: {
    numberOfTicket?: number;
    ticketId?: string;
  };
  numberOfFreeTickets?: number;
  totalPrice?: number | string;
  addToCartOnId?: string;
  accounting?: {
    finalUnitPrice?: number | string;
    unitPrice?: number | string;
    subTotal?: number | string;
  };
  sellerSingleUnitPrice?: {
    unitPrice?: number | string;
    price?: number | string;
    ticketPrice?: number | string;
  };
}

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

function getCartItemKey(item: CartItem, idx: number): string {
  return (
    item.addToCartOnId ||
    `${item.productId || item.centralProductId || item._id || "item"}::${item.ticketDetails?.ticketId || item.ticketId || "no-ticket"}` ||
    item.ticketDetails?.ticketId ||
    item.ticketId ||
    `${item._id || item.productId || item.centralProductId || "item"}-${idx}`
  );
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
  const [showManualModal, setShowManualModal] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [manualPaymentConfirmed, setManualPaymentConfirmed] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [athOrderId, setAthOrderId] = useState<string | null>(null);
  const [athToken, setAthToken] = useState<string | null>(null);
  const [isAthReady, setIsAthReady] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [updatingKeys, setUpdatingKeys] = useState<Record<string, "inc" | "dec" | null>>({});
  const [isRefreshingCart, setIsRefreshingCart] = useState(false);
  const form = useForm<ExpressRegisterFormRM>({
    mode: "onSubmit",              // ✅ change this
    reValidateMode: "onChange",    // ✅ change this
    shouldFocusError: true,
    defaultValues: {
      addressType: 1,
      city: "San Juan",
      country: "Puerto Rico",
      state: "PR",
      mobileNumberSortCode: "",
      mobileFullNumber: "",
    },
    shouldUnregister: false, // ✅ IMPORTANT
  });
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const accessToken = getCookie("access_token");

    if (accessToken) {
      router.replace("/");
      return;
    }

    setIsAuthChecked(true);
  }, []);
  useEffect(() => {
    trackEvent("VIEW_GUEST_CHECKOUT", {
      item_count: cartItems.length,
      cart_value: grandTotal,
    });
  }, []);
  useEffect(() => {
    if (showManualModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showManualModal]);
  // ── Init guest session & load cart ──────────────────
  useEffect(() => {
    initAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await PaymentService.getBankDetails();
        const banks =
          (res as any)?.data?.bankDetails ||
          (res as any)?.data?.data?.bankDetails ||
          [];

        setBankDetails(banks);
      } catch (err) {
        console.warn("Bank fetch failed", err);
      }
    };

    fetchBanks();
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
        const key = getCartItemKey(item, idx);
        next[key] = getQty(item);
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
  const isCartEmpty = cartItems.length === 0;
  const accounting = cartData?.accounting || {};
  const currency = cartData?.currencySymbol || "$";

  const updateQty = async (item: CartItem, key: string, delta: number) => {
    if (updatingKeys[key]) return;

    const actionType = delta > 0 ? "inc" : "dec";

    try {
      setUpdatingKeys((prev) => ({ ...prev, [key]: actionType }));

      const currentQty = quantities[key] ?? getQty(item);
      const newQty = Math.max(1, currentQty + delta);

      const payload = {
        productId: item.productId || item._id || "",
        centralProductId: item.centralProductId || item._id || "",
        unitId: item.unitId,
        storeId: item.storeId,
        ticketId: item.ticketDetails?.ticketId,
        campaignId: (item as any)?.campaignId || "",
        countryId: getCookie("C_id") as string,

        newQuantity: newQty,
        action: 2,

        cartType: 2,
        typeOfCart: 1,
        storeTypeId: 1,

        offers: {},
        addToCartOnId: item.addToCartOnId,
        cartStatus: "updatecart",

        deliveryAddressId: getCookie("addressid") as string || "",
      };

      await CartService.addToCart(payload);

      setQuantities((prev) => ({
        ...prev,
        [key]: newQty,
      }));

    } catch (err: any) {
      toast.error(err?.message || t("guestCheckoutQuantityUpdateFailed"));
    } finally {
      setUpdatingKeys((prev) => ({ ...prev, [key]: null }));
    }
  };
  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item, idx) => {
        const key = getCartItemKey(item, idx);
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

  const handleRemoveItem = async (item: CartItem, key: string) => {
    try {
      setIsRefreshingCart(true);
      // ✅ Optimistic UI update (instant remove)
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      setCartData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          sellers: prev.sellers
            ?.map((seller) => ({
              ...seller,
              products: seller.products?.filter((p, idx) => {
                return getCartItemKey(p, idx) !== key;
              }),
            }))
            .filter((s) => (s.products?.length ?? 0) > 0),
        };
      });
      console.log("item", item);

      // ✅ API CALL (same as cart page)
      const payload = {
        productId: item._id || "",
        centralProductId: item._id || "",
        unitId: item.unitId,
        storeId: item.storeId,
        ticketId: item.ticketDetails?.ticketId,
        campaignId: (item as any)?.campaignId || "",
        countryId: getCookie("C_id") as string,
        newQuantity: 0,
        action: 3, // ✅ DELETE
        cartType: 2,
        typeOfCart: 1,
        storeTypeId: 1,
        offers: {},
        addToCartOnId: item.addToCartOnId,
        cartStatus: "removedcart",
        deliveryAddressId: getCookie("addressid") as string || "",
      };

      await CartService.addToCart(payload);

      // ✅ Refresh silently
      await fetchCart();

      // ✅ Update header cart count
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success(t("itemRemoved"));
    } catch (err: any) {
      console.warn("Remove failed", err);
      toast.error(t("removeFailed"));

      // fallback reload
      await fetchCart();
    } finally {
      setIsRefreshingCart(false);
    }
  };


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
          { label: t("days"), value: time.days },
          { label: t("hrs"), value: time.hours },
          { label: t("mins"), value: time.minutes },
          { label: t("sec"), value: time.seconds },
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
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 sm:p-6 ${className}`}>
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
  useEffect(() => {
    let handled = false;

    const handlePaymentMessage = (event: MessageEvent) => {
      if (handled) return;
      if (event.origin !== window.location.origin) return;

      const { status, orderId, error } = event.data || {};
      if (!status) return;

      handled = true;

      if (status === "SUCCESS") {
        trackEvent("SQUARE_PAYMENT_SUCCESS", { order_id: orderId });
        handleSquareSuccess();
      }

      if (status === "FAILED") {
        trackEvent("SQUARE_PAYMENT_FAILURE", { order_id: orderId });
        handleSquareError(error || { orderId });
      }

      window.history.replaceState({}, "", window.location.pathname);
    };

    window.addEventListener("message", handlePaymentMessage);

    // ✅ URL fallback (redirect flow)
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderId = params.get("orderId");
    const message = params.get("message");

    if (!handled && status === "SUCCESS") {
      handled = true;

      trackEvent("SQUARE_PAYMENT_SUCCESS", { order_id: orderId });
      handleSquareSuccess();

      router.replace("/guest-checkout", { scroll: false });
    }

    if (!handled && status === "FAILED") {
      handled = true;

      trackEvent("SQUARE_PAYMENT_FAILURE", { order_id: orderId });
      handleSquareError({ orderId, message });

      router.replace("/guest-checkout", { scroll: false });
    }

    return () => {
      window.removeEventListener("message", handlePaymentMessage);
    };
  }, []);
  const handleSquareSuccess = () => {
    toast.success(t("paymentSuccess"), {
      description: t("redirecting"),
    });

    setTimeout(() => {
      router.push("/thank-you?payment=square");
    }, 1200);
  };

  const handleSquareError = (err: any) => {
    console.warn("Square payment failed:", err);

    toast.error(t("paymentErrorTitle"), {
      description: err?.message || t("tryAgain"),
    });

    fetchCart();
  };
  const validateCart = async () => {
    try {
      const res = await CartService.getCart();
      const data = (res as any)?.data;
console.log("data", data);

      if (!data || !data.sellers || data.sellers.length === 0) {
        throw new Error("CART_EMPTY");
      }

      return true;
    } catch (err: any) {
      throw new Error("CART_INVALID");
    }
  };
  const handleDynamicSubmit = async (formData: any) => {
    trackEvent("CLICK_PAY", {
      payment_method: paymentMethod,
      amount: grandTotal,
    });
    try {
      setPlacingOrder(true);

      await validateCart();
      const ipAddress = await getMyIP();

      const onlinePaymentMethodCode =
        paymentMethod === "athMovil" ? 10 :
          paymentMethod === "manual" ? 12 :
            21;
      // ✅ Manual payment
      if (paymentMethod === "manual") {
        setPendingFormData(formData); // store form
        setShowManualModal(true);
        setPlacingOrder(false);
        return;
      }
      const orderPayload = {
        ...formData, // ✅ comes from dynamic form

        ipAddress,
        storeType: 8,
        paymentType: 1,
        onlinePaymentMethod: onlinePaymentMethodCode,

        tip: 0,
        extraNote: "",
        orderImages: [],
        payByWallet: false,
        payByRewardWallet: false,
      };
      console.log("orderPayload", orderPayload);

      const res = await fetch("/api/expressRegistration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });
      console.log("res", res);

      const orderData = await res.json();

      if (!res.ok || !orderData?.orderId) {
        throw new Error(orderData?.message || t("guestCheckoutOrderFailed"));
      }
      trackEvent("ORDER_CREATED", {
        order_id: orderData.orderId,
        payment_method: paymentMethod,
        amount: grandTotal,
      });
      localStorage.setItem("orderId", orderData.orderId);


      if (orderData.paymentMethod === 21) {
        trackEvent("GOTO_PAYMENT", {
          order_id: orderData.orderId,
          payment_method: "square",
          amount: grandTotal,
        });

        const redirectUrl = orderData.checkoutUrl;

        if (!redirectUrl) {
          throw new Error(t("guestCheckoutMissingCheckoutUrl"));
        }

        // ✅ redirect to Square
        window.location.href = redirectUrl;
        return;
      }
      if (paymentMethod === "athMovil") {
        try {
          trackEvent("ATH_PAYMENT_INIT", {
            order_id: orderData.orderId,
            amount: grandTotal,
          });

          // ✅ Save order info
          setAthOrderId(orderData.orderId);
          setOrderTotal(orderData.totalAmount || grandTotal);

          // ✅ Get ATH token
          const tokenRes = await PaymentService.ATHMovileToken();

          const publicToken =
            (tokenRes as any)?.data?.data?.publicToken ||
            (tokenRes as any)?.data?.publicToken;

          if (!publicToken) {
            throw new Error(t("guestCheckoutAthTokenMissing"));
          }

          // ✅ Set state → triggers component
          setAthToken(publicToken);
          setIsAthReady(true);

          return; // ❗ STOP here
        } catch (err: any) {
          toast.error(err?.message || t("guestCheckoutAthPaymentFailed"));
          setPlacingOrder(false);
          return;
        }
      }

    } catch (err: any) {
      const msg = err?.message || "";

      // ✅ HANDLE MULTI-TAB CART ISSUE
      if (
        msg.includes("active cart not found") ||
        msg.includes("CART_INVALID")
      ) {
        toast.error("Your cart session expired. Please review your cart again.");

        await fetchCart(); 
        router.replace("/guest-checkout"); 
        return;
      }

      // ✅ normal errors
      toast.error(msg || t("checkoutError"));
      setPlacingOrder(false);
    }
  };
  const handleAthSuccess = async () => {
    trackEvent("ATH_MOVIL_SUCCESS", {
      order_id: athOrderId
    });

    if (!athOrderId) return;

    try {
      setIsAthReady(false);
      setPlacingOrder(false);

      await fetch("/api/orders/status-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: athOrderId,
          paymentMethod: 10,
        }),
      });

      router.push("/thank-you?payment=athmovil");

    } catch (err) {
      toast.error(t("guestCheckoutPaymentConfirmationFailed"));
    }
  };
  const handleAthCancel = async () => {
    trackEvent("ATH_MOVIL_CANCEL", {
      order_id: athOrderId
    });

    if (!athOrderId) return;

    setIsAthReady(false);
    setPlacingOrder(false);

    toast.error(t("paymentCancelled"));

    await fetch("/api/orders/status-update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: athOrderId,
        paymentMethod: 10,
      }),
    }).catch(() => { });

    fetchCart();
  };

  const baseCls = `
flex items-center justify-between w-full px-3 xl:px-4 py-3 rounded-xl
border text-sm transition-all cursor-pointer gap-1
`;


  if (loading || !isAuthChecked) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader />
          <p className="text-sm text-gray-400 animate-pulse">{t("guestCheckoutPreparing")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      <Header />

      <main className="flex-1 py-8 px-4 pb-8">
        <div className="max-w-7xl mx-auto">


          {/* ── 2-column grid ──
               Mobile  → 1 col
               Desktop → 2 col (cart+forms | payment+summary)     ── */}

          {isCartEmpty && !isRefreshingCart ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />

              <h2 className="text-lg font-semibold text-gray-700">
                {t("cartEmpty")}
              </h2>

              <p className="text-sm text-gray-400 mt-1 mb-4">
                {t("guestCheckoutEmptyDescription")}
              </p>

              <Button
                onClick={() => router.push("/")}
                className="mt-2"
              >
                {t("browseRaffles")}
              </Button>
            </div>
          ) : isRefreshingCart ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader />
              <p className="mt-4 text-sm text-gray-500">{t("loading") || "Updating cart..."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px] gap-5 items-start">

              {/* ════════════════════════════
                COL 1 — Cart Items + Personal Info + Address
                ════════════════════════════ */}
              <div className="space-y-5">

                {/* Cart Items */}
                <SectionCard>
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      <h2 className="font-semibold text-gray-800 text-[15px]">{t("guestCheckoutYourItems")}</h2>
                    </div>
                    {cartItems.length > 0 && (
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                        {cartItems.length} {cartItems.length === 1 ? t("item") : t("items")}
                      </span>
                    )}
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                      <ShoppingBag className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-medium">{t("cartEmpty")}</p>
                      <Button
                        onClick={() => router.push("/")}
                        variant="ghost"
                        className="text-xs text-[var(--theme-color)] font-semibold"
                      >
                        {t("browseRaffles")}
                      </Button>
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto sm:pr-2 custom-scroll">
                      <ul className="space-y-3 ">
                        {cartItems.map((item, idx) => {
                          const key = getCartItemKey(item, idx);

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
                              className="flex items-center gap-5 p-3 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 flex-wrap xl:flex-nowrap justify-between"
                            >
                              {/* LEFT - IMAGE */}
                              <div className="flex items-center gap-4 sm:gap-5">
                                <div className="relative w-20 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                                  <Image
                                    src={getProductImage(item)}
                                    alt={item.name || t("product")}
                                    fill
                                    className="object-contain"
                                  />
                                </div>

                                {/* CENTER */}
                                <div className="flex-1">
                                  <p className="text-yellow-500 font-extrabold text-lg leading-none">
                                    {t("win")}
                                  </p>

                                  <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">
                                    {item.name || item.productName}
                                  </p>
                                </div>
                              </div>

                              {/* RIGHT */}
                              <div className="flex flex-col-reverse sm:flex-row-reverse xl:flex-col items-start sm:items-center xl:items-end gap-3 justify-between xl:justify-items-start w-full xl:w-auto flex-wrap md:flex-nowrap">

                                {/* <Countdown timestamp={item.drawDateTimeStemp} /> */}
                                {/* PRICE + QTY */}
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full pe-3">

                                  {/* Price */}
                                  <div className="flex flex-col justify-center items-center text-center h-10 px-1 sm:px-3 min-w-[90px] sm:min-w-[110px]">
                                    <p className="text-xs text-gray-600 font-medium leading-none">
                                      {currency}{fmt(unitPrice)}
                                    </p>
                                    <p className="text-xs text-green-600 font-semibold leading-none mt-1">
                                      {qty} {t("tickets")}
                                    </p>
                                  </div>

                                  {/* Stepper */}
                                  <div className="flex items-center bg-yellow-400 rounded-full px-2 sm:px-3 h-10 gap-1 sm:gap-3">
                                    <Button
                                      onClick={() => updateQty(item, key, -1)}
                                      disabled={qty <= 1 || !!updatingKeys[key]}
                                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${qty <= 1
                                        ? "bg-gray-200 cursor-not-allowed opacity-50"
                                        : "bg-white"
                                        }`}
                                    >
                                      {updatingKeys[key] === "dec" ? (
                                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Minus className="w-4 h-4" />
                                      )}
                                    </Button>

                                    <span className="font-bold text-base w-6 text-center">
                                      {qty}
                                    </span>

                                    <Button
                                      onClick={() => updateQty(item, key, 1)}
                                      disabled={!!updatingKeys[key]}
                                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm"
                                    >
                                      {updatingKeys[key] === "inc" ? (
                                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Plus className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveItem(item, key)}
                                    className="text-xs text-red-500 flex items-center gap-1 hover:cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* SUBTOTAL */}
                                <p className="text-xs text-gray-500">
                                  {t("subTotal")} {currency}{itemTotal}
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
                    title={t("guestCheckoutCustomerDetails")}
                  />

                  <ExpressRegisterForm
                    form={form} // ✅ pass form
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
                    <h2 className="font-bold text-gray-800 text-[15px]">{t("guestCheckoutOrderSummary")}</h2>
                  </div>

                  {/* Line items */}
                  <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 max-h-52 overflow-y-auto custom-scroll">
                    {cartItems.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">{t("cartEmpty")}</p>
                    ) : (
                      cartItems.map((item, idx) => {
                        const key = getCartItemKey(item, idx);

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
                                alt={item.name || item.productName || t("product")}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder-product.png";
                                }}
                              />

                            </div>
                            <p className="flex-1 text-xs text-gray-600 leading-tight line-clamp-2">
                              {item.name || item.productName || t("product")}
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
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-100 space-y-2.5">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{t("subTotal")}</span>
                      <span className="font-medium text-gray-700">
                        {currency}{fmt(accounting.bagTotal ?? accounting.subTotal ?? subtotal)}
                      </span>
                    </div>

                    {shipping > 0 && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{t("shippingFee")}</span>
                        <span className="font-medium text-gray-700">{currency}{fmt(shipping)}</span>
                      </div>
                    )}

                    {tax > 0 && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{t("tax")}</span>
                        <span className="font-medium text-gray-700">{currency}{fmt(tax)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-900">{t("total")}</span>
                      <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                        {currency}{fmt(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="font-semibold text-gray-800 text-[15px]">{t("selectMethod")}</h3>
                    </div>

                    <div className="flex flex-col gap-3">

                      {/* ATH Móvil */}
                      <button
                        type="button"
                        onClick={() => {
                          trackEvent("SELECT_PAYMENT_METHOD", {
                            method: "athMovil",
                          });
                          setPaymentMethod("athMovil")
                        }}
                        className={`${baseCls} ${paymentMethod === "athMovil"
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                      >
                        {/* LEFT */}
                        <div className="flex items-center gap-3">
                          <span className={`min-w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "athMovil" ? "border-yellow-500" : "border-gray-300"
                            }`}>
                            {paymentMethod === "athMovil" && (
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            )}
                          </span>

                          <span className="text-[12px] xl:text-sm font-medium text-start text-gray-700">
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
                      {paymentMethod === "athMovil" && isAthReady && athToken && athOrderId && (
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-3 my-4 bg-gray-100 rounded-xl">

                          <p className="text-sm font-medium text-gray-700">
                            {t("payment.title")}
                          </p>

                          <p className="text-xs text-gray-500">
                            {t("guestCheckoutAthInstruction")}
                          </p>

                          {/* 🔥 ATH BUTTON RENDERS HERE */}
                          <div className="flex justify-start">
                            <AthMovilPayment
                              total={orderTotal || grandTotal}
                              publicToken={athToken}
                              orderId={athOrderId}
                              userId={(getCookie("uid") as string) || ""}
                              onSuccess={handleAthSuccess}
                              onCancel={handleAthCancel}
                            />
                          </div>

                        </div>
                      )}
                      {!isAthReady && !athToken && !athOrderId &&
                        (<>
                          {/* Manual Payment */}
                          <button
                            type="button"
                            onClick={() => {
                              trackEvent("SELECT_PAYMENT_METHOD", {
                                method: "manual",
                              });
                              setPaymentMethod("manual")
                            }}
                            className={`${baseCls} ${paymentMethod === "manual"
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                          >
                            {/* LEFT */}
                            <div className="flex items-center gap-2 xl:gap-3">
                              <span className={`min-w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "manual" ? "border-yellow-500" : "border-gray-300"
                                }`}>
                                {paymentMethod === "manual" && (
                                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                )}
                              </span>

                              <span className="text-[12px] xl:text-sm font-medium text-start text-gray-700">
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
                            onClick={() => {
                              trackEvent("SELECT_PAYMENT_METHOD", {
                                method: "square",
                              });
                              setPaymentMethod("square")
                            }}
                            className={`${baseCls} ${paymentMethod === "square"
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                          >
                            <div className="flex items-center gap-2 xl:gap-3">
                              <span
                                className={`min-w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "square"
                                  ? "border-yellow-500"
                                  : "border-gray-300"
                                  }`}
                              >
                                {paymentMethod === "square" && (
                                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                )}
                              </span>

                              <span className="text-[12px] xl:text-sm font-medium text-start text-gray-700">
                                {t("paySqr")}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Image src="/images/Profile_new/visa.svg" alt="VISA" width={40} height={25} className="h-5 w-auto object-contain" />
                              <Image src="/images/Profile_new/mastercard.svg" alt="Mastercard" width={40} height={25} className="h-5 w-auto object-contain" />
                              <Image src="/images/Profile_new/amex.jpg" alt="AMEX" width={40} height={25} className="h-5 w-auto object-contain" />
                              <Image src={CDN_IMAGE + "card-8.svg"} alt="Discovery" width={40} height={25} className="h-5 w-auto object-contain" />
                            </div>
                          </button></>)
                      }

                    </div>

                  </div>

                  {/* Pay button */}
                  <div className="px-6 pb-6">

                    <Button
                      type="submit"
                      form="express-form"
                      disabled={placingOrder || cartItems.length === 0 || (paymentMethod === "athMovil" && isAthReady)}
                      className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                               transition-all duration-200
                               "
                    >
                      {placingOrder ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t("placingOrder")}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 opacity-70" />
                          {t("guestCheckoutPayAmount", { amount: `${currency}${fmt(grandTotal)}` })}
                        </>
                      )}
                    </Button>


                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-5 shadow-xl">

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800">
              {t("manualPaymentTitle")}
            </h2>

            {/* Bank List */}
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                {t("selectBank")}
              </p>

              <div className="grid grid-cols-3 gap-3">
                {bankDetails.map((bank) => (
                  <div
                    key={bank._id}
                    onClick={() => setSelectedBank(bank)}
                    className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center bg-white transition-all
          ${selectedBank?._id === bank._id
                        ? "border-yellow-400 shadow-md ring-2 ring-yellow-300"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    {/* ✅ Bank Logo */}
                    {bank.paymentMethodLogo ? (
                      <img
                        src={bank.paymentMethodLogo}
                        alt={bank.bankName}
                        className="h-8 object-contain"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 text-center">
                        {bank.bankName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Receipt */}

            <FileUploader
              title={t("uploadReceipt")}
              maxFiles={1}
              acceptedTypes=".jpg,.png,.jpeg"
              helperText={
                !selectedBank
                  ? t("guestCheckoutSelectBankFirst")
                  : t("guestCheckoutUploadReceiptHelper")
              }
              currentFiles={receiptFile ? [receiptFile] : []}
              onFileChange={(files) => {
                if (!selectedBank) return; // extra safety
                const file = files[0] as File;
                setReceiptFile(file);
              }}
              disabled={!selectedBank} // ✅ IMPORTANT
            />
            {/* Confirm Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={manualPaymentConfirmed}
                onChange={(e) => {
                  trackEvent("MANUAL_PAYMENT_SUBMIT", {
                    bank_id: selectedBank?._id,
                  });
                  setManualPaymentConfirmed(e.target.checked)
                }}

              />
              <p className="text-sm text-gray-600">
                {t("guestCheckoutManualPaymentConfirmed")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowManualModal(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="w-full"
                disabled={
                  !selectedBank ||
                  !receiptFile ||
                  !manualPaymentConfirmed ||
                  placingOrder
                }
                onClick={async () => {
                  try {
                    setPlacingOrder(true);

                    // ✅ 1. Close modal FIRST
                    setShowManualModal(false);

                    const ipAddress = await getMyIP();

                    const orderPayload = {
                      ...pendingFormData,
                      ipAddress,
                      storeType: 8,
                      paymentType: 1,
                      onlinePaymentMethod: 12,
                    };

                    // ✅ 2. Create order
                    const res = await fetch("/api/expressRegistration", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(orderPayload),
                    });

                    const orderData = await res.json();

                    if (!res.ok || !orderData?.orderId) {
                      throw new Error(orderData?.message || t("guestCheckoutOrderFailed"));
                    }

                    // ✅ 3. Upload receipt
                    const formData = new FormData();
                    const country =
                      (getCookie("C_code") as string) || DEFAULT_COUNTRY_CODE;
                    if (!receiptFile) {
                      throw new Error(t("guestCheckoutReceiptMissing"));
                    }
                    formData.append("image", receiptFile);
                    formData.append("master_order_id", orderData.orderId);
                    formData.append("country_code", country);

                    await PaymentService.uploadReceipt(formData);

                    // ✅ 4. Success
                    localStorage.setItem("orderId", orderData.orderId);

                    toast.success(t("guestCheckoutPaymentSubmitted"));

                    router.push("/thank-you?payment=manual");

                  } catch (err: any) {
                    console.warn(err);
                    toast.error(err?.message || t("guestCheckoutManualPaymentFailed"));
                    setPlacingOrder(false);
                  }
                }}
              >
                {placingOrder ? t("processing") : t("confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "athMovil" &&
        isAthReady &&
        athToken &&
        athOrderId && (
          <AthMovilPayment
            total={orderTotal || grandTotal}
            publicToken={athToken}
            orderId={athOrderId}
            userId={(getCookie("uid") as string) || ""}
            onSuccess={handleAthSuccess}
            onCancel={handleAthCancel}
          />
        )}
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
