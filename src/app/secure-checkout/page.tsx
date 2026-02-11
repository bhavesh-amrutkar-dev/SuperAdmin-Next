"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";

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
    grandTotal?: number | string;
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
  tag?: string;
};

function formatCurrency(value: number | string | undefined): string {
  return (Number(value) || 0).toFixed(2);
}

function getProductImage(item: CartItem): string {
  const imagesObj = item.images && typeof item.images === "object" && !Array.isArray(item.images) ? item.images : null;
  if (imagesObj?.large) return imagesObj.large;
  if (imagesObj?.medium) return imagesObj.medium;
  if (imagesObj?.small) return imagesObj.small;
  if (item.productImage) return item.productImage;
  if (item.image) return item.image;
  return "/placeholder-product.png";
}

function formatAddress(address: UserAddress): string {
  const parts: string[] = [];
  if (address.flatNumber) parts.push(address.flatNumber);
  if (address.addLine1) parts.push(address.addLine1);
  if (address.addLine2) parts.push(address.addLine2);
  if (address.locality) parts.push(address.locality);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.pincode) parts.push(address.pincode);
  if (address.emiratesRegionName) parts.push(address.emiratesRegionName);
  if (address.country) parts.push(address.country);
  return parts.join(", ");
}

export default function SecureCheckoutPage() {
  const t = useTranslations();
  const router = useRouter();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("athMovil");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Get selected address from cookie
    const addressId = getCookie("addressid") || getCookie("AddressID");
    if (addressId && addresses.length > 0) {
      const addr = addresses.find((a) => a._id === addressId);
      if (addr) {
        setSelectedAddress(addr);
      } else if (addresses.length > 0) {
        // Use default address if selected not found
        const defaultAddr = addresses.find((a) => a.default) || addresses[0];
        setSelectedAddress(defaultAddr);
      }
    } else if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.default) || addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [addresses]);

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
          accounting: {
            bagTotal: 0,
            subTotal: 0,
            tax: 0,
            deliveryFee: 0,
            finalTotal: 0,
          },
        });
        return;
      }

      setCartData(data as CartData);
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      setCartData({
        sellers: [],
        accounting: {
          bagTotal: 0,
          subTotal: 0,
          tax: 0,
          deliveryFee: 0,
          finalTotal: 0,
        },
      });
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await UserAddressService.getAddresses();
      const addressData = (response as any)?.data?.data || (response as any)?.data || [];
      setAddresses(Array.isArray(addressData) ? addressData : []);
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    }
  };

  const handleEditShipping = () => {
    router.push("/shipping-address");
  };

  const handleEditBilling = () => {
    router.push("/shipping-address");
  };

  const handleContinue = () => {
    if (!selectedAddress) {
      return;
    }
    // TODO: Implement payment processing
  };

  const shippingFee = Number((accounting as any).deliveryFee ?? (accounting as any).shippingFee ?? 0);
  const tax = accounting.tax;
  const taxItems = Array.isArray(tax) ? (tax as TaxItem[]) : null;
  const hasNamedTax = !!taxItems?.some((x) => x.taxName && x.taxName.length > 0);
  const bagTotal = Number(accounting.bagTotal ?? accounting.subTotal ?? 0);
  const subTotal = Number(accounting.subTotal ?? bagTotal);
  const taxAmount = hasNamedTax
    ? taxItems!.reduce((sum, item) => sum + Number(item.totalValue || 0), 0)
    : Number(tax || 0);
  const grandTotal = Number(accounting.finalTotal ?? accounting.grandTotal ?? bagTotal + taxAmount + shippingFee);

  const billingAddress = billingSameAsShipping ? selectedAddress : selectedAddress; // For now, same as shipping

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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#ededed]">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">{t("cartEmpty") || "Your cart is empty"}</p>
            <button
              onClick={() => router.push("/cart")}
              className="mt-4 bg-[#D4AF37] hover:bg-[#B8860B] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {t("backToCart") || "Back to Cart"}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ededed]">
      <Header />

      {/* Progress Stepper */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-sm">1</div>
              <span className="font-semibold text-gray-600 text-sm">{t("bag")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-[#D4AF37]"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-sm">2</div>
              <span className="font-semibold text-gray-600 text-sm">{t("shippingDetails")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-[#D4AF37]"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-sm">3</div>
              <span className="font-semibold text-[#D4AF37] text-sm">{t("secureCheckout")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* SHIPPING INFORMATION */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase">{t("shippingInformation")}</h2>
              </div>
              <div className="p-6">
                {selectedAddress ? (
                  <div>
                    {selectedAddress.name && (
                      <p className="text-sm text-gray-800 mb-1">
                        <span className="font-semibold">{t("name")}:</span> {selectedAddress.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-800 mb-1">
                      <span className="font-semibold">{t("address")}:</span> {formatAddress(selectedAddress)}.
                    </p>
                    {selectedAddress.mobileNumber && (
                      <p className="text-sm text-gray-800 mb-3">
                        <span className="font-semibold">{t("phoneNumber")}:</span>{" "}
                        {selectedAddress.mobileNumberCode && `+${selectedAddress.mobileNumberCode} `}
                        {selectedAddress.mobileNumber}
                      </p>
                    )}
                    <button onClick={handleEditShipping} className="text-sm text-[#D4AF37] hover:text-[#B8860B] font-medium">
                      {t("edit")}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{t("noAddressFound")}</p>
                )}
              </div>
            </div>

            {/* BILLING INFORMATION */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase">{t("billingInformation")}</h2>
              </div>
              <div className="p-6">
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                    className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                  />
                  <span className="text-sm text-gray-800">{t("sameAsDeliveryAddress")}</span>
                </label>
                {billingAddress && (
                  <div>
                    {billingAddress.name && (
                      <p className="text-sm text-gray-800 mb-1">
                        <span className="font-semibold">{t("name")}:</span> {billingAddress.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-800 mb-1">
                      <span className="font-semibold">{t("address")}:</span> {formatAddress(billingAddress)}.
                    </p>
                    {billingAddress.mobileNumber && (
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{t("phoneNumber")}:</span>{" "}
                        {billingAddress.mobileNumberCode && `+${billingAddress.mobileNumberCode} `}
                        {billingAddress.mobileNumber}
                      </p>
                    )}
                    {!billingSameAsShipping && (
                      <button onClick={handleEditBilling} className="mt-3 text-sm text-[#D4AF37] hover:text-[#B8860B] font-medium">
                        {t("edit")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase">{t("paymentMethod")}</h2>
              </div>
              <div className="p-6">
                {/* Payment Options */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="athMovil"
                      checked={paymentMethod === "athMovil"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`px-4 py-2 border-2 rounded-lg transition-all ${paymentMethod === "athMovil"
                        ? "border-[#D4AF37] border-dashed bg-yellow-50"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      <span className="text-sm text-gray-800 font-medium">{t("payWithATHMovil")}</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === "creditCard"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`px-4 py-2 border-2 rounded-lg transition-all ${paymentMethod === "creditCard"
                        ? "border-[#D4AF37] border-dashed bg-yellow-50"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800 font-medium">{t("payWithCreditCard")}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-semibold">VISA</span>
                          <span className="text-xs text-gray-500 font-semibold">Mastercard</span>
                          <span className="text-xs text-gray-500 font-semibold">ATH</span>
                          <span className="text-xs text-gray-500 font-semibold">AMEX</span>
                        </div>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="manual"
                      checked={paymentMethod === "manual"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`px-4 py-2 border-2 rounded-lg transition-all ${paymentMethod === "manual"
                        ? "border-[#D4AF37] border-dashed bg-yellow-50"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      <span className="text-sm text-gray-800 font-medium">{t("manualPaymentMethods")}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-4">
              {/* ORDER DETAILS */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase">{t("orderDetails")}</h2>
              </div>
              <div className="p-6 space-y-4">
                {cartItems.map((item, idx) => {
                  const qty = typeof item.quantity === "object" ? item.quantity?.value || 1 : item.quantity || 1;
                  const price = Number(item.price ?? item.unitPrice ?? item.ticketPrice ?? item.accounting?.unitPrice ?? 0);
                  const totalPrice = price * qty;
                  const ticketCount = item.ticketCount || item.ticketDetails?.numberOfTicket || 0;
                  const sellerName = item.sellerName || item.storeName || "Unknown";

                  return (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0">
                        <Image src={getProductImage(item)} alt={item.name || item.productName || "Product"} width={80} height={80} className="rounded object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">{item.name || item.productName || "Product"}</p>
                        <p className="text-xs text-gray-600 mb-1">
                          {t("soldBy")}: <span className="text-[#D4AF37]">{sellerName}</span>
                        </p>
                        {ticketCount > 0 && (
                          <p className="text-xs text-gray-600 mb-1">
                            {t("totalTicketsCount")}: {ticketCount}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-600">
                            {qty} x {currency} {formatCurrency(price)}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{currency} {formatCurrency(totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAYMENT INFORMATION */}
              <div className="px-6 py-4 border-t border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase mb-4">{t("paymentInformation")}</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("bagTotal")}:</span>
                    <span className="text-gray-800">{currency} {formatCurrency(bagTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("subTotal")}:</span>
                    <span className="text-gray-800">{currency} {formatCurrency(subTotal)}</span>
                  </div>
                  {hasNamedTax && taxItems ? (
                    taxItems.map((taxItem, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-600">{taxItem.taxName || t("tax")}:</span>
                        <span className="text-gray-800">{currency} {formatCurrency(taxItem.totalValue)}</span>
                      </div>
                    ))
                  ) : taxAmount > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("tax")}:</span>
                      <span className="text-gray-800">{currency} {formatCurrency(taxAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("shippingFee")}:</span>
                    <span className="text-gray-800">{shippingFee > 0 ? `${currency} ${formatCurrency(shippingFee)}` : t("free")}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                    <span className="font-bold text-gray-800">{t("grandTotal")}:</span>
                    <span className="font-bold text-gray-800">{currency} {formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-600">{t("taxInfoMessage")}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">{t("totalAmount")}</p>
                <p className="text-lg font-bold text-gray-800">{currency} {formatCurrency(grandTotal)}</p>
              </div>
              <button
                onClick={handleContinue}
                disabled={!selectedAddress}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                {t("continue")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

