"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { setCookie } from "cookies-next";

import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { CartService } from "@/src/lib/services/cart";
import { UserAddressService } from "@/src/lib/services/userAddress";

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
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchCart(), fetchAddresses()]);
    setLoading(false);
  };

  const fetchCart = async () => {
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
      console.error("Error fetching cart:", err);
      setCartData(null);
    }
  };

  const fetchAddresses = async () => {
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
      console.error("Error fetching addresses:", err);
      setAddresses([]);
      setSelectedAddressId("");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const selectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    // keep old + new cookie keys in sync
    setCookie("addressid", addressId);
    setCookie("AddressID", addressId);
    setCookie("appyingCheck", "1");
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error(t("selectAddress") || "Please select an address");
      return;
    }
    if (cartItems.length === 0) {
      toast.error(t("cartEmpty") || "Your cart is empty");
      return;
    }
    router.push("/secure-checkout");
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loading") || "Loading..."}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ededed]">
      <Header />

      {/* Progress */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold">1</div>
              <span className="font-semibold text-gray-600">{t("bag")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-[#D4AF37]"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold">2</div>
              <span className="font-semibold text-[#D4AF37]">{t("shippingDetails")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">3</div>
              <span className="font-semibold text-gray-400">{t("secureCheckout")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: ADDRESS */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase">{t("addressTitle") || "Address"}</h2>
                <button
                  onClick={() => router.push("/profile?tab=addresses")}
                  className="text-sm font-semibold text-[#D4AF37] hover:text-[#B8860B]"
                >
                  + {t("addAddress").toUpperCase?.() ? t("addAddress").toUpperCase() : t("addAddress")}
                </button>
              </div>

              <div className="p-6">
                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-600">{t("noAddressFound")}</p>
                    <button
                      onClick={() => router.push("/profile?tab=addresses")}
                      className="mt-4 bg-[#D4AF37] hover:bg-[#B8860B] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      + {t("addAddress")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => {
                      const id = addr._id || "";
                      const selected = id && selectedAddressId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => id && selectAddress(id)}
                          className={`w-full text-left border-2 rounded-lg p-4 transition ${
                            selected ? "border-[#D4AF37] bg-yellow-50" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  selected ? "border-[#D4AF37]" : "border-gray-300"
                                }`}
                              >
                                {selected && <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-800">{addr.name || t("name")}</p>
                                  {addr.tag && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                      {addr.tag}
                                    </span>
                                  )}
                                  {addr.default && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#D4AF37] text-white">
                                      {t("default")}
                                    </span>
                                  )}
                                </div>
                                {(addr.mobileNumber || addr.mobileNumberCode) && (
                                  <p className="text-sm text-gray-700">
                                    {addr.mobileNumberCode ? `+${addr.mobileNumberCode} ` : ""}
                                    {addr.mobileNumber || ""}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 mt-2">
                                  {[addr.flatNumber, addr.addLine1, addr.addLine2, addr.locality]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {[addr.emiratesRegionName, addr.country].filter(Boolean).join(", ")}
                                </p>
                                {addr.landmark && (
                                  <p className="text-xs text-gray-500 mt-2">
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
                                className="text-xs font-semibold text-[#D4AF37] hover:text-[#B8860B] mt-1"
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
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase">{t("orderDetails")}</h2>
              </div>
              <div className="p-6 space-y-4">
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
                      <div key={String(item.addToCartOnId || item._id || item.productId)} className="flex gap-3">
                        <div className="w-14 h-14 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          <Image
                            src={getProductImage(item)}
                            alt={item.name || item.productName || "Product"}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{item.name || item.productName}</p>
                          <p className="text-xs text-gray-600">
                            {t("soldBy")} <span className="font-medium">{item.storeName || item.sellerName || t("unknown")}</span>
                          </p>
                          {item.ticketDetails?.numberOfTicket && (
                            <p className="text-xs text-gray-600">
                              {t("totalTicketsCount")} <span className="font-medium">{item.ticketDetails.numberOfTicket}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-700 mt-1">
                            {qty} x {currency} {formatCurrency(unit)}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                          {currency} {formatCurrency(lineTotal)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase">{t("paymentInformation")}</h2>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">{t("bagTotal")}</span>
                  <span className="font-semibold text-gray-900">
                    {currency} {formatCurrency((accounting as any).unitPrice ?? (accounting as any).bagTotal ?? (accounting as any).subTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">{t("subTotal")}</span>
                  <span className="font-semibold text-gray-900">
                    {currency} {formatCurrency((accounting as any).taxableAmount ?? (accounting as any).subTotal)}
                  </span>
                </div>

                {hasNamedTax && taxItems ? (
                  taxItems
                    .filter((x) => x.taxName)
                    .map((x, idx) => (
                      <div className="flex justify-between" key={`${x.taxName}-${idx}`}>
                        <span className="text-gray-700">{x.taxName}</span>
                        <span className="font-semibold text-gray-900">
                          {currency} {formatCurrency(x.totalValue)}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t("puertoRicoTax")}</span>
                    <span className="font-semibold text-gray-900">
                      {currency} {formatCurrency(Array.isArray(tax) ? 0 : (tax as any))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-700">{t("shippingFee")}</span>
                  <span className="font-semibold text-gray-900">
                    {shippingFee === 0 ? t("free") : `${currency} ${formatCurrency(shippingFee)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">{t("totalAmount")}</p>
              <p className="text-xl font-bold text-[#D4AF37]">
                {currency} {formatCurrency((accounting as any).finalTotal)}
              </p>
            </div>
            <button
              onClick={handleContinue}
              disabled={!selectedAddressId || cartItems.length === 0}
              className="bg-[#D4AF37] hover:bg-[#B8860B] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-10 rounded-lg transition-colors"
            >
              {t("continue")}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


