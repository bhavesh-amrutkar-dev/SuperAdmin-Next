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
import { AuthService } from "@/src/lib/services/auth";
import PlaceToPayLightbox from "@/src/components/checkout/PlaceToPayLightbox";
import ComingSoonModal from "@/src/components/modals/ComingSoonModal";
import { Copy, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_COUNTRY_CODE, COUNTRY_CODE, BASE_URL, ENABLE_PLACE_TO_PAY } from "@/src/lib/config";
import { getCommonHeaders } from "@/src/lib/api/headers";
import axios from "axios";
import { Button } from "../../components/ui/button";
import Loader from "@/src/components/loader";
import AthMovilPayment from "@/src/components/payments/AuthMovilPayment";
import { ConfirmationModal } from "@/src/components/ui/confirmationModal";
import { getMyIP } from "@/src/lib/utils/getIp";
import AthMovilCheckout from "@/src/components/checkout/authMovilCheckout";
import PlaceToPayPopup from "@/src/components/checkout/PlaceToPayPopup";
import Script from "next/script";
import SquarePayment from "@/src/components/payments/SquarePayment";
import SquareScript from "@/src/components/payments/SqaureScript";
import { getSquareErrorMessage } from "@/src/lib/config/squareEnum";

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
  const [athResponses, setAthResponses] = useState<string[]>([]);
  const [isLoadingAth, setIsLoadingAth] = useState(false);
  const [squareOrderId, setSquareOrderId] = useState<string | null>(null);
  const [showSquarePayment, setShowSquarePayment] = useState(false);
  const currency = cartData?.currencySymbol || "$";
  const accounting = cartData?.accounting || {};
  const [athOrderId, setAthOrderId] = useState<string | null>(null);
  const [athToken, setAthToken] = useState<string | null>(null);
  const [isAthReady, setIsAthReady] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0)
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({
    title: "",
    message: "",
  });
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Removed initial ATH SDK load to prevent ReferenceErrors
  // It will be loaded conditionally in AuthMovilPayment.tsx

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
      console.warn("Error fetching cart:", error);
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
  const handleSquareSuccess = () => {
    toast.success(
      t("paymentSuccess") || "Payment Successful",
      {
        description:
          t("redirecting") || "Redirecting to order confirmation...",
      }
    );

    setTimeout(() => {
      router.push("/thank-you?payment=square");
    }, 1200);
  };

  const handleSquareError = (err: any) => {
    console.warn("Square payment failed:", err);

    const message = getSquareErrorMessage(err, t);

    toast.error(
      t("paymentErrorTitle") || "Payment Failed",
      {
        description: message,
      }
    );

    fetchCart();
    setShowSquarePayment(false);
  };
  const fetchAddresses = async () => {
    try {
      const response = await UserAddressService.getAddresses();
      const addressData = (response as any)?.data?.data || (response as any)?.data || [];
      setAddresses(Array.isArray(addressData) ? addressData : []);
    } catch (error: any) {
      console.warn("Error fetching addresses:", error);
      setAddresses([]);
    }
  };
  const addAthResponse = (res: any) => {
    setAthResponses((prev) => [...prev, typeof res === "string" ? res : JSON.stringify(res)]);
  };
  const cancelATHM = async () => {
    try {
      const responseCancel = await (window as any).findPaymentATHM?.();
      if (!responseCancel) {
        addAthResponse("Payment cancelled (no response).");
        return;
      }
      addAthResponse(responseCancel);
    } catch (err) {
      console.warn(err);
      addAthResponse("Error cancelling payment");
    }
  };

  const authorizationATHM = async () => {
    try {
      const responseAuth = await (window as any).authorization?.();
      addAthResponse(responseAuth);

      if (responseAuth?.ecommerceStatus === "COMPLETED") {
        router.push("/thank-you?payment=athmovil");
      }
    } catch (err) {
      console.warn(err);
      addAthResponse("Error authorizing payment");
    }
  };

  const expiredATHM = async () => {
    try {
      const responseExpired = await (window as any).findPaymentATHM?.();
      addAthResponse(responseExpired);
    } catch (err) {
      console.warn(err);
      addAthResponse("Error: payment expired");
    }
  };

  const handleEditShipping = () => {
    router.push("/shipping-address");
  };

  const handleEditBilling = () => {
    router.push("/shipping-address");
  };


  const handleAthSuccess = async () => {
    if (!athOrderId) return;
    // console.log("Ath movil payment success log from handleAth success")
    try {
      setPlacingOrder(false);

      fetch("/api/orders/status-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: athOrderId,
          paymentMethod: 10,
        }),
      });

      router.push("/thank-you?payment=athmovil");
    } catch (error: any) {
      console.warn("ATH Móvil success handler error:", error);

      setModalConfig({
        title: t("athPaymentConfirmationError"),
        message: t("athPaymentConfirmationErrorDescription"),
        confirmText: t("tryAgain"),
        cancelText: t("close"),
        onConfirm: () => {
          setConfirmOpen(false);
        },
      });

      setConfirmOpen(true);
    } finally {
      fetchCart()
      setPlacingOrder(false);
    }
  };

  const handleAthCancel = async () => {
    if (!athOrderId) return;

    // 1️⃣ Immediate UI response
    setIsAthReady(false);
    setPlacingOrder(false);

    setModalConfig({
      title: t("paymentCancelled"),
      message: t("paymentCancelledDescription"),
      confirmText: t("retryPayment"),
      cancelText: t("chooseAnotherMethod"),
      onConfirm: () => {
        setConfirmOpen(false);
      },
    });

    setConfirmOpen(true);

    // 2️⃣ Background backend update (non-blocking)
    fetch("/api/orders/status-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: athOrderId,
        paymentMethod: 10,
      }),
    }).catch((error) => {
      console.warn("ATH cancel background update failed:", error);
    });
    fetchCart()
  };
  const handleAuthMovil = async () => {
    try {
      if (!selectedAddress) return;

      setPlacingOrder(true);
      // const freshCartResponse = await CartService.getCart();

      // const freshCartData =
      //   (freshCartResponse as any)?.data?.data ||
      //   (freshCartResponse as any)?.data ||
      //   freshCartResponse;

      // const cartId =
      //   (freshCartData as any)?._id ||
      //   (freshCartData as any)?.cartId;
      const cartId = (cartData as any)?._id;
      if (!cartId) {
        console.warn("❌ Cart ID not found");
        throw new Error("Cart ID not found");
      }

      const addressId =
        selectedAddress?._id ||
        (getCookie("addressid") as string) ||
        "";

      const uid = getCookie("uid") as string;
      const latitude = (getCookie("lat") as string) || "0";
      const longitude = (getCookie("long") as string) || "0";
      const ipAddress = await getMyIP();


      const orderPayload = {
        cartId,
        addressId,
        billingAddressId: addressId,
        coupon: "",
        promoId: "",
        discount: 0,
        latitude,
        longitude,
        ipAddress,
        storeType: 8,
        delivery: [],
        orderType: 2,
        extraNote: "",
        tip: 0,
        orderImages: [],
        onlinePaymentMethod: 10,
        payByRewardWallet: false,
        cardId: "",
        paymentType: 1,
        payByWallet: false,
        userId: uid || "1",
      };
      // 1️⃣ Create order (your existing logic)
      const response = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Order creation failed");
      }

      const createdOrder = await response.json();
      if (
        createdOrder?.message &&
        createdOrder.message.toLowerCase().includes("cart not found")
      ) {
        setConfirmOpen(true);
        setPlacingOrder(false);
        return;
      }

      if (!createdOrder?.orderId) {
        throw new Error("Order creation failed");
      }

      // Store order ID for later use
      if (typeof window !== "undefined") {
        localStorage.setItem("orderId", createdOrder.orderId);
        localStorage.setItem("cartId", cartId);
        if (createdOrder.numberOfFreeTickets) {
          localStorage.setItem("TotalFreeTicket", String(createdOrder.numberOfFreeTickets));
        }
      }

      setOrderTotal(createdOrder?.totalAmount)
      const orderId = createdOrder.orderId;

      // 2️⃣ Get public token
      const tokenResponse = await PaymentService.ATHMovileToken();
      const publicToken =
        (tokenResponse as any)?.data?.data?.publicToken ||
        (tokenResponse as any)?.data?.publicToken;

      if (!publicToken) {
        throw new Error("Public token not received");
      }

      // 3️⃣ Save to state (THIS triggers component mount)
      setAthOrderId(orderId);
      setAthToken(publicToken);
      setIsAthReady(true);

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

      // Handle specific error cases
      const errorMsgLower = errorMessage.toLowerCase();

      if (errorMsgLower.includes("cart not found")) {
        setModalConfig({
          title: t("cartNotFound"),
          message: t("cartNotFoundDescription"),
          confirmText: t("returnToCart"),
          cancelText: t("continueShopping"),
          onConfirm: () => router.push("/cart"),
        });
        setConfirmOpen(true);
        router.push("/cart");
      } else if (
        errorMsgLower.includes("cart id not found") ||
        errorMsgLower.includes("cart is empty")
      ) {
        setModalConfig({
          title: t("cartEmpty"),
          message: t("cartEmptyDescription"),
          confirmText: t("goToCart"),
          cancelText: t("continueShopping"),
          onConfirm: () => router.push("/cart"),
        });
        setConfirmOpen(true);
        router.push("/cart");
      } else {
        setModalConfig({
          title: t("checkoutError"),
          message: t("checkoutErrorDescription"),
          confirmText: t("tryAgain"),
        });
        setConfirmOpen(true);
      }

      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !cartData) {
      return;
    }

    // Show coming soon modal only for ATH Móvil
    if (paymentMethod === "athMovil") {
      handleAuthMovil();
      return;
    }


    // Validate manual payment
    if (paymentMethod === "manual") {
      if (!selectedBank) {
        setModalConfig({
          title: t("validationError"),
          message: t("selectBank"),
        });
        setConfirmOpen(true);
        return;
      }

      if (!receiptFile || !manualPaymentConfirmed) {
        setModalConfig({
          title: t("validationError"),
          message: t("uploadReceipt"),
        });
        setConfirmOpen(true);
        setConfirmOpen(true);
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
        console.warn("Error fetching user ID:", error);
        // Continue with fallback - API might handle userId internally
      }
    }

    if (!token) {
      router.push("/auth/login");
      return;
    }

    setPlacingOrder(true);

    try {
      // Refresh cart before placing order to ensure we have the latest cartId
      const freshCartResponse = await CartService.getCart();
      const freshCartData = (freshCartResponse as any)?.data?.data || (freshCartResponse as any)?.data || freshCartResponse;

      // Check if cart is empty or not found
      if (
        !freshCartData ||
        freshCartData.message === "Data not found" ||
        !freshCartData.sellers ||
        freshCartData.sellers.length === 0
      ) {
        setConfirmOpen(true);
        setPlacingOrder(false);
        return;
      }
      // Update cartData state with fresh data
      setCartData(freshCartData as CartData);

      // Get cart ID from fresh cart data
      const cartId = (freshCartData as any)?._id || (freshCartData as any)?.cartId;
      if (!cartId) {
        throw new Error("Cart ID not found");
      }

      // Get user IP address
      const ipAddress = await getMyIP();

      let onlinePaymentMethod = 18;
      if (paymentMethod === "creditCard") {
        onlinePaymentMethod = 18;
      }
      else if (paymentMethod === "manual") {
        onlinePaymentMethod = 12;
      }
      else if (paymentMethod === "square") {
        onlinePaymentMethod = 21;
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
      const response = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      // console.log("order placed");

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }

      const orderData = await response.json();
      // Check if order API returned an error
      if (
        orderData?.message &&
        orderData.message.toLowerCase().includes("cart not found")
      ) {
        setConfirmOpen(true);
        setPlacingOrder(false);
        return;
      }

      // Check if order was placed successfully
      if (orderData?.orderId) {

        if (paymentMethod === "square") {
          setSquareOrderId(orderData.orderId);
          setShowSquarePayment(true);
          setPlacingOrder(false);

          // router.push(
          //   `/square-payment?orderId=${orderData.orderId}&amount=${grandTotal}`
          // );

          return;
        }
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

      // Handle specific error cases
      const errorMsgLower = errorMessage.toLowerCase();

      if (errorMsgLower.includes("cart not found")) {
        setModalConfig({
          title: t("cartNotFound"),
          message: t("cartNotFoundDescription"),
          confirmText: t("returnToCart"),
          cancelText: t("continueShopping"),
          onConfirm: () => router.push("/cart"),
        });
        setConfirmOpen(true);
        router.push("/cart");
      } else if (
        errorMsgLower.includes("cart id not found") ||
        errorMsgLower.includes("cart is empty")
      ) {
        setModalConfig({
          title: t("cartEmpty"),
          message: t("cartEmptyDescription"),
          confirmText: t("goToCart"),
          cancelText: t("continueShopping"),
          onConfirm: () => router.push("/cart"),
        });
        setConfirmOpen(true);
        router.push("/cart");
      } else {
        setModalConfig({
          title: t("checkoutError"),
          message: t("checkoutErrorDescription"),
          confirmText: t("tryAgain"),
        });
        setConfirmOpen(true);
      }

      setPlacingOrder(false);
    }
  };

  const handlePlaceToPaySuccess = async () => {
    setPlaceToPayUrl(null);
    setPlacingOrder(false);

    try {
      if (typeof window !== "undefined") {
        const orderId = localStorage.getItem("orderId");

        if (orderId) {
          await fetch("/api/orders/status-update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              paymentMethod: 18,
            }),
          });
        }
      }
    } catch (error) {
      console.warn("Failed to update order status:", error);
    }
    // const returnUrl= `${process.env.NEXT_PUBLIC_APP_WEBSITE}/payment-response`
    router.push("/thank-you?payment=placetopay");
    // router.push(returnUrl);
  };

  const handlePlaceToPayError = async () => {
    setPlaceToPayUrl(null);
    setPlacingOrder(false);

    try {
      await fetchCart();
    } catch (error) {
      console.warn("Error fetching cart after payment error:", error);
    }

    router.push("/checkout?payment=failed");
  };
  const handlePlaceToPayClose = async () => {
    setPlaceToPayUrl(null);
    setPlacingOrder(false);

    try {
      await fetchCart();
    } catch (error) {
      console.warn("Error fetching cart after closing payment:", error);
    }

    // Optional: keep user on checkout instead of redirect
    router.push("/thank-you");
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

  const handlePaymentMethodChange = async (method: string) => {
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
    if (method === "square") {
      setPaymentMethod("square");
    }
    if (method === "athMovil") {
      try {
        const tokenResponse = await PaymentService.ATHMovileToken();
        const publicToken =
          (tokenResponse as any)?.data?.data?.publicToken ||
          (tokenResponse as any)?.data?.publicToken;

        if (publicToken) {
          setAthToken(publicToken);
        }
      } catch (err) {
        console.warn("Token preload failed", err);
      }
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
          <Loader />
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
    <>
      {/* <SquareScript /> */}
      <ConfirmationModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          modalConfig.onConfirm?.();
        }}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText || t("ok")}
        cancelText={modalConfig.cancelText || t("close")}
        variant="default"
      />
      <div className="min-h-screen bg-[#ededed]">
        <Header />

        {/* Progress Stepper */}
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
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full btn-primary flex items-center justify-center font-semibold text-xs sm:text-sm !border-0 pointer-events-none">
                  <svg className="w-8 h-8" x="0" y="0" viewBox="0 0 64 64"><g><path d="M29.396 45.717a6.139 6.139 0 0 0-6.132 6.132c.288 8.116 11.977 8.114 12.264 0a6.139 6.139 0 0 0-6.132-6.132zm0 9.316a3.185 3.185 0 0 1 0-6.369 3.185 3.185 0 0 1 0 6.37zM45.417 45.717a6.139 6.139 0 0 0-6.132 6.132c.288 8.116 11.978 8.113 12.264 0a6.139 6.139 0 0 0-6.132-6.132zm0 9.316a3.185 3.185 0 0 1 0-6.369 3.185 3.185 0 0 1 0 6.37zM58.864 17.826a5.156 5.156 0 0 0-4.046-1.944H17.48l-.886-4.148c-.686-3.285-4.192-5.669-8.335-5.669H5.474a1.474 1.474 0 1 0 0 2.947h2.784c2.71 0 5.054 1.43 5.452 3.331l1.14 5.337 5.172 22.942a5.15 5.15 0 0 0 5.053 4.041h25.59a5.15 5.15 0 0 0 5.053-4.04L59.872 22.2a5.155 5.155 0 0 0-1.008-4.375zm-1.867 3.727-4.153 18.422a2.22 2.22 0 0 1-2.178 1.74H25.075a2.22 2.22 0 0 1-2.178-1.74l-4.766-21.146h36.687a2.246 2.246 0 0 1 2.179 2.724z" fill="#fff" opacity="1" data-original="#fff"></path><path d="m42.307 25.255-7.444 6.805-2.208-2.717a1.474 1.474 0 0 0-2.287 1.859l3.192 3.93a1.473 1.473 0 0 0 2.138.158l8.597-7.86a1.473 1.473 0 0 0-1.988-2.175z" fill="#fff" opacity="1" data-original="#fff"></path></g></svg>
                </div>
                <span className="font-semibold text-[#2f2f2f] text-xs sm:text-sm md:text-base inline">{t("secureCheckout")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-4 sm:pt-6 md:pt-8 pb-8 sm:pb-10 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* SHIPPING INFORMATION */}
              <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 xl:p-6">
                <div className="pb-3 sm:pb-4 border-b border-gray-300">
                  <h2 className="text-base sm:text-lg font-bold text-[#2f2f2f] uppercase">{t("shippingInformation")}</h2>
                </div>
                <div className="pt-3 sm:pt-4">
                  {selectedAddress ? (
                    <div>
                      {selectedAddress.name && (
                        <p className="text-xs sm:text-sm text-[#2f2f2f] mb-2 break-words flex items-start gap-1">
                          <span className="font-semibold">
                            {t("name")}:
                          </span> {selectedAddress.name}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-[#2f2f2f] mb-3 break-words flex items-start gap-1">
                        <span className="font-semibold inline-flex items-center gap-1">
                          <svg className="w-4 h-4" x="0" y="0" viewBox="0 0 512 512"><g><path d="M256 0C153.755 0 70.573 83.182 70.573 185.426c0 126.888 165.939 313.167 173.004 321.035 6.636 7.391 18.222 7.378 24.846 0 7.065-7.868 173.004-194.147 173.004-321.035C441.425 83.182 358.244 0 256 0zm0 469.729c-55.847-66.338-152.035-197.217-152.035-284.301 0-83.834 68.202-152.036 152.035-152.036s152.035 68.202 152.035 152.035C408.034 272.515 311.861 403.37 256 469.729z" fill="#000000" opacity="1" data-original="#000000"></path><path d="M256 92.134c-51.442 0-93.292 41.851-93.292 93.293S204.559 278.72 256 278.72s93.291-41.851 93.291-93.293S307.441 92.134 256 92.134zm0 153.194c-33.03 0-59.9-26.871-59.9-59.901s26.871-59.901 59.9-59.901 59.9 26.871 59.9 59.901-26.871 59.901-59.9 59.901z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>
                          {t("address")}:
                        </span> {formatAddress(selectedAddress)}.
                      </p>
                      {selectedAddress.mobileNumber && (
                        <p className="text-xs sm:text-sm text-[#2f2f2f] mb-3 break-words flex items-start gap-1">
                          <span className="font-semibold inline-flex items-center gap-1">
                            <svg version="1.1" x="0" y="0" viewBox="0 0 482.6 482.6" className="w-4 h-4"><g><path d="M98.339 320.8c47.6 56.9 104.9 101.7 170.3 133.4 24.9 11.8 58.2 25.8 95.3 28.2 2.3.1 4.5.2 6.8.2 24.9 0 44.9-8.6 61.2-26.3.1-.1.3-.3.4-.5 5.8-7 12.4-13.3 19.3-20 4.7-4.5 9.5-9.2 14.1-14 21.3-22.2 21.3-50.4-.2-71.9l-60.1-60.1c-10.2-10.6-22.4-16.2-35.2-16.2-12.8 0-25.1 5.6-35.6 16.1l-35.8 35.8c-3.3-1.9-6.7-3.6-9.9-5.2-4-2-7.7-3.9-11-6-32.6-20.7-62.2-47.7-90.5-82.4-14.3-18.1-23.9-33.3-30.6-48.8 9.4-8.5 18.2-17.4 26.7-26.1 3-3.1 6.1-6.2 9.2-9.3 10.8-10.8 16.6-23.3 16.6-36s-5.7-25.2-16.6-36l-29.8-29.8c-3.5-3.5-6.8-6.9-10.2-10.4-6.6-6.8-13.5-13.8-20.3-20.1-10.3-10.1-22.4-15.4-35.2-15.4-12.7 0-24.9 5.3-35.6 15.5l-37.4 37.4c-13.6 13.6-21.3 30.1-22.9 49.2-1.9 23.9 2.5 49.3 13.9 80 17.5 47.5 43.9 91.6 83.1 138.7zm-72.6-216.6c1.2-13.3 6.3-24.4 15.9-34l37.2-37.2c5.8-5.6 12.2-8.5 18.4-8.5 6.1 0 12.3 2.9 18 8.7 6.7 6.2 13 12.7 19.8 19.6 3.4 3.5 6.9 7 10.4 10.6l29.8 29.8c6.2 6.2 9.4 12.5 9.4 18.7s-3.2 12.5-9.4 18.7c-3.1 3.1-6.2 6.3-9.3 9.4-9.3 9.4-18 18.3-27.6 26.8l-.5.5c-8.3 8.3-7 16.2-5 22.2.1.3.2.5.3.8 7.7 18.5 18.4 36.1 35.1 57.1 30 37 61.6 65.7 96.4 87.8 4.3 2.8 8.9 5 13.2 7.2 4 2 7.7 3.9 11 6 .4.2.7.4 1.1.6 3.3 1.7 6.5 2.5 9.7 2.5 8 0 13.2-5.1 14.9-6.8l37.4-37.4c5.8-5.8 12.1-8.9 18.3-8.9 7.6 0 13.8 4.7 17.7 8.9l60.3 60.2c12 12 11.9 25-.3 37.7-4.2 4.5-8.6 8.8-13.3 13.3-7 6.8-14.3 13.8-20.9 21.7-11.5 12.4-25.2 18.2-42.9 18.2-1.7 0-3.5-.1-5.2-.2-32.8-2.1-63.3-14.9-86.2-25.8-62.2-30.1-116.8-72.8-162.1-127-37.3-44.9-62.4-86.7-79-131.5-10.3-27.5-14.2-49.6-12.6-69.7z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>
                            {t("phoneNumber")}:
                          </span>{" "}
                          {selectedAddress.mobileNumberCode && `+${selectedAddress.mobileNumberCode} `}
                          {selectedAddress.mobileNumber}
                        </p>
                      )}
                      <button onClick={handleEditShipping} className="text-sm btn-primary font-medium cursor-pointer px-6 py-2">
                        {t("edit")}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-600">{t("noAddressFound")}</p>
                  )}
                </div>
              </div>

              {/* BILLING INFORMATION */}
              <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 xl:p-6">
                <div className="pb-3 sm:pb-4 border-b border-gray-300">
                  <h2 className="text-base sm:text-lg font-bold text-[#2f2f2f] uppercase">{t("billingInformation")}</h2>
                </div>
                <div className="pt-3 sm:pt-4">
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
                        <p className="text-xs sm:text-sm text-[#2f2f2f] mb-3 break-words flex items-start gap-1">
                          <span className="font-semibold">{t("name")}:</span> {billingAddress.name}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-[#2f2f2f] mb-3 break-words flex items-start gap-1">
                        <span className="font-semibold inline-flex items-center gap-1">
                          <svg className="w-4 h-4" x="0" y="0" viewBox="0 0 512 512"><g><path d="M256 0C153.755 0 70.573 83.182 70.573 185.426c0 126.888 165.939 313.167 173.004 321.035 6.636 7.391 18.222 7.378 24.846 0 7.065-7.868 173.004-194.147 173.004-321.035C441.425 83.182 358.244 0 256 0zm0 469.729c-55.847-66.338-152.035-197.217-152.035-284.301 0-83.834 68.202-152.036 152.035-152.036s152.035 68.202 152.035 152.035C408.034 272.515 311.861 403.37 256 469.729z" fill="#000000" opacity="1" data-original="#000000"></path><path d="M256 92.134c-51.442 0-93.292 41.851-93.292 93.293S204.559 278.72 256 278.72s93.291-41.851 93.291-93.293S307.441 92.134 256 92.134zm0 153.194c-33.03 0-59.9-26.871-59.9-59.901s26.871-59.901 59.9-59.901 59.9 26.871 59.9 59.901-26.871 59.901-59.9 59.901z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>
                          {t("address")}:
                        </span> {formatAddress(billingAddress)}.
                      </p>
                      {billingAddress.mobileNumber && (
                        <p className="text-xs sm:text-sm text-[#2f2f2f] mb-3 break-words flex items-start gap-1">
                          <span className="font-semibold inline-flex items-center gap-1">
                            <svg version="1.1" x="0" y="0" viewBox="0 0 482.6 482.6" className="w-4 h-4"><g><path d="M98.339 320.8c47.6 56.9 104.9 101.7 170.3 133.4 24.9 11.8 58.2 25.8 95.3 28.2 2.3.1 4.5.2 6.8.2 24.9 0 44.9-8.6 61.2-26.3.1-.1.3-.3.4-.5 5.8-7 12.4-13.3 19.3-20 4.7-4.5 9.5-9.2 14.1-14 21.3-22.2 21.3-50.4-.2-71.9l-60.1-60.1c-10.2-10.6-22.4-16.2-35.2-16.2-12.8 0-25.1 5.6-35.6 16.1l-35.8 35.8c-3.3-1.9-6.7-3.6-9.9-5.2-4-2-7.7-3.9-11-6-32.6-20.7-62.2-47.7-90.5-82.4-14.3-18.1-23.9-33.3-30.6-48.8 9.4-8.5 18.2-17.4 26.7-26.1 3-3.1 6.1-6.2 9.2-9.3 10.8-10.8 16.6-23.3 16.6-36s-5.7-25.2-16.6-36l-29.8-29.8c-3.5-3.5-6.8-6.9-10.2-10.4-6.6-6.8-13.5-13.8-20.3-20.1-10.3-10.1-22.4-15.4-35.2-15.4-12.7 0-24.9 5.3-35.6 15.5l-37.4 37.4c-13.6 13.6-21.3 30.1-22.9 49.2-1.9 23.9 2.5 49.3 13.9 80 17.5 47.5 43.9 91.6 83.1 138.7zm-72.6-216.6c1.2-13.3 6.3-24.4 15.9-34l37.2-37.2c5.8-5.6 12.2-8.5 18.4-8.5 6.1 0 12.3 2.9 18 8.7 6.7 6.2 13 12.7 19.8 19.6 3.4 3.5 6.9 7 10.4 10.6l29.8 29.8c6.2 6.2 9.4 12.5 9.4 18.7s-3.2 12.5-9.4 18.7c-3.1 3.1-6.2 6.3-9.3 9.4-9.3 9.4-18 18.3-27.6 26.8l-.5.5c-8.3 8.3-7 16.2-5 22.2.1.3.2.5.3.8 7.7 18.5 18.4 36.1 35.1 57.1 30 37 61.6 65.7 96.4 87.8 4.3 2.8 8.9 5 13.2 7.2 4 2 7.7 3.9 11 6 .4.2.7.4 1.1.6 3.3 1.7 6.5 2.5 9.7 2.5 8 0 13.2-5.1 14.9-6.8l37.4-37.4c5.8-5.8 12.1-8.9 18.3-8.9 7.6 0 13.8 4.7 17.7 8.9l60.3 60.2c12 12 11.9 25-.3 37.7-4.2 4.5-8.6 8.8-13.3 13.3-7 6.8-14.3 13.8-20.9 21.7-11.5 12.4-25.2 18.2-42.9 18.2-1.7 0-3.5-.1-5.2-.2-32.8-2.1-63.3-14.9-86.2-25.8-62.2-30.1-116.8-72.8-162.1-127-37.3-44.9-62.4-86.7-79-131.5-10.3-27.5-14.2-49.6-12.6-69.7z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>
                            {t("phoneNumber")}:
                          </span>{" "}
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
              <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 xl:p-6">
                <div className="pb-3 sm:pb-4 border-b border-gray-300">
                  <h2 className="text-base sm:text-lg font-bold text-[#2f2f2f] uppercase">{t("paymentMethod")}</h2>
                </div>
                <div className="pt-3 sm:pt-4">
                  {/* Payment Options */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                    {[
                      {
                        value: "athMovil",
                        label: t("payWithATHMovil"),
                      },
                      ...(ENABLE_PLACE_TO_PAY
                        ? [
                          {
                            value: "creditCard",
                            label: t("payWithCreditCard"),
                            icons: true,
                          },
                        ]
                        : []),
                      {
                        value: "manual",
                        label: t("manualPaymentMethods"),
                      },
                      {
                        value: "square",
                        label: "Credit / Debit Card",
                        icons: true,
                      },
                    ].map((method) => {
                      const isSelected = paymentMethod === method.value;
                      const isDisabled = grandTotal <= 0;

                      return (
                        <label
                          key={method.value}
                          className={`relative flex-1 min-w-45 cursor-pointer`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={isSelected}
                            onChange={(e) =>
                              method.value === "manual"
                                ? handleManualPaymentSelect()
                                : handlePaymentMethodChange(e.target.value)
                            }
                            disabled={isDisabled}
                            className="sr-only"
                          />

                          <div
                            className={`px-3 py-3 h-full inline-flex items-center w-full border-2 border-dashed rounded-lg transition-all 
            ${isSelected
                                ? "border-[#f3c200] border-dashed bg-yellow-50"
                                : "border-gray-300 hover:shadow-md"
                              }
            ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                              <span className="text-[13px] text-gray-800 font-semibold">
                                {method.label}
                              </span>

                              {method.icons && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Image src="/images/Profile_new/visa.svg" alt="VISA" width={40} height={25} className="h-4 sm:h-5 w-auto object-contain" />
                                  <Image src="/images/Profile_new/mastercard.svg" alt="Mastercard" width={40} height={25} className="h-4 sm:h-5 w-auto object-contain" />
                                  <Image src="/images/Profile_new/ath.jpg" alt="ATH" width={40} height={25} className="h-4 sm:h-5 w-auto object-contain" />
                                  <Image src="/images/Profile_new/amex.jpg" alt="AMEX" width={40} height={25} className="h-4 sm:h-5 w-auto object-contain" />
                                </div>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* {paymentMethod === "athMovil" && (
                  <div className="mt-6">
                    <div className="ATH_Movil">
                      <div id="ATHMovil_Checkout_Button_payment" />

                    </div>

              
                    {athResponses.length > 0 && (
                      <div className="mt-4 bg-gray-100 p-3 rounded text-xs max-h-40 overflow-y-auto">
                        {athResponses.map((res, idx) => (
                          <div key={idx} className="mb-1 break-all">
                            {res}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )} */}


                </div>
              </div>

              {/* Manual Payment Bank Details Section */}
              {paymentMethod === "manual" && (
                <div className="mt-4 rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 md:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-[#2f2f2f] uppercase mb-4">{t("manualPaymentMethods")}</h3>

                  {/* Loading State */}
                  {loadingBankDetails && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600">{t("loading") || "Loading..."}</p>
                    </div>
                  )}

                  {/* Bank Selection */}
                  {!loadingBankDetails && bankDetails.length > 0 && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">{t("selectBank") || "Select a bank:"}</p>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        {bankDetails.map((bank) => (
                          <div
                            key={bank._id}
                            onClick={() => handleBankSelect(bank)}
                            className={`relative bg-white border rounded-lg p-2 cursor-pointer transition-all ${selectedBank?._id === bank._id
                              ? "border-[#f3c200] shadow-xl"
                              : "border-gray-300 hover:shadow-lg"
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
                              <div className="absolute -top-2 -right-2 bg-[#f3c200] rounded-full p-1">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 xl:gap-8 border-t border-gray-300 pt-4 mt-6">
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-[#2f2f2f] mb-3">{selectedBank.bankName}</h4>

                        {selectedBank.bankPaymentNumber ? (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">{t("accountNumber") || "Account Number"}:</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm sm:text-base font-semibold text-[#2f2f2f]">{selectedBank.bankPaymentNumber}</p>
                              <button
                                onClick={() => handleCopyToClipboard(selectedBank.bankPaymentNumber || "")}
                                className="p-1 hover:bg-gray-300 rounded transition-colors cursor-pointer"
                                title={t("copy") || "Copy"}
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        ) : selectedBank.bankPaymentURL ? (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">{t("paymentURL") || "Payment URL"}:</p>
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
                            <p className="text-xs text-gray-500 mb-1 font-semibold">{t("ID") || "ID"}:</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm sm:text-base font-semibold text-gray-800">{selectedBank.accountHolderID}</p>
                              <button
                                onClick={() => handleCopyToClipboard(selectedBank.accountHolderID || "")}
                                className="p-1 hover:bg-gray-300 rounded transition-colors cursor-pointer"
                                title={t("copy") || "Copy"}
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedBank.accountHolderName && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">{t("Holder") || "Account Holder"}:</p>
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
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center min-h-[150px] flex items-center justify-center">
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
                            onClick={handleManualPaymentConfirm}
                            className="mt-4 w-full btn-primary text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg transition-colors shadow-lg uppercase text-sm md:text-default flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t("confirm") || "Confirm"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {paymentMethod === "square" && showSquarePayment && squareOrderId && (
                <SquarePayment
                  orderId={squareOrderId}
                  amount={Math.round(grandTotal * 100)}
                  onSuccess={handleSquareSuccess}
                  onError={handleSquareError}
                />
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 xl:p-6 lg:sticky lg:top-24">
                {/* ORDER DETAILS */}
                <div className="pb-3 sm:pb-4 border-b border-gray-300">
                  <h2 className="text-base sm:text-lg font-bold text-[#2f2f2f] uppercase">{t("orderDetails")}</h2>
                </div>
                <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 px-1 custom-scroll max-h-[260px] overflow-y-auto">
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
                        <div className="w-14 h-14 sm:w-22 sm:h-22 rounded bg-white overflow-hidden flex-shrink-0">
                          <Image src={getProductImage(item)} alt={item.name || item.productName || "Product"} width={80} height={80} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[#2f2f2f] mb-1 line-clamp-2">{item.name || item.productName || "Product"}</p>
                          <p className="text-xs text-gray-600 mb-1">
                            {t("soldBy")}: <span className="text-[#D4AF37] font-semibold">{sellerName}</span>
                          </p>
                          {ticketCount > 0 && (
                            <p className="text-xs text-gray-600 mb-1">
                              {t("totalTicketsCount")}: <span className="text-[#2f2f2f] font-semibold">{ticketCount}</span>
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-600">
                              {qty} x {currency} {formatCurrency(unitPrice)}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-[#2f2f2f]">{currency} {formatCurrency(itemTotal)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAYMENT INFORMATION */}
                <div className="pt-3 sm:pt-4 border-t border-gray-300">
                  <h2 className="text-xs sm:text-sm font-bold text-[#2f2f2f] uppercase mb-3 sm:mb-4">{t("paymentInformation")}</h2>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("bagTotal")}:</span>
                      <span className="text-[#2f2f2f] font-semibold">{currency} {formatCurrency(bagTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("subTotal")}:</span>
                      <span className="text-[#2f2f2f] font-semibold">{currency} {formatCurrency(subTotal)}</span>
                    </div>
                    {hasNamedTax && taxItems ? (
                      taxItems.map((taxItem, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-600">{taxItem.taxName || t("tax")}:</span>
                          <span className="text-[#2f2f2f] font-semibold">{currency} {formatCurrency(taxItem.totalValue)}</span>
                        </div>
                      ))
                    ) : taxAmount > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("tax")}:</span>
                        <span className="text-[#2f2f2f] font-semibold">{currency} {formatCurrency(taxAmount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("shippingFee")}:</span>
                      <span className="text-[#2f2f2f] font-semibold">{shippingFee > 0 ? `${currency} ${formatCurrency(shippingFee)}` : t("free")}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-300 mt-4 items-center">
                      <span className="font-bold text-[#2f2f2f]">{t("grandTotal")}:</span>
                      <span className="font-bold text-[#2f2f2f] font-semibold text-lg 2xl:text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">{currency} {formatCurrency(grandTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 pt-1 sm:pt-2 py-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[10px] sm:text-xs text-gray-600">{t("taxInfoMessage")}</p>
                    </div>
                    {paymentMethod !== "" && !(paymentMethod === "square" && showSquarePayment) && (
                      <>
                        {!(paymentMethod === "athMovil" && isAthReady) && (
                          <Button
                            onClick={handlePlaceOrder}
                            disabled={!selectedAddress || placingOrder}
                            className="w-full h-11 btn-primary text-white py-3 md:py-4 px-4 md:px-6 rounded-lg transition-colors shadow-lg text-sm md:text-default flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {placingOrder
                              ? t("placingOrder") || "Placing Order..."
                              : paymentMethod === "manual"
                                ? t("placeOrder") || "PLACE ORDER"
                                : paymentMethod === "athMovil"
                                  ? t("payWithATHMovil") || "PAY WITH ATH MÓVIL"
                                  : paymentMethod === "square"
                                    ? "PAY WITH CARD"
                                    : paymentMethod === "creditCard" && ENABLE_PLACE_TO_PAY
                                      ? t("payWithPlaceToPay") || "PAY WITH PLACE TO PAY"
                                      : t("pay") || "PAY"}
                          </Button>
                        )}


                        {/* AFTER ORDER CREATION — SHOW REAL ATH BUTTON */}
                        {paymentMethod === "athMovil" && isAthReady && athToken && athOrderId && (
                          <AthMovilPayment
                            total={orderTotal || grandTotal}
                            publicToken={athToken}
                            orderId={athOrderId}
                            userId={(getCookie("uid") as string) || ""}
                            onSuccess={handleAthSuccess}
                            onCancel={handleAthCancel}
                          />
                          // <AthMovilCheckout
                          //   total={orderTotal || grandTotal}
                          //   publicToken={athToken}
                          //   orderId={athOrderId}
                          //   userId={(getCookie("uid") as string) || ""}
                          //   onSuccess={handleAthSuccess}
                          //   onCancel={handleAthCancel}
                          // />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 max-w-6xl mx-auto">
              {/* <div className="flex items-center gap-2 flex-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[10px] sm:text-xs text-gray-600">{t("taxInfoMessage")}</p>
              </div> */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-gray-500">{t("totalAmount")}</p>
                  <p className="text-base sm:text-lg font-bold text-gray-800">{currency} {formatCurrency(grandTotal)}</p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Place to Pay Lightbox */}
        {/* {placeToPayUrl && (
          <PlaceToPayLightbox
            url={placeToPayUrl}
            onSuccess={handlePlaceToPaySuccess}
            onError={handlePlaceToPayError}
            onClose={handlePlaceToPayClose}
          />
        )} */}

        {/* Place to Pay Popup */}
        {ENABLE_PLACE_TO_PAY && placeToPayUrl && (
          <PlaceToPayPopup
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
    </>
  );
}

