"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Minus, Plus, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import LoginModal from "@/src/components/modals/LoginModal";
import { CartService } from "@/src/lib/services/cart";
import { getCookie } from "cookies-next";
import { Button } from "../../components/ui/button";

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
  sellerSingleUnitPrice?: {
    unitPrice?: number | string;
    price?: number | string;
    ticketPrice?: number | string;
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showConfirmModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      if (showConfirmModal) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [showConfirmModal]);

  const fetchCart = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
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

      // Recalculate bagTotal from items to ensure it excludes tax
      if (data && data.sellers && data.accounting) {
        let calculatedBagTotal = 0;
        data.sellers.forEach((seller: any) => {
          if (seller.products) {
            seller.products.forEach((product: any) => {
              const productQty = typeof product.quantity === 'object' && product.quantity !== null
                ? Number(product.quantity.value) || 1
                : Number(product.quantity) || 1;

              // Use subTotal if available, otherwise calculate from unit price
              let productTotal = 0;
              if (product.accounting?.subTotal !== undefined && product.accounting?.subTotal !== null) {
                productTotal = Number(product.accounting.subTotal) || 0;
              } else {
                const productUnitPrice = Number(product.accounting?.finalUnitPrice) ||
                  Number(product.accounting?.unitPrice) ||
                  Number(product.price) ||
                  Number(product.unitPrice) ||
                  Number(product.ticketPrice) || 0;

                if (productUnitPrice > 0) {
                  productTotal = productUnitPrice * productQty;
                } else if (product.accounting?.subTotal) {
                  productTotal = Number(product.accounting.subTotal) || 0;
                }
              }

              calculatedBagTotal += productTotal;
            });
          }
        });

        // Update bagTotal to exclude tax (use calculated sum or taxableAmount/subTotal)
        data.accounting = {
          ...data.accounting,
          bagTotal: calculatedBagTotal > 0 ? calculatedBagTotal : (Number(data.accounting.taxableAmount) || Number(data.accounting.subTotal) || Number(data.accounting.bagTotal) || 0),
          subTotal: calculatedBagTotal > 0 ? calculatedBagTotal : (Number(data.accounting.taxableAmount) || Number(data.accounting.subTotal) || 0),
        };
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
        console.warn("Error fetching cart:", error);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    const itemId = item.addToCartOnId || item._id || "";
    setUpdating(itemId);

    // Optimistically update local state immediately (no page refresh)
    if (cartData) {
      const updatedCartData = { ...cartData };

      // Calculate unit price using the same logic as display
      const rawUnitPrice =
        item.accounting?.finalUnitPrice ||
        item.accounting?.unitPrice ||
        (item as any).product?.price ||
        (item as any).product?.ticketPrice ||
        (item as any).product?.unitPrice ||
        item.price ||
        (item as any).unitPrice ||
        (item as any).ticketPrice ||
        0;

      let unitPrice = Number(rawUnitPrice) || 0;
      const oldQuantity = typeof item.quantity === 'object' && item.quantity !== null
        ? Number(item.quantity.value) || 1
        : Number(item.quantity) || 1;

      // If unit price is 0, try to calculate from subTotal
      if (unitPrice === 0 && item.accounting?.subTotal) {
        const subTotal = Number(item.accounting.subTotal) || 0;
        unitPrice = oldQuantity > 0 ? subTotal / oldQuantity : 0;
      }

      const newItemTotal = unitPrice;

      if (updatedCartData.sellers) {
        updatedCartData.sellers = updatedCartData.sellers.map((seller) => {
          if (seller.products) {
            return {
              ...seller,
              products: seller.products.map((product) => {
                const productId = product.addToCartOnId || product._id;

                if (productId === itemId) {
                  // Update quantity and accounting for this item
                  const updatedProduct = {
                    ...product,
                    quantity: newQuantity,
                    accounting: {
                      ...(product.accounting || {}),
                      subTotal: newItemTotal,
                      finalUnitPrice: unitPrice,
                      unitPrice: unitPrice,
                    },
                  };

                  return updatedProduct;
                }
                return product;
              }),
            };
          }
          return seller;
        });
      }

      // Recalculate bag total by summing all items (more accurate than difference)
      if (updatedCartData.accounting) {
        let newBagTotal = 0;
        if (updatedCartData.sellers) {
          updatedCartData.sellers.forEach((seller) => {
            if (seller.products) {
              seller.products.forEach((product) => {
                const productQty = typeof product.quantity === 'object' && product.quantity !== null
                  ? Number(product.quantity.value) || 1
                  : Number(product.quantity) || 1;

                // Use subTotal if available (already calculated), otherwise calculate from unit price
                let productTotal = 0;
                if (product.accounting?.subTotal !== undefined && product.accounting?.subTotal !== null) {
                  // Use the subTotal directly (it's already unit price * quantity)
                  productTotal = Number(product.accounting.subTotal) || 0;
                } else {
                  // Calculate from unit price
                  const productUnitPrice = Number(product.accounting?.finalUnitPrice) ||
                    Number(product.accounting?.unitPrice) ||
                    Number(product.price) ||
                    Number(product.unitPrice) ||
                    Number(product.ticketPrice) || 0;

                  if (productUnitPrice > 0) {
                    productTotal = productUnitPrice * productQty;
                  } else if (product.accounting?.subTotal) {
                    // Fallback: if we have subTotal but unit price is 0, use subTotal
                    productTotal = Number(product.accounting.subTotal) || 0;
                  }
                }

                newBagTotal += productTotal;
              });
            }
          });
        }

        const tax = updatedCartData.accounting.tax;
        const taxAmount = Array.isArray(tax)
          ? tax.reduce((sum, t) => sum + Number(t.totalValue || 0), 0)
          : Number(tax || 0);
        const shippingFee = Number(updatedCartData.accounting.shippingFee || updatedCartData.accounting.deliveryFee || 0);

        updatedCartData.accounting = {
          ...updatedCartData.accounting,
          bagTotal: newBagTotal,
          subTotal: newBagTotal,
          finalTotal: newBagTotal + taxAmount + shippingFee,
        };
      }

      setCartData(updatedCartData);
    }

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

      // Silently refresh cart in background to sync with server (without showing loading)
      fetchCart(false).catch(() => {
        // If refresh fails, silently continue - optimistic update is already shown
      });

      window.dispatchEvent(new Event('cartUpdated'));


    } catch (error: any) {
      // Revert optimistic update on error
      fetchCart();
      console.warn("Error updating cart:", error);
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

    const itemId = itemToRemove.addToCartOnId || itemToRemove._id || "";
    setUpdating(itemId);
    setShowConfirmModal(false);

    // Optimistically remove item from UI immediately (no page refresh)
    if (cartData) {
      const updatedCartData = { ...cartData };

      if (updatedCartData.sellers) {
        updatedCartData.sellers = updatedCartData.sellers.map((seller) => {
          if (seller.products) {
            return {
              ...seller,
              products: seller.products.filter((product) => {
                const productId = product.addToCartOnId || product._id;
                return productId !== itemId;
              }),
            };
          }
          return seller;
        }).filter((seller) => seller.products && seller.products.length > 0); // Remove empty sellers
      }

      // Recalculate totals after removal
      if (updatedCartData.accounting) {
        let newBagTotal = 0;
        if (updatedCartData.sellers) {
          updatedCartData.sellers.forEach((seller) => {
            if (seller.products) {
              seller.products.forEach((product) => {
                const productQty = typeof product.quantity === 'object' && product.quantity !== null
                  ? Number(product.quantity.value) || 1
                  : Number(product.quantity) || 1;

                let productTotal = 0;
                if (product.accounting?.subTotal !== undefined && product.accounting?.subTotal !== null) {
                  productTotal = Number(product.accounting.subTotal) || 0;
                } else {
                  const productUnitPrice = Number(product.accounting?.finalUnitPrice) ||
                    Number(product.accounting?.unitPrice) ||
                    Number(product.price) ||
                    Number(product.unitPrice) ||
                    Number(product.ticketPrice) || 0;

                  if (productUnitPrice > 0) {
                    productTotal = productUnitPrice * productQty;
                  } else if (product.accounting?.subTotal) {
                    productTotal = Number(product.accounting.subTotal) || 0;
                  }
                }

                newBagTotal += productTotal;
              });
            }
          });
        }

        const tax = updatedCartData.accounting.tax;
        const taxAmount = Array.isArray(tax)
          ? tax.reduce((sum, t) => sum + Number(t.totalValue || 0), 0)
          : Number(tax || 0);
        const shippingFee = Number(updatedCartData.accounting.shippingFee || updatedCartData.accounting.deliveryFee || 0);

        updatedCartData.accounting = {
          ...updatedCartData.accounting,
          bagTotal: newBagTotal,
          subTotal: newBagTotal,
          finalTotal: newBagTotal + taxAmount + shippingFee,
        };
      }

      setCartData(updatedCartData);
    }

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

      // Silently refresh cart in background to sync with server (without showing loading)
      fetchCart(false).catch(() => {
        // If refresh fails, silently continue - optimistic update is already shown
      });

      // Dispatch event to update header cart count
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success(t("itemRemoved") || "Item removed from cart");
    } catch (error: any) {
      // Revert optimistic update on error by refreshing cart
      fetchCart();
      console.warn("Error removing item from cart:", error);
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

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    const token = getCookie("access_token");
    return !!token;
  };

  // Handle checkout - check authentication first
  const handleCheckout = () => {
    if (!isAuthenticated()) {
      // Show login modal if not authenticated
      setShowLoginModal(true);
    } else {
      // User is authenticated, proceed to checkout
      router.push("/shipping-address");
    }
  };

  // Handle login success - refresh cart and proceed to checkout
  const handleLoginSuccess = async () => {
    // Wait a bit for the token to be set in cookies
    setTimeout(async () => {
      // Refresh cart to get authenticated user's cart (API should merge guest cart)
      await fetchCart();
      // Dispatch event to update header cart count
      window.dispatchEvent(new Event('cartUpdated'));
      // Proceed to checkout
      router.push("/shipping-address");
    }, 500);
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
      <div className="bg-white border-b border-gray-200 py-3 sm:py-4">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                1
              </div>
              <span className="font-semibold text-[#D4AF37] text-xs sm:text-sm md:text-base">{t("bag")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xs sm:text-sm">
                2
              </div>
              <span className="font-semibold text-gray-600 text-xs sm:text-sm md:text-base hidden sm:inline">{t("shippingDetails")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xs sm:text-sm">
                3
              </div>
              <span className="font-semibold text-gray-600 text-xs sm:text-sm md:text-base hidden md:inline">{t("secureCheckout")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        {itemCount === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{t("cartEmpty")}</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{t("cartEmptyMessage")}</p>
            <Button
              onClick={() => router.push("/raffles")}
              variant="primary"
              size="lg"
            >
              {t("browseRaffles")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Shopping Bag */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                  {t("myShoppingBag")} ({itemCount} {itemCount === 1 ? t("cartItem") : t("cartItems")})
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  {cartItems.map((item, index) => {
                    // Create a unique key - index ensures uniqueness within the list
                    const itemId = item.addToCartOnId || item._id || item.productId || item.centralProductId || '';
                    // Use index as the primary unique identifier (always unique in array.map)
                    const uniqueKey = `cart-item-${index}`;
                    const isUpdating = updating === itemId;
                    // Handle quantity - can be number or object with value property
                    const quantity = typeof item.quantity === 'object' && item.quantity !== null
                      ? Number(item.quantity.value) || 1
                      : Number(item.quantity) || 1;

                    const rawUnitPrice =
                      // item.accounting?.finalUnitPrice ||
                      item.accounting?.unitPrice ||
                      (item as any).product?.price ||
                      (item as any).product?.ticketPrice ||
                      (item as any).product?.unitPrice ||
                      item.price ||
                      (item as any).unitPrice ||
                      (item as any).ticketPrice ||
                      0;

                    // If we only have subTotal, calculate unit price by dividing by quantity
                    let unitPrice = Number(rawUnitPrice) || 0;
                    if (unitPrice === 0 && item.accounting?.subTotal) {
                      const subTotal = Number(item.accounting.subTotal) || 0;
                      unitPrice = quantity > 0 ? subTotal / quantity : 0;
                    }

                    // Calculate item total (unit price * quantity)
                    const itemTotal = unitPrice;
                    // Get per unit price from sellerSingleUnitPrice if available, otherwise use calculated unitPrice
                    const perUnitPrice = item?.sellerSingleUnitPrice?.unitPrice
                      || item?.sellerSingleUnitPrice?.price
                      || item?.sellerSingleUnitPrice?.ticketPrice
                      || unitPrice

                    return (
                      <div key={uniqueKey} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          {/* Product Image */}
                          <div className="w-full sm:w-24 md:w-32 h-24 sm:h-24 md:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
                          <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 line-clamp-2">
                                {item.name || item.productName || (item as any).product?.name || t("productName")}
                              </h3>
                              {item.brandName && (
                                <p className="text-xs text-gray-500 mb-1">{item.brandName}</p>
                              )}
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                {t("soldBy")} <span className="font-medium">{item.storeName || item.sellerName || t("unknown")}</span>
                              </p>
                              {item.ticketDetails?.numberOfTicket && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                  {t("totalTicketsCount")} <span className="font-medium">{item.ticketDetails.numberOfTicket}</span>
                                </p>
                              )}
                              {item.numberOfFreeTickets && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                  {t("free")} {t("tickets")}: <span className="font-medium">{item.numberOfFreeTickets}</span>
                                </p>
                              )}
                              {item.ticketCount && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-2">
                                  {t("totalTicketsCount")} <span className="font-medium">{item.ticketCount}</span>
                                </p>
                              )}
                              <p className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                                {currency} {formatCurrency(perUnitPrice)} {t("perUnit") || "per unit"}
                              </p>

                              {/* Quantity Selector */}
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(item, quantity - 1);
                                  }}
                                  onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(item, quantity - 1);
                                  }}
                                  disabled={isUpdating || quantity <= 1}
                                  className="w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                                >
                                  <Minus size={18} className="text-gray-600 pointer-events-none" />
                                </Button>

                                <input
                                  type="number"
                                  min="1"
                                  value={quantity}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    updateQuantity(item, val);
                                  }}
                                  disabled={isUpdating}
                                  className="w-16 sm:w-20 h-10 sm:h-10 text-center text-sm sm:text-base font-semibold text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ticket-quantity"
                                  style={{ touchAction: 'manipulation' }}
                                />

                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(item, quantity + 1);
                                  }}
                                  onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(item, quantity + 1);
                                  }}
                                  disabled={isUpdating}
                                  className="w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                                >
                                  <Plus size={18} className="text-gray-600 pointer-events-none" />
                                </Button>
                              </div>
                            </div>

                            {/* Remove Button and Price - Mobile: Right aligned, Desktop: Top right */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0">
                              <button
                                onClick={() => handleRemoveClick(item)}
                                disabled={isUpdating}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                                aria-label={t("remove") || "Remove item"}
                              >
                                <Trash2 size={18} />
                              </button>
                              <p className="text-base sm:text-lg font-bold text-gray-800 order-1 sm:order-2 sm:mt-auto">
                                {currency} {formatCurrency(itemTotal)}
                              </p>
                            </div>
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
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 md:p-6 lg:sticky lg:top-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">{t("paymentInformation")}</h2>

                <div className="space-y-2 sm:space-y-3">
                  {/* Bag Total */}
                  <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                    <span>{t("bagTotal")}</span>
                    <span className="font-semibold">
                      {currency} {formatCurrency(accounting.taxableAmount || accounting.subTotal || accounting.bagTotal)}
                    </span>
                  </div>

                  {/* Bag Discount */}
                  {Number(accounting.offerDiscount) > 0 && (
                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                      <span>{t("bagDiscount")}</span>
                      <span className="font-semibold">
                        {currency} {formatCurrency(accounting.offerDiscount)}
                      </span>
                    </div>
                  )}

                  {/* Sub Total */}
                  <div className="flex justify-between text-gray-700 pt-1 text-sm sm:text-base">
                    <span>{t("subTotal")}</span>
                    <span className="font-semibold">
                      {currency} {formatCurrency(accounting.taxableAmount || accounting.subTotal)}
                    </span>
                  </div>

                  {/* Service Fee */}
                  {Number(accounting.serviceFeeTotal) > 0 && (
                    <div className="flex justify-between text-gray-700 text-sm sm:text-base">
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
                  <div className="border-t border-gray-300 pt-3 sm:pt-4 mt-3 sm:mt-4">
                    <div className="flex justify-between">
                      <span className="text-base sm:text-lg font-bold text-gray-800">{t("grandTotal")}</span>
                      <span className="text-base sm:text-lg font-bold text-[#D4AF37]">
                        {currency} {formatCurrency(accounting.finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  size="default"
                  className="w-full mt-4 sm:mt-6"
                >
                  {t("proceedToCheckout")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-2 flex-1">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">{t("totalAmount")}</span>
                <span className="text-xl sm:text-2xl font-bold text-[#D4AF37]">
                  {currency} {formatCurrency(accounting.finalTotal)}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <Info size={14} className="sm:w-4 sm:h-4" />
                <span>{t("taxDutiesNotice")}</span>
              </div>
              <Button
                onClick={handleCheckout}
                variant="primary"
                size="default"
                className="w-full sm:w-auto"
              >
                {t("checkout")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={itemCount > 0 ? "pb-20 sm:pb-24" : ""}>
        <Footer />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 max-w-md w-full mx-4 relative shadow-xl">
            <Button
              onClick={handleCancelRemove}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pr-6">
              {t("confirmRemove")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {t("confirmRemoveMessage")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleCancelRemove}
                variant="outline"
                size="default"
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleConfirmRemove}
                variant="primary"
                size="default"
                className="flex-1"
              >
                {t("continue")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
