"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { setCookie } from "cookies-next";
import { Loader2 } from "lucide-react";

import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { CartService } from "@/src/lib/services/cart";
import { UserAddressService } from "@/src/lib/services/userAddress";
import { Button } from "@/src/components/ui/button";
import Loader from "@/src/components/loader";

type TaxItem = {
  taxName?: string;
  totalValue?: number | string;
};

type CartItem = {
  _id?: string;
  productId?: string;
  centralProductId?: string;
  name?: string;
  productName?: string;
  brandName?: string;
  storeName?: string;
  sellerName?: string;
  storeId?: string;
  unitId?: string;
  ticketId?: string;
  addToCartOnId?: string | number;
  quantity?: number | { value?: number };
  images?: { large?: string; medium?: string; small?: string } | any;
  productImage?: string;
  image?: string;
  ticketCount?: number;
  ticketDetails?: { numberOfTicket?: number; ticketId?: string };
  numberOfFreeTickets?: number;
  accounting?: {
    finalUnitPrice?: number | string;
    unitPrice?: number | string;
    subTotal?: number | string;
  };
  price?: number | string;
  unitPrice?: number | string;
  ticketPrice?: number | string;
};

type CartData = {
  currencySymbol?: string;
  sellers?: Array<{
    sellerName?: string;
    storeId?: string;
    products?: CartItem[];
  }>;
  accounting?: {
    unitPrice?: number | string;
    bagTotal?: number | string;
    subTotal?: number | string;
    taxableAmount?: number | string;
    tax?: number | string | TaxItem[];
    deliveryFee?: number | string;
    shippingFee?: number | string;
    finalTotal?: number | string;
  };
  message?: string;
};

type UserAddress = {
  _id?: string;
  name?: string;
  addLine1?: string;
  addLine2?: string;
  flatNumber?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  countryCode?: string;
  emiratesRegionName?: string;
  mobileNumber?: string;
  mobileNumberCode?: string;
  landmark?: string;
  default?: boolean;
  tag?: string; // e.g. HOME
};

function formatCurrency(value: number | string | undefined): string {
  return (Number(value) || 0).toFixed(2);
}

function getProductImage(item: CartItem): string {
  // Old API often uses images.large
  const imagesObj = item.images && typeof item.images === "object" && !Array.isArray(item.images) ? item.images : null;
  if (imagesObj?.large) return imagesObj.large;
  if (imagesObj?.medium) return imagesObj.medium;
  if (imagesObj?.small) return imagesObj.small;
  if (item.productImage) return item.productImage;
  if (item.image) return item.image;
  return "/placeholder-product.png";
}

