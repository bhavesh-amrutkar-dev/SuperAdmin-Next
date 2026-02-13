"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getCookie, setCookie } from "cookies-next";

import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { CartService } from "@/src/lib/services/cart";
import { UserAddressService } from "@/src/lib/services/userAddress";
import { PaymentService, type BankDetail } from "@/src/lib/services/payment";
import { OrderService } from "@/src/lib/services/order";
import { AuthService } from "@/src/lib/services/auth";
import PlaceToPayLightbox from "@/src/components/checkout/PlaceToPayLightbox";
import ComingSoonModal from "@/src/components/modals/ComingSoonModal";
import { Copy, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_COUNTRY_CODE, COUNTRY_CODE, BASE_URL } from "@/src/lib/config";
import { getCommonHeaders } from "@/src/lib/api/headers";
import axios from "axios";
import { Button } from "../../components/ui/button";

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
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placeToPayUrl, setPlaceToPayUrl] = useState<string | null>(null);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankDetail | null>(null);
  const [loadingBankDetails, setLoadingBankDetails] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<{
    convertedCurrencySymbol?: string;
    TotalconvertedValue?: number | string;
    to_currency?: string;
  } | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [manualPaymentConfirmed, setManualPaymentConfirmed] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

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
    await Promise.all([fetchCart(), fetchAddresses(), fetchBankDetails()]);
    setLoading(false);
  };

  const fetchBankDetails = async () => {
    try {
      setLoadingBankDetails(true);
      const response = await PaymentService.getBankDetails();
      // Response structure: { data: { bankDetails: [] } } after axios interceptor
      // Old project structure: { data: { data: { bankDetails: [] } } }
      const bankDetailsData = (response as any)?.data?.bankDetails || (response as any)?.data?.data?.bankDetails || [];
      setBankDetails(Array.isArray(bankDetailsData) ? bankDetailsData : []);
    } catch (error) {
      console.warn("Failed to fetch bank details:", error);
      setBankDetails([]);
    } finally {
      setLoadingBankDetails(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await CartService.getCart();
      const data = (response as any)?.data?.data || (response as any)?.data || response;

      // Handle "Data not found" as a valid empty cart response
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
      // Check if error is "Data not found" - this is a valid empty cart state
      const errorMessage = error?.message || error?.response?.data?.message || "";
      const isDataNotFound = errorMessage === "Data not found" ||
        error?.response?.data?.message === "Data not found" ||
        (error?.response?.data && typeof error.response.data === "object" && error.response.data.message === "Data not found");

      if (isDataNotFound) {
        // Silently handle empty cart - this is expected when cart is empty
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

      // Only log actual errors, not empty cart cases
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

  const getMyIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip || "0.0.0.0";
    } catch (error) {
      console.error("Error fetching IP:", error);
      return "0.0.0.0";
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !cartData) {
      return;
    }

    // Show coming soon modal only for ATH Móvil
    if (paymentMethod === "athMovil") {
      setShowComingSoonModal(true);
      return;
    }

    // Validate manual payment
    if (paymentMethod === "manual") {
      if (!selectedBank) {
        alert(t("selectBank") || "Please select a bank");
        return;
      }
      if (!receiptFile || !manualPaymentConfirmed) {
        alert(t("uploadReceipt") || "Please upload proof of payment and confirm");
        return;
      }
    }

    // Check if user is authenticated
    const token = getCookie("access_token");
    let uid = getCookie("uid") as string | undefined;

    // If access_token exists but uid doesn't, try to get user ID from API
    if (token && !uid) {
      try {
        const userResponse = await AuthService.getCurrentUser();
        const userData = (userResponse as any)?.data?.data || (userResponse as any)?.data;
        if (userData?._id || userData?.id || userData?.userId) {
          uid = userData._id || userData.id || userData.userId;
          // Set uid cookie for future use
          if (uid) {
            setCookie("uid", uid, { path: "/", sameSite: "lax" });
          }
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
        // Continue with fallback - API might handle userId internally
      }
    }

    if (!token) {
      router.push("/auth/login");
      return;
    }

    setPlacingOrder(true);

    try {
      // Get cart ID from cartData
      const cartId = (cartData as any)?._id || (cartData as any)?.cartId;
      if (!cartId) {
        throw new Error("Cart ID not found");
      }

      // Get user IP address
      const ipAddress = await getMyIP();

      let onlinePaymentMethod = 18;
      if (paymentMethod === "creditCard") {
        onlinePaymentMethod = 18;
      } else if (paymentMethod === "manual") {
        onlinePaymentMethod = 12;
      }

      // Get address ID
      const addressId = selectedAddress._id || (getCookie("addressid") as string) || (getCookie("AddressID") as string) || "";
      const billingAddressId = billingSameAsShipping ? addressId : addressId;
      const latitude = (getCookie("lat") as string) || "0";
      const longitude = (getCookie("long") as string) || "0";

      const orderImages: string[] = [];
      if (paymentMethod === "manual" && receiptFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.includes(",") ? result.split(",")[1] : result;
            resolve(base64);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(receiptFile);
        const base64Image = await base64Promise;
        orderImages.push(base64Image);
      }

      // Prepare order payload (matching old project structure)
      const orderPayload = {
        cartId: cartId,
        addressId: addressId,
        billingAddressId: billingAddressId,
        coupon: "",
        promoId: "",
        discount: 0,
        latitude: latitude,
        longitude: longitude,
        ipAddress: ipAddress,
        storeType: 8,
        delivery: [],
        orderType: 2,
        extraNote: "",
        tip: 0,
        orderImages: orderImages,
        onlinePaymentMethod: onlinePaymentMethod,
        payByRewardWallet: false,
        cardId: "",
        paymentType: 1,
        payByWallet: false, // Wallet payment not implemented yet
        userId: (uid as string) || "1",
      };

      // Call order API
      const response = await OrderService.placeOrder(orderPayload);
      const orderData = (response as any)?.data?.data || (response as any)?.data || response;

      // Check if order was placed successfully
      if (orderData?.orderId) {
        // Store order ID for later use
        if (typeof window !== "undefined") {
          localStorage.setItem("orderId", orderData.orderId);
          localStorage.setItem("cartId", cartId);
          if (orderData.numberOfFreeTickets) {
            localStorage.setItem("TotalFreeTicket", String(orderData.numberOfFreeTickets));
          }
        }

        // Handle manual payment differently - upload receipt and redirect
        if (paymentMethod === "manual") {
          // Upload receipt file if provided
          if (receiptFile) {
            try {
              // Upload receipt file
              const formData = new FormData();
              formData.append("image", receiptFile);
              formData.append("master_order_id", orderData.orderId);
              const countryCode = (getCookie(COUNTRY_CODE) as string) || DEFAULT_COUNTRY_CODE;
              formData.append("country_code", countryCode);

              // Upload receipt using BASE_URL (matches old project: process.env.NEXT_PUBLIC_BASE_URL + endpoint)
              // Get common headers including authentication token
              const commonHeaders = getCommonHeaders();
              // Remove Content-Type from commonHeaders and let axios set it automatically for FormData
              const { "Content-Type": _, ...headersWithoutContentType } = commonHeaders;
              await axios.post(`${BASE_URL}validate/payment/receipt/`, formData, {
                headers: {
                  ...headersWithoutContentType,
                  // Don't set Content-Type manually - axios will set it with boundary for multipart/form-data
                },
              });

              // Redirect to thank-you page after successful upload
              router.push("/thank-you");
              return;
            } catch (uploadError: any) {
              console.warn("Receipt upload failed, but order was placed:", uploadError);
              // Even if upload fails, redirect to thank-you since order is placed
              router.push("/thank-you");
              return;
            }
          } else {
            // Manual payment without receipt - still redirect to thank-you
            router.push("/thank-you");
            return;
          }
        }

        // For other payment methods, check for checkout URL
        if (orderData?.checkoutProcessUrl) {
          // Open Place to Pay lightbox
          setPlaceToPayUrl(orderData.checkoutProcessUrl);
        } else if (paymentMethod !== "manual") {
          // Only throw error for non-manual payments if no checkout URL
          throw new Error(orderData?.message || "Failed to get checkout URL");
        } else {
          // Manual payment without receipt - still redirect to thank-you
          router.push("/thank-you");
        }
      } else {
        throw new Error(orderData?.message || "Failed to place order");
      }
    } catch (error: any) {
      // Extract error message from various possible locations
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        error?.data?.message ||
        (typeof error === "string" ? error : null) ||
        "Failed to place order. Please try again.";

      console.warn("Error placing order:", {
        message: errorMessage,
        error: error,
        status: error?.status || error?.response?.status,
        data: error?.response?.data || error?.data,
      });

      // Show error message to user
      alert(errorMessage);
      setPlacingOrder(false);
    }
  };

  const handlePlaceToPaySuccess = () => {
    setPlaceToPayUrl(null);
    setPlacingOrder(false);
    router.push("/thank-you");
  };

  const handlePlaceToPayError = () => {
    setPlaceToPayUrl(null);
    setPlacingOrder(false);
    // Optionally show error message
  };

  const handlePlaceToPayClose = () => {
    setPlaceToPayUrl(null);
    setPlacingOrder(false);
  };

  const handleManualPaymentSelect = () => {
    setPaymentMethod("manual");
    setShowBankDetails(true);
    setSelectedBank(null);
    setReceiptImage(null);
    setReceiptFile(null);
    setManualPaymentConfirmed(false);
    setConvertedAmount(null);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method !== "manual") {
      setShowBankDetails(false);
      setSelectedBank(null);
      setReceiptImage(null);
      setReceiptFile(null);
      setManualPaymentConfirmed(false);
      setConvertedAmount(null);
    } else {
      setShowBankDetails(true);
    }
  };

  const handleBankSelect = async (bank: BankDetail) => {
    setSelectedBank(bank);
    if (bank.acceptedCurrencyCode && grandTotal > 0) {
      try {
        const response = await PaymentService.getCurrencyConvert(bank.acceptedCurrencyCode, grandTotal);
        const data = (response as any)?.data?.data;
        if (data) {
          setConvertedAmount(data);
        }
      } catch (error) {
        console.warn("Failed to convert currency:", error);
      }
    }
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/png" || file.type === "image/jpg") {
        const url = URL.createObjectURL(file);
        setReceiptImage(url);
        setReceiptFile(file);
        setManualPaymentConfirmed(false);
      } else {
        toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      }
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("codeCopyMsg") || "Copied to clipboard!");
  };

  const handleManualPaymentConfirm = () => {
    if (!selectedBank || !receiptFile) {
      toast.error("Please select a bank and upload proof of payment");
      return;
    }
    setManualPaymentConfirmed(true);
  };

  const shippingFee = Number((accounting as any).deliveryFee ?? (accounting as any).shippingFee ?? 0);
  const tax = accounting.tax;
  const taxItems = Array.isArray(tax) ? (tax as TaxItem[]) : null;
  const hasNamedTax = !!taxItems?.some((x) => x.taxName && x.taxName.length > 0);

  // Calculate bagTotal from individual items to ensure accuracy
  const calculatedBagTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const qty = typeof item.quantity === "object" ? item.quantity?.value || 1 : item.quantity || 1;
      const itemTotal = item.accounting?.subTotal
        ? Number(item.accounting.subTotal)
        : item.accounting?.finalUnitPrice
          ? Number(item.accounting.finalUnitPrice) * qty
          : Number(item.price ?? item.unitPrice ?? item.ticketPrice ?? item.accounting?.unitPrice ?? 0) * qty;
      return sum + itemTotal;
    }, 0);
  }, [cartItems]);

  // Use calculated total if available, otherwise fallback to API values
  const bagTotal = calculatedBagTotal > 0 ? calculatedBagTotal : Number(accounting.bagTotal ?? accounting.subTotal ?? 0);
  const subTotal = bagTotal;
  const taxAmount = hasNamedTax
    ? taxItems!.reduce((sum, item) => sum + Number(item.totalValue || 0), 0)
    : Number(tax || 0);
  const grandTotal = Number(accounting.finalTotal ?? accounting.grandTotal ?? bagTotal + taxAmount + shippingFee);

  const billingAddress = billingSameAsShipping ? selectedAddress : selectedAddress;

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
        <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 text-center">
            <p className="text-sm sm:text-base text-gray-600">{t("cartEmpty") || "Your cart is empty"}</p>
            <Button
              onClick={() => router.push("/cart")}
              variant="primary"
              size="default"
              className="mt-3 sm:mt-4 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              {t("backToCart") || "Back to Cart"}
            </Button>
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
      <div className="bg-white border-b border-gray-200 py-3 sm:py-4">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-xs sm:text-sm">1</div>
              <span className="font-semibold text-gray-600 text-xs sm:text-sm hidden sm:inline">{t("bag")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-[#D4AF37] hidden sm:block"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-xs sm:text-sm">2</div>
              <span className="font-semibold text-gray-600 text-xs sm:text-sm hidden md:inline">{t("shippingDetails")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-[#D4AF37] hidden sm:block"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-xs sm:text-sm">3</div>
              <span className="font-semibold text-[#D4AF37] text-xs sm:text-sm">{t("secureCheckout")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8 pb-24 sm:pb-28 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* SHIPPING INFORMATION */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-xs sm:text-sm font-bold text-gray-800 uppercase">{t("shippingInformation")}</h2>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                {selectedAddress ? (
                  <div>
                    {selectedAddress.name && (
                      <p className="text-xs sm:text-sm text-gray-800 mb-1 break-words">
                        <span className="font-semibold">{t("name")}:</span> {selectedAddress.name}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-800 mb-1 break-words">
                      <span className="font-semibold">{t("address")}:</span> {formatAddress(selectedAddress)}.
                    </p>
                    {selectedAddress.mobileNumber && (
                      <p className="text-xs sm:text-sm text-gray-800 mb-3 break-words">
                        <span className="font-semibold">{t("phoneNumber")}:</span>{" "}
                        {selectedAddress.mobileNumberCode && `+${selectedAddress.mobileNumberCode} `}
                        {selectedAddress.mobileNumber}
                      </p>
                    )}
                    <button onClick={handleEditShipping} className="text-xs sm:text-sm text-[#D4AF37] hover:text-[#B8860B] font-medium cursor-pointer">
                      {t("edit")}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600">{t("noAddressFound")}</p>
                )}
              </div>
            </div>

            {/* BILLING INFORMATION */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-xs sm:text-sm font-bold text-gray-800 uppercase">{t("billingInformation")}</h2>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                <label className="flex items-center gap-2 mb-3 sm:mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                    className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37] flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-800">{t("sameAsDeliveryAddress")}</span>
                </label>
                {billingAddress && (
                  <div>
                    {billingAddress.name && (
                      <p className="text-xs sm:text-sm text-gray-800 mb-1 break-words">
                        <span className="font-semibold">{t("name")}:</span> {billingAddress.name}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-800 mb-1 break-words">
                      <span className="font-semibold">{t("address")}:</span> {formatAddress(billingAddress)}.
                    </p>
                    {billingAddress.mobileNumber && (
                      <p className="text-xs sm:text-sm text-gray-800 break-words">
                        <span className="font-semibold">{t("phoneNumber")}:</span>{" "}
                        {billingAddress.mobileNumberCode && `+${billingAddress.mobileNumberCode} `}
                        {billingAddress.mobileNumber}
                      </p>
                    )}
                    {!billingSameAsShipping && (
                      <button onClick={handleEditBilling} className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#D4AF37] hover:text-[#B8860B] font-medium cursor-pointer">
                        {t("edit")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-xs sm:text-sm font-bold text-gray-800 uppercase">{t("paymentMethod")}</h2>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                {/* Payment Options */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  {/* ATH Móvil button hidden */}
                  <label className="hidden flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="athMovil"
                      checked={paymentMethod === "athMovil"}
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                      disabled={grandTotal <= 0}
                      className="sr-only"
                    />
                    <div
                      className={`px-3 sm:px-4 py-2 border-2 rounded-lg transition-all ${paymentMethod === "athMovil"
                        ? "border-[#D4AF37] border-dashed bg-yellow-50"
                        : "border-gray-300 hover:border-gray-400"
                        } ${(grandTotal <= 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="text-xs sm:text-sm text-gray-800 font-medium">{t("payWithATHMovil")}</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === "creditCard"}
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                      disabled={grandTotal <= 0}
                      className="sr-only"
                    />
                    <div
                      className={`px-3 sm:px-4 py-2 border-2 rounded-lg transition-all ${paymentMethod === "creditCard"
                        ? "border-[#D4AF37] border-dashed bg-yellow-50"
                        : "border-gray-300 hover:border-gray-400"
                        } ${(grandTotal <= 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-800 font-medium">{t("payWithCreditCard")}</span>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Image
                            src="/images/Profile_new/visa.svg"
                            alt="VISA"
                            width={40}
                            height={25}
                            className="h-4 sm:h-5 w-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <Image
                            src="/images/Profile_new/mastercard.svg"
                            alt="Mastercard"
                            width={40}
                            height={25}
                            className="h-4 sm:h-5 w-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <Image
                            src="/images/Profile_new/ath.jpg"
                            alt="ATH"
                            width={40}
                            height={25}
                            className="h-4 sm:h-5 w-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <Image
                            src="/images/Profile_new/amex.jpg"
                            alt="AMEX"
                            width={40}
                            height={25}
                            className="h-4 sm:h-5 w-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
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
                      onChange={handleManualPaymentSelect}
                      disabled={grandTotal <= 0}
                      className="sr-only"
                    />
                    <div
                      className={`px-3 sm:px-4 py-2 border-2 rounded-lg transition-all ${paymentMethod === "manual"
                        ? "border-[#D4AF37] border-dashed bg-yellow-50"
                        : "border-gray-300 hover:border-gray-400"
                        } ${(grandTotal <= 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="text-xs sm:text-sm text-gray-800 font-medium">{t("manualPaymentMethods")}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Manual Payment Bank Details Section */}
            {paymentMethod === "manual" && (
              <div className="mt-4 bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-4">{t("manualPaymentMethods")}</h3>

                {/* Loading State */}
                {loadingBankDetails && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">{t("loading") || "Loading..."}</p>
                  </div>
                )}

                {/* Bank Selection */}
                {!loadingBankDetails && bankDetails.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-3">{t("selectBank") || "Select a bank:"}</p>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {bankDetails.map((bank) => (
                        <div
                          key={bank._id}
                          onClick={() => handleBankSelect(bank)}
                          className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all ${selectedBank?._id === bank._id
                            ? "border-[#D4AF37] bg-yellow-50"
                            : "border-gray-300 hover:border-gray-400"
                            }`}
                        >
                          {bank.paymentMethodLogo && (
                            <img
                              src={bank.paymentMethodLogo}
                              alt={bank.bankName || "Bank"}
                              className="w-16 h-12 object-contain"
                            />
                          )}
                          {selectedBank?._id === bank._id && (
                            <div className="absolute -top-2 -right-2 bg-[#D4AF37] rounded-full p-1">
                              <Check className="w-3 h-3 text-gray-800" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Banks Available */}
                {!loadingBankDetails && bankDetails.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">{t("noBanksAvailable") || "No banks available for manual payment"}</p>
                  </div>
                )}

                {/* Bank Details */}
                {!loadingBankDetails && selectedBank && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3">{selectedBank.bankName}</h4>

                      {selectedBank.bankPaymentNumber ? (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">{t("accountNumber") || "Account Number"}:</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm sm:text-base font-semibold text-gray-800">{selectedBank.bankPaymentNumber}</p>
                            <button
                              onClick={() => handleCopyToClipboard(selectedBank.bankPaymentNumber || "")}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={t("copy") || "Copy"}
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      ) : selectedBank.bankPaymentURL ? (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">{t("paymentURL") || "Payment URL"}:</p>
                          <a
                            href={selectedBank.bankPaymentURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm sm:text-base text-[#D4AF37] hover:underline break-words"
                          >
                            {selectedBank.bankPaymentURL}
                          </a>
                        </div>
                      ) : null}

                      {selectedBank.accountHolderID && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">{t("ID") || "ID"}:</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm sm:text-base font-semibold text-gray-800">{selectedBank.accountHolderID}</p>
                            <button
                              onClick={() => handleCopyToClipboard(selectedBank.accountHolderID || "")}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={t("copy") || "Copy"}
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedBank.accountHolderName && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">{t("Holder") || "Account Holder"}:</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-800">{selectedBank.accountHolderName}</p>
                        </div>
                      )}

                      {convertedAmount && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-600 mb-1">{t("Total") || "Total"}:</p>
                          <p className="text-base sm:text-lg font-bold text-[#D4AF37] bg-yellow-50 px-3 py-1 rounded inline-block">
                            {convertedAmount.convertedCurrencySymbol}
                            {Number(convertedAmount.TotalconvertedValue || 0).toFixed(2)} {convertedAmount.to_currency}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Receipt Upload */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                        {t("ProofOfPayment") || "Proof of Payment"}
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                        <input
                          type="file"
                          id="receiptUpload"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleReceiptUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {!receiptImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-xs sm:text-sm text-gray-600">{t("PHOTOSCREENSHOT") || "Upload Photo/Screenshot"}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <img
                              src={receiptImage}
                              alt="Receipt"
                              className="max-w-full max-h-64 mx-auto rounded object-contain"
                            />
                            <button
                              onClick={() => {
                                setReceiptImage(null);
                                setReceiptFile(null);
                                setManualPaymentConfirmed(false);
                              }}
                              className="text-xs text-red-600 hover:underline"
                            >
                              {t("remove") || "Remove"}
                            </button>
                          </div>
                        )}
                      </div>
                      {receiptFile && !manualPaymentConfirmed && (
                        <Button
                          variant="primary"
                          size="default"
                          onClick={handleManualPaymentConfirm}
                          className="mt-4 w-full px-4 py-2 text-gray-800 font-semibold rounded transition-colors"
                        >
                          {t("confirm") || "Confirm"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md lg:sticky lg:top-4">
              {/* ORDER DETAILS */}
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-xs sm:text-sm font-bold text-gray-800 uppercase">{t("orderDetails")}</h2>
              </div>
              <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                {cartItems.map((item, idx) => {
                  const qty = typeof item.quantity === "object" ? item.quantity?.value || 1 : item.quantity || 1;
                  // Use accounting.finalUnitPrice or accounting.subTotal if available, otherwise calculate from unit price
                  const itemTotal = item.accounting?.subTotal
                    ? Number(item.accounting.subTotal)
                    : item.accounting?.finalUnitPrice
                      ? Number(item.accounting.finalUnitPrice) * qty
                      : Number(item.price ?? item.unitPrice ?? item.ticketPrice ?? item.accounting?.unitPrice ?? 0) * qty;

                  const unitPrice = item.accounting?.finalUnitPrice
                    ? Number(item.accounting.finalUnitPrice)
                    : item.accounting?.unitPrice
                      ? Number(item.accounting.unitPrice)
                      : Number(item.price ?? item.unitPrice ?? item.ticketPrice ?? 0);

                  const ticketCount = item.ticketCount || item.ticketDetails?.numberOfTicket || 0;
                  const sellerName = item.sellerName || item.storeName || "Unknown";

                  return (
                    <div key={idx} className="flex gap-2 sm:gap-3 md:gap-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0">
                        <Image src={getProductImage(item)} alt={item.name || item.productName || "Product"} width={80} height={80} className="rounded object-cover w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1 line-clamp-2">{item.name || item.productName || "Product"}</p>
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
                            {qty} x {currency} {formatCurrency(unitPrice)}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-800">{currency} {formatCurrency(itemTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAYMENT INFORMATION */}
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200">
                <h2 className="text-xs sm:text-sm font-bold text-gray-800 uppercase mb-3 sm:mb-4">{t("paymentInformation")}</h2>
                <div className="space-y-2 text-xs sm:text-sm">
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
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 flex-1">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[10px] sm:text-xs text-gray-600">{t("taxInfoMessage")}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 sm:gap-6">
              <div className="text-right">
                <p className="text-[10px] sm:text-xs text-gray-500">{t("totalAmount")}</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">{currency} {formatCurrency(grandTotal)}</p>
              </div>
              {paymentMethod !== "" && (
                <Button
                  onClick={handlePlaceOrder}
                  variant="primary"
                  size="default"
                  disabled={!selectedAddress || placingOrder}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 rounded-lg transition-colors text-xs sm:text-sm md:text-default whitespace-nowrap w-full sm:w-auto"
                >
                  {placingOrder
                    ? t("placingOrder") || "Placing Order..."
                    : paymentMethod === "manual"
                      ? t("placeOrder") || "PLACE ORDER"
                      : paymentMethod === "athMovil"
                        ? t("payWithATHMovil") || "PAY WITH ATH MÓVIL"
                        : paymentMethod === "creditCard"
                          ? t("payWithPlaceToPay") || "PAY WITH PLACE TO PAY"
                          : t("pay") || "PAY"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Place to Pay Lightbox */}
      {placeToPayUrl && (
        <PlaceToPayLightbox
          url={placeToPayUrl}
          onSuccess={handlePlaceToPaySuccess}
          onError={handlePlaceToPayError}
          onClose={handlePlaceToPayClose}
        />
      )}

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        paymentMethod={paymentMethod}
      />

      <Footer />
    </div>
  );
}

