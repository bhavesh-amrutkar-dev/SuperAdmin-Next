"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Minus, Plus, Info } from "lucide-react";
import { toast } from "sonner";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { CartService } from "@/src/lib/services/cart";
import { getCookie } from "cookies-next";

interface CartItem {
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
}

interface TaxItem {
  taxName?: string;
  totalValue?: number | string;
}

interface CartData {
  _id?: string;
  currencySymbol?: string;
  currencyCode?: string;
  sellers?: Array<{
    products?: CartItem[];
    sellerName?: string;
    storeId?: string;
  }>;
  accounting?: {
    bagTotal?: number | string;
    unitPrice?: number | string; // Bag Total in old project
    subTotal?: number | string;
    taxableAmount?: number | string; // Sub Total in old project
    tax?: number | string | TaxItem[]; // Can be number or array of tax objects
    taxAmount?: number | string;
    shippingFee?: number | string;
    deliveryFee?: number | string; // Shipping Fee in old project
    finalTotal?: number | string;
    offerDiscount?: number | string; // Bag Discount
    serviceFeeTotal?: number | string; // Service Fee
  };
}

export default function CartPage() {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await CartService.getCart();
      const data = (response as any)?.data?.data || (response as any)?.data || response;

      // Check if the response indicates "Data not found" (empty cart)
      if (data && typeof data === 'object' && data.message === "Data not found") {
        // Set empty cart structure
        setCartData({
          sellers: [],
          accounting: {
            bagTotal: 0,
            subTotal: 0,
            tax: 0,
            shippingFee: 0,
            finalTotal: 0,
          },
        });
        return;
      }

      // Debug: Log the cart data structure
      // eslint-disable-next-line no-console
      setCartData(data);
    } catch (error: any) {
      // Check if error response contains "Data not found" message
      if (error?.response?.data?.message === "Data not found" || error?.message === "Data not found") {
        // Handle empty cart gracefully
        setCartData({
          sellers: [],
          accounting: {
            bagTotal: 0,
            subTotal: 0,
            tax: 0,
            shippingFee: 0,
            finalTotal: 0,
          },
        });
      } else {
        // Only log actual errors, not empty cart cases
        console.error("Error fetching cart:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(item.addToCartOnId || item._id || "");
    try {
      const payload = {
        productId: item.productId || item._id || item.centralProductId || "",
        centralProductId: item.centralProductId || item.productId || item._id || "",
        unitId: item.unitId || "",
        storeId: item.storeId || (item as any).storeId || "",
        ticketId: (item as any).ticketDetails?.ticketId || item.ticketId || null,
        campaignId: (item as any).campaignId || "",
        countryId: getCookie("C_id") as string || "633a6c3dd17f0000ea00102e",
        newQuantity: newQuantity,
        action: 2, // 2 = update
        storeTypeId: 1,
        typeOfCart: 1,
        cartType: 2,
        cartStatus: "removedcart", // Keep same status as shown in payload
        offers: (item as any).offers || {},
        addToCartOnId: item.addToCartOnId ? String(item.addToCartOnId) : "",
        userType: 1,
        deliveryAddressId: getCookie("addressid") as string || "",
      };

      await CartService.addToCart(payload);
      await fetchCart(); // Refresh cart after update

      // Dispatch event to update header cart count
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success(t("cartUpdated") || "Cart updated successfully");
    } catch (error: any) {
      console.error("Error updating cart:", error);
      toast.error(error?.response?.data?.message || error?.message || t("cartUpdateFailed") || "Failed to update cart");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveClick = (item: CartItem) => {
    setItemToRemove(item);
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;

    setUpdating(itemToRemove.addToCartOnId || itemToRemove._id || "");
    setShowConfirmModal(false);

    try {
      const payload = {
        productId: itemToRemove.productId || itemToRemove._id || itemToRemove.centralProductId || "",
        centralProductId: itemToRemove.centralProductId || itemToRemove.productId || itemToRemove._id || "",
        unitId: itemToRemove.unitId || "",
        storeId: itemToRemove.storeId || (itemToRemove as any).storeId || "",
        ticketId: (itemToRemove as any).ticketDetails?.ticketId || itemToRemove.ticketId || null,
        campaignId: (itemToRemove as any).campaignId || "",
        countryId: getCookie("C_id") as string || "633a6c3dd17f0000ea00102e",
        newQuantity: 0,
        action: 3, // 3 = delete
        cartType: 2,
        typeOfCart: 1,
        storeTypeId: 1,
        offers: (itemToRemove as any).offers || {},
        addToCartOnId: itemToRemove.addToCartOnId ? String(itemToRemove.addToCartOnId) : "",
        cartStatus: "removedcart",
        deliveryAddressId: getCookie("addressid") as string || "",
      };

      await CartService.addToCart(payload);
      await fetchCart(); // Refresh cart after deletion

      // Dispatch event to update header cart count
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success(t("itemRemoved") || "Item removed from cart");
    } catch (error: any) {
      console.error("Error removing item from cart:", error);
      toast.error(error?.response?.data?.message || error?.message || t("removeFailed") || "Failed to remove item");
    } finally {
      setUpdating(null);
      setItemToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmModal(false);
    setItemToRemove(null);
  };

  const getProductImage = (item: CartItem): string => {
    // Check images object (old project uses product.images.large)
    if (item.images) {
      if (item.images.large) return item.images.large;
      if (item.images.medium) return item.images.medium;
      if (item.images.small) return item.images.small;
    }
    // Check if images is an array
    if (Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (typeof firstImage === 'object' && firstImage !== null) {
        if (firstImage.large) return firstImage.large;
        if (firstImage.medium) return firstImage.medium;
        if (firstImage.small) return firstImage.small;
      }
    }
    if (item.productImage) {
      return item.productImage;
    }
    if (item.image) {
      return item.image;
    }
    if (item.product?.image) {
      return item.product.image;
    }
    if (item.product?.images) {
      if (typeof item.product.images === 'object' && !Array.isArray(item.product.images)) {
        const images = item.product.images as { large?: string; medium?: string; small?: string };
        if (images.large) return images.large;
        if (images.medium) return images.medium;
        if (images.small) return images.small;
      }
    }
    return "/placeholder-product.png";
  };

  const getAllCartItems = (): CartItem[] => {
    if (!cartData?.sellers) return [];
    const items: CartItem[] = [];
    cartData.sellers.forEach((seller) => {
      if (seller.products && Array.isArray(seller.products)) {
        seller.products.forEach((product) => {
          items.push({
            ...product,
            sellerName: seller.sellerName || "Unknown Seller",
            storeId: (product as any).storeId || seller.storeId || "",
          });
        });
      }
    });
    return items;
  };

  const cartItems = getAllCartItems();
  const accounting = cartData?.accounting || {};
  const itemCount = cartItems.length;
  const currency = cartData?.currencySymbol || "$";

  // Helper function to format currency values
  const formatCurrency = (value: number | string | undefined): string => {
    const numValue = Number(value) || 0;
    return numValue.toFixed(2);
  };

  // Check if tax is available and has valid tax names
  const isTaxAvailable =
    accounting.tax &&
    Array.isArray(accounting.tax) &&
    accounting.tax.length > 0 &&
    accounting.tax.some((tax: TaxItem) => tax.taxName && tax.taxName.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ededed]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loadingCart")}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ededed]">
      <Header />

      {/* Checkout Progress Indicator */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold">
                1
              </div>
              <span className="font-semibold text-[#D4AF37]">{t("bag")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                2
              </div>
              <span className="font-semibold text-gray-600">{t("shippingDetails")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                3
              </div>
              <span className="font-semibold text-gray-600">{t("secureCheckout")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {itemCount === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("cartEmpty")}</h2>
            <p className="text-gray-600 mb-6">{t("cartEmptyMessage")}</p>
            <button
              onClick={() => router.push("/raffles")}
              className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              {t("browseRaffles")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Shopping Bag */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {t("myShoppingBag")} ({itemCount} {itemCount === 1 ? t("cartItem") : t("cartItems")})
                </h2>

                <div className="space-y-6">
                  {cartItems.map((item) => {
                    const itemId = item.addToCartOnId || item._id || "";
                    const isUpdating = updating === itemId;
                    // Handle quantity - can be number or object with value property
                    const quantity = typeof item.quantity === 'object' && item.quantity !== null
                      ? Number(item.quantity.value) || 1
                      : Number(item.quantity) || 1;

                    // Price from accounting object (old project structure)
                    const rawPrice =
                      item.accounting?.finalUnitPrice ||
                      item.accounting?.unitPrice ||
                      item.accounting?.subTotal ||
                      (item as any).product?.price ||
                      (item as any).product?.ticketPrice ||
                      (item as any).product?.unitPrice ||
                      item.price ||
                      (item as any).unitPrice ||
                      (item as any).ticketPrice ||
                      0;

                    const price = Number(rawPrice) || 0;
                    // const totalPrice = price * quantity;

                    return (
                      <div key={itemId} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={getProductImage(item)}
                              alt={item.productName || "Product"}
                              width={128}
                              height={128}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-product.png";
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {item.name || item.productName || (item as any).product?.name || t("productName")}
                            </h3>
                            {item.brandName && (
                              <p className="text-xs text-gray-500 mb-1">{item.brandName}</p>
                            )}
                            <p className="text-sm text-gray-600 mb-1">
                              {t("soldBy")} <span className="font-medium">{item.storeName || item.sellerName || t("unknown")}</span>
                            </p>
                            {item.ticketDetails?.numberOfTicket && (
                              <p className="text-sm text-gray-600 mb-1">
                                {t("totalTicketsCount")} <span className="font-medium">{item.ticketDetails.numberOfTicket}</span>
                              </p>
                            )}
                            {item.numberOfFreeTickets && (
                              <p className="text-sm text-gray-600 mb-1">
                                {t("free")} {t("tickets")}: <span className="font-medium">{item.numberOfFreeTickets}</span>
                              </p>
                            )}
                            {item.ticketCount && (
                              <p className="text-sm text-gray-600 mb-2">
                                {t("totalTicketsCount")} <span className="font-medium">{item.ticketCount}</span>
                              </p>
                            )}
                            <p className="text-lg font-bold text-gray-800 mb-4">
                              {currency} {formatCurrency(price)}
                            </p>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item, quantity - 1)}
                                disabled={isUpdating || quantity <= 1}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus size={18} className="text-gray-600" />
                              </button>

                              <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value) || 1);
                                  updateQuantity(item, val);
                                }}
                                disabled={isUpdating}
                                className="w-20 h-10 text-center text-base font-semibold text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ticket-quantity"
                              />

                              <button
                                type="button"
                                onClick={() => updateQuantity(item, quantity + 1)}
                                disabled={isUpdating}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus size={18} className="text-gray-600" />
                              </button>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => handleRemoveClick(item)}
                              disabled={isUpdating}
                              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {t("remove")}
                            </button>
                            <p className="text-lg font-bold text-gray-800">
                              {currency} {formatCurrency(price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Payment Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6">{t("paymentInformation")}</h2>

                <div className="space-y-3">
                  {/* Bag Total */}
                  <div className="flex justify-between text-gray-700">
                    <span>{t("bagTotal")}</span>
                    <span className="font-semibold">
                      {currency} {formatCurrency(accounting.unitPrice || accounting.bagTotal || accounting.subTotal)}
                    </span>
                  </div>

                  {/* Bag Discount */}
                  {Number(accounting.offerDiscount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t("bagDiscount")}</span>
                      <span className="font-semibold">
                        {currency} {formatCurrency(accounting.offerDiscount)}
                      </span>
                    </div>
                  )}

                  {/* Sub Total */}
                  <div className="flex justify-between text-gray-700 pt-1">
                    <span>{t("subTotal")}</span>
                    <span className="font-semibold">
                      {currency} {formatCurrency(accounting.taxableAmount || accounting.subTotal)}
                    </span>
                  </div>

                  {/* Service Fee */}
                  {Number(accounting.serviceFeeTotal) > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>{t("serviceFee")}</span>
                      <span className="font-semibold">
                        {currency} {formatCurrency(accounting.serviceFeeTotal)}
                      </span>
                    </div>
                  )}

                  {/* Tax - Multiple taxes can be displayed */}
                  {isTaxAvailable && Array.isArray(accounting.tax) && accounting.tax.map((taxItem: TaxItem, index: number) => (
                    taxItem.taxName && taxItem.taxName.length > 0 ? (
                      <div key={index} className="flex justify-between text-gray-700">
                        <span className="text-sm">{taxItem.taxName}</span>
                        <span className="font-semibold text-sm">
                          {currency} {formatCurrency(taxItem.totalValue)}
                        </span>
                      </div>
                    ) : null
                  ))}

                  {/* Single tax value if not an array */}
                  {!isTaxAvailable && accounting.tax && !Array.isArray(accounting.tax) && Number(accounting.tax) > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>{t("puertoRicoTax")}</span>
                      <span className="font-semibold">
                        {currency} {formatCurrency(accounting.tax)}
                      </span>
                    </div>
                  )}

                  {/* Shipping Fee */}
                  <div className="flex justify-between text-gray-700">
                    <span>{t("shippingFee")}</span>
                    <span className="font-semibold">
                      {Number(accounting.deliveryFee || accounting.shippingFee || 0) === 0
                        ? t("free")
                        : `${currency} ${formatCurrency(accounting.deliveryFee || accounting.shippingFee)}`}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="border-t border-gray-300 pt-4 mt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-800">{t("grandTotal")}</span>
                      <span className="text-lg font-bold text-[#D4AF37]">
                        {currency} {formatCurrency(accounting.finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/shipping-address")}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg mt-6"
                >
                  {t("proceedToCheckout")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">{t("totalAmount")}</span>
                <span className="text-2xl font-bold text-[#D4AF37]">
                  {currency} {formatCurrency(accounting.finalTotal)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info size={16} />
                <span>{t("taxDutiesNotice")}</span>
              </div>
              <button
                onClick={() => router.push("/shipping-address")}
                className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
              >
                {t("checkout")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={itemCount > 0 ? "pb-24" : ""}>
        <Footer />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={handleCancelRemove}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {t("confirmRemove")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("confirmRemoveMessage")}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancelRemove}
                className="flex-1 px-4 py-2 border-2 border-[#D4AF37] text-[#D4AF37] font-semibold rounded-full hover:bg-[#D4AF37] hover:text-white transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white font-semibold rounded-full hover:bg-[#B8860B] transition-colors"
              >
                {t("continue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