export default function ShippingAddressPage() {
  const t = useTranslations();
  const router = useRouter();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [continuing, setContinuing] = useState(false);

  // Refs to prevent duplicate API calls
  const fetchingCartRef = useRef(false);
  const fetchingAddressesRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const currency = cartData?.currencySymbol || "$";
  const accounting = cartData?.accounting || {};

  const cartItems = useMemo(() => {
    const items: CartItem[] = [];
    const sellers = cartData?.sellers || [];
    sellers.forEach((seller) => {
      (seller.products || []).forEach((p) => {
        items.push({
          ...p,
          sellerName: p.sellerName || seller.sellerName || "Unknown",
          storeName: (p as any).storeName || seller.sellerName,
          storeId: p.storeId || seller.storeId,
        });
      });
    });
    return items;
  }, [cartData]);

  useEffect(() => {
    // Prevent duplicate calls from React Strict Mode
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchCart(), fetchAddresses()]);
    setLoading(false);
  };

  const fetchCart = async () => {
    // Prevent duplicate calls
    if (fetchingCartRef.current) {
      return;
    }

    fetchingCartRef.current = true;
    try {
      const response = await CartService.getCart();
      const data = (response as any)?.data?.data || (response as any)?.data || response;

      if (data && typeof data === "object" && data.message === "Data not found") {
        setCartData({
          sellers: [],
          accounting: { bagTotal: 0, subTotal: 0, tax: 0, shippingFee: 0, finalTotal: 0 },
          message: "Data not found",
        });
        return;
      }

      setCartData(data as CartData);
    } catch (err: any) {
      if (err?.response?.data?.message === "Data not found" || err?.message === "Data not found") {
        setCartData({
          sellers: [],
          accounting: { bagTotal: 0, subTotal: 0, tax: 0, shippingFee: 0, finalTotal: 0 },
          message: "Data not found",
        });
        return;
      }
      // eslint-disable-next-line no-console
      console.warn("Error fetching cart:", err);
      setCartData(null);
    } finally {
      fetchingCartRef.current = false;
    }
  };

  const fetchAddresses = async () => {
    // Prevent duplicate calls
    if (fetchingAddressesRef.current) {
      return;
    }

    fetchingAddressesRef.current = true;
    try {
      setLoadingAddresses(true);
      const response = await UserAddressService.getAddresses();
      const data = (response as any)?.data?.data || (response as any)?.data || [];
      const list = Array.isArray(data) ? (data as UserAddress[]) : [];
      setAddresses(list);

      const defaultAddr = list.find((a) => a.default) || list[0];
      if (defaultAddr?._id) {
        selectAddress(defaultAddr._id);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn("Error fetching addresses:", err);
      setAddresses([]);
      setSelectedAddressId("");
    } finally {
      setLoadingAddresses(false);
      fetchingAddressesRef.current = false;
    }
  };

  const selectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    // keep old + new cookie keys in sync
    setCookie("addressid", addressId);
    setCookie("AddressID", addressId);
    setCookie("appyingCheck", "1");
  };

  const handleContinue = async () => {
    if (continuing) return;

    if (!selectedAddressId) {
      toast.error(t("selectAddress") || "Please select an address");
      return;
    }
    if (cartItems.length === 0) {
      toast.error(t("cartEmpty") || "Your cart is empty");
      return;
    }

    setContinuing(true);
    try {
      // Refresh cart before proceeding to ensure latest data (only if not already fetching)
      if (!fetchingCartRef.current) {
        await fetchCart();
      }
      router.push("/secure-checkout");
    } catch (error) {
      console.warn("Error during continue:", error);
      setContinuing(false);
    }
  };

  const shippingFee = Number((accounting as any).deliveryFee ?? (accounting as any).shippingFee ?? 0);
  const tax = accounting.tax;
  const taxItems = Array.isArray(tax) ? (tax as TaxItem[]) : null;
  const hasNamedTax = !!taxItems?.some((x) => x.taxName && x.taxName.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ededed]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          {/* <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loading") || "Loading..."}</p>
          </div> */}
          <Loader/>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ededed]">
      <Header />

      {/* Progress */}
      <div className="pt-10 lg:pt-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full btn-primary flex items-center justify-center text-white font-semibold text-xs sm:text-sm !border-0 pointer-events-none">
                <svg className="w-6 h-6" x="0" y="0" viewBox="0 0 32 32"><g><g data-name="Layer 2"><path d="M16 17.82A6 6 0 0 1 10.11 13a1 1 0 0 1 1-1.15 1 1 0 0 1 1 .83 4 4 0 0 0 7.83 0 1 1 0 0 1 1-.83 1 1 0 0 1 1 1.15A6 6 0 0 1 16 17.82z" fill="#fff" opacity="1" data-original="#fff"></path><path d="M24.9 31H7.1a3 3 0 0 1-3-3.15l.81-17.24a3 3 0 0 1 3-2.87h16.18a3 3 0 0 1 3 2.87l.81 17.24a3 3 0 0 1-3 3.15zM7.91 9.75a1 1 0 0 0-1 1l-.81 17.2a1 1 0 0 0 1 1.05h17.8a1 1 0 0 0 1-1.05l-.81-17.24a1 1 0 0 0-1-1z" fill="#fff" opacity="1" data-original="#fff"></path><path d="M22 8.75h-2V7a4 4 0 0 0-8 0v1.75h-2V7a6 6 0 0 1 12 0z" fill="#fff" opacity="1" data-original="#fff"></path></g></g></svg>
              </div>
              <span className="font-semibold text-[#2f2f2f] text-xs sm:text-sm md:text-base">{t("bag")}</span>
            </div>
            <div className="flex-1 h-0.5 mb-5 bg-gray-300 block"></div>
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full btn-primary flex items-center justify-center font-semibold text-xs sm:text-sm !border-0 pointer-events-none">
                <svg className="w-8 h-8" x="0" y="0" viewBox="0 0 48 48"><g><path d="m47.577 23.114-2.35-7.083c-.61-1.841-2.3-3.031-4.304-3.031h-6.292l.23-1.875a2.795 2.795 0 0 0-.657-2.201A2.779 2.779 0 0 0 32.114 8H7.877c-1.6 0-3.052 1.293-3.237 2.873l-.128 1a1 1 0 0 0 .865 1.119.989.989 0 0 0 1.119-.865l.129-1.011C6.694 10.521 7.279 10 7.877 10h24.237c.24 0 .449.088.59.247a.786.786 0 0 1 .173.632l-2.342 19.122H4.283a.988.988 0 0 0-.86-.992.997.997 0 0 0-1.115.869l-.373 3.007a2.81 2.81 0 0 0 .672 2.203 2.734 2.734 0 0 0 2.076.913h1.936c.015.993.343 1.919.989 2.647.771.872 1.869 1.353 3.089 1.353 2.288 0 4.368-1.765 4.836-4H32.86c.015.993.343 1.918.987 2.646.772.873 1.87 1.354 3.091 1.354 2.287 0 4.367-1.765 4.836-4h2.153c1.618 0 3.04-1.265 3.237-2.878l.768-6.263a8.515 8.515 0 0 0-.354-3.745zM45.432 23h-6.026l.475-3.878c.007-.051.089-.122.13-.122h4.094zm-11.045-8h6.537c1.145 0 2.065.636 2.405 1.661l.113.339h-3.431c-1.057 0-1.985.825-2.114 1.878l-.49 4a1.9 1.9 0 0 0 .453 1.493c.354.399.869.628 1.416.628h6.674a6.774 6.774 0 0 1-.003 1.616l-.415 3.384H32.549l1.837-15zm-1.1 19h-1.228l.245-2h2.614a5.195 5.195 0 0 0-1.631 2zm-3.242 0H15.506a3.97 3.97 0 0 0-.861-1.646c-.118-.133-.256-.239-.388-.354h16.034l-.245 2zM7.037 34H4.682a.754.754 0 0 1-.582-.242.801.801 0 0 1-.181-.635L4.058 32h4.585a5.06 5.06 0 0 0-1.607 2zm6.596 1.378C13.459 36.8 12.114 38 10.696 38c-.64 0-1.204-.241-1.592-.679-.394-.444-.566-1.048-.487-1.699C8.792 34.2 10.137 33 11.555 33c.64 0 1.205.241 1.592.679.394.444.566 1.048.486 1.699zm26.241 0C39.699 36.8 38.354 38 36.937 38c-.64 0-1.205-.241-1.593-.679-.394-.444-.566-1.048-.486-1.699C35.033 34.2 36.378 33 37.795 33c.64 0 1.205.241 1.593.679.394.444.566 1.048.486 1.699zM43.927 34h-2.18a3.97 3.97 0 0 0-.861-1.646c-.118-.133-.256-.239-.388-.354h4.79l-.108.878c-.073.598-.659 1.122-1.253 1.122z" fill="#fff" opacity="1" data-original="#fff"></path><path d="M9.03 26a1 1 0 0 0-1-1H1a1 1 0 1 0 0 2h7.03a1 1 0 0 0 1-1zM4.087 20a1 1 0 1 0 0 2h4.561a1 1 0 1 0 0-2zM2.175 17h8.08a1 1 0 1 0 0-2h-8.08a1 1 0 1 0 0 2z" fill="#fff" opacity="1" data-original="#fff"></path></g></svg>
              </div>
              <span className="font-semibold text-[#2f2f2f] text-xs sm:text-sm md:text-base inline">{t("shippingDetails")}</span>
            </div>
            <div className="flex-1 h-0.5 mb-5 bg-gray-300 block"></div>
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-xs sm:text-sm">
                <svg className="w-8 h-8" x="0" y="0" viewBox="0 0 64 64"><g><path d="M29.396 45.717a6.139 6.139 0 0 0-6.132 6.132c.288 8.116 11.977 8.114 12.264 0a6.139 6.139 0 0 0-6.132-6.132zm0 9.316a3.185 3.185 0 0 1 0-6.369 3.185 3.185 0 0 1 0 6.37zM45.417 45.717a6.139 6.139 0 0 0-6.132 6.132c.288 8.116 11.978 8.113 12.264 0a6.139 6.139 0 0 0-6.132-6.132zm0 9.316a3.185 3.185 0 0 1 0-6.369 3.185 3.185 0 0 1 0 6.37zM58.864 17.826a5.156 5.156 0 0 0-4.046-1.944H17.48l-.886-4.148c-.686-3.285-4.192-5.669-8.335-5.669H5.474a1.474 1.474 0 1 0 0 2.947h2.784c2.71 0 5.054 1.43 5.452 3.331l1.14 5.337 5.172 22.942a5.15 5.15 0 0 0 5.053 4.041h25.59a5.15 5.15 0 0 0 5.053-4.04L59.872 22.2a5.155 5.155 0 0 0-1.008-4.375zm-1.867 3.727-4.153 18.422a2.22 2.22 0 0 1-2.178 1.74H25.075a2.22 2.22 0 0 1-2.178-1.74l-4.766-21.146h36.687a2.246 2.246 0 0 1 2.179 2.724z" fill="#2f2f2f" opacity="1" data-original="#2f2f2f"></path><path d="m42.307 25.255-7.444 6.805-2.208-2.717a1.474 1.474 0 0 0-2.287 1.859l3.192 3.93a1.473 1.473 0 0 0 2.138.158l8.597-7.86a1.473 1.473 0 0 0-1.988-2.175z" fill="#2f2f2f" opacity="1" data-original="#2f2f2f"></path></g></svg>
              </div>
              <span className="font-semibold text-[#2f2f2f] text-xs sm:text-sm md:text-base inline">{t("secureCheckout")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-4 sm:pt-6 md:pt-8 pb-8 sm:pb-10 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* LEFT: ADDRESS */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 xl:p-6">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-300">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{t("addressTitle") || "Address"}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/profile?tab=addresses")}
                  className="btn-primary whitespace-nowrap"
                >
                  + {t("addAddress").toUpperCase?.() ? t("addAddress").toUpperCase() : t("addAddress")}
                </Button>
              </div>

              <div className="pt-3 sm:pt-4 xl:pt-6">
                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6 sm:py-10">
                    <p className="text-sm sm:text-base text-gray-600">{t("noAddressFound")}</p>
                    <Button
                      variant="primary"
                      size="default"
                      onClick={() => router.push("/profile?tab=addresses")}
                      className="mt-3 sm:mt-4"
                    >
                      + {t("addAddress")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {addresses.map((addr) => {
                      const id = addr._id || "";
                      const selected = id && selectedAddressId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => id && selectAddress(id)}
                          className={`w-full text-left border-2 rounded-lg p-3 sm:p-4 border-dashed transition-all ${selected ? "border-[#f3c200] bg-yellow-50" : "border-gray-300 hover:shadow-md"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2 sm:gap-4">
                            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                              <div
                                className={`mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-[#D4AF37]" : "border-gray-300"
                                  }`}
                              >
                                {selected && <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                  <p className="font-bold text-gray-800 text-sm sm:text-base">{addr.name || t("name")}</p>
                                  {addr.tag && (
                                    <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-gray-100 text-gray-700 whitespace-nowrap">
                                      {addr.tag}
                                    </span>
                                  )}
                                  {addr.default && (
                                    <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-[#D4AF37] text-white whitespace-nowrap">
                                      {t("default")}
                                    </span>
                                  )}
                                </div>
                                {(addr.mobileNumber || addr.mobileNumberCode) && (
                                  <p className="text-xs sm:text-sm text-gray-700 mb-1">
                                    {addr.mobileNumberCode ? `+${addr.mobileNumberCode} ` : ""}
                                    {addr.mobileNumber || ""}
                                  </p>
                                )}
                                <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 break-words">
                                  {[addr.flatNumber, addr.addLine1, addr.addLine2, addr.locality]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 break-words">
                                  {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 break-words">
                                  {[addr.emiratesRegionName, addr.country].filter(Boolean).join(", ")}
                                </p>
                                {addr.landmark && (
                                  <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                                    <span className="font-semibold text-gray-700">{t("landmark") || "Landmark"}:</span>{" "}
                                    {addr.landmark}
                                  </p>
                                )}
                              </div>
                            </div>

                            {id && (
                              <span
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  router.push(`/profile?tab=addresses&edit=${id}`);
                                }}
                                className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 mt-1 flex-shrink-0 cursor-pointer"
                              >
                                {t("edit").toUpperCase?.() ? t("edit").toUpperCase() : t("edit")}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER + PAYMENT */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 xl:p-6">
              <div className="pb-3 sm:pb-4 border-b border-gray-300">
                <h2 className="text-sm sm:text-base font-bold text-[#2f2f2f] uppercase">{t("orderDetails")}</h2>
              </div>
              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 px-1 custom-scroll max-h-[260px] overflow-y-auto">
                {cartItems.length === 0 ? (
                  <p className="text-gray-600">{t("cartEmpty")}</p>
                ) : (
                  cartItems.map((item) => {
                    const qty = typeof item.quantity === "object" && item.quantity !== null ? Number(item.quantity.value) || 1 : Number(item.quantity) || 1;
                    const rawPrice =
                      item.accounting?.finalUnitPrice ||
                      item.accounting?.unitPrice ||
                      item.accounting?.subTotal ||
                      item.price ||
                      item.unitPrice ||
                      item.ticketPrice ||
                      0;
                    const unit = Number(rawPrice) || 0;
                    const lineTotal = unit * qty;
                    return (
                      <div key={String(item.addToCartOnId || item._id || item.productId)} className="flex gap-2 sm:gap-3 border-b border-dashed border-gray-300 last:border-b-0 pb-2">
                        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded bg-white overflow-hidden flex-shrink-0">
                          <Image
                            src={getProductImage(item)}
                            alt={item.name || item.productName || "Product"}
                            width={56}
                            height={56}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#2f2f2f] truncate text-xs sm:text-sm">{item.name || item.productName}</p>
                          <p className="text-xs text-[#2f2f2f]">
                            {t("soldBy")} <span className="font-semibold">{item.storeName || item.sellerName || t("unknown")}</span>
                          </p>
                          {item.ticketDetails?.numberOfTicket && (
                            <p className="text-xs text-[#2f2f2f]">
                              {t("totalTicketsCount")} <span className="font-semibold">{item.ticketDetails.numberOfTicket}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-700 mt-1">
                            {qty} x {currency} {formatCurrency(unit)}
                          </p>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-[#2f2f2f] flex-shrink-0">
                          {currency} {formatCurrency(lineTotal)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 xl:p-6">
              <div className="pb-3 sm:pb-4 border-b border-gray-300">
                <h2 className="text-sm sm:text-base font-bold text-gray-800 uppercase">{t("paymentInformation")}</h2>
              </div>
              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">{t("bagTotal")}</span>
                  <span className="font-semibold text-[#2f2f2f]">
                    {currency} {formatCurrency((accounting as any).unitPrice ?? (accounting as any).bagTotal ?? (accounting as any).subTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">{t("subTotal")}</span>
                  <span className="font-semibold text-[#2f2f2f]">
                    {currency} {formatCurrency((accounting as any).taxableAmount ?? (accounting as any).subTotal)}
                  </span>
                </div>

                {hasNamedTax && taxItems ? (
                  taxItems
                    .filter((x) => x.taxName)
                    .map((x, idx) => (
                      <div className="flex justify-between" key={`${x.taxName}-${idx}`}>
                        <span className="text-gray-700">{x.taxName}</span>
                        <span className="font-semibold text-[#2f2f2f]">
                          {currency} {formatCurrency(x.totalValue)}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t("puertoRicoTax")}</span>
                    <span className="font-semibold text-[#2f2f2f]">
                      {currency} {formatCurrency(Array.isArray(tax) ? 0 : (tax as any))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-700">{t("shippingFee")}</span>
                  <span className="font-semibold text-[#2f2f2f]">
                    {shippingFee === 0 ? t("free") : `${currency} ${formatCurrency(shippingFee)}`}
                  </span>
                </div>
              </div>
              <Button
              onClick={handleContinue}
              disabled={!selectedAddressId || cartItems.length === 0 || continuing || loading}
              className="w-full btn-primary text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg transition-colors shadow-lg text-sm md:text-default flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 h-11"
            >
              {(continuing || loading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t("loading") || "Loading..."}</span>
                </>
              ) : (
                <span>{t("continue")}</span>
              )}
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-2 flex-1">
              <p className="text-xs sm:text-sm text-gray-500">{t("totalAmount")}</p>
              <p className="text-lg sm:text-xl font-bold text-[#D4AF37]">
                {currency} {formatCurrency((accounting as any).finalTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


