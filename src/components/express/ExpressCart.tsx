"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Minus, Plus, Info, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import LoginModal from "@/src/components/modals/LoginModal";
import { CartService } from "@/src/lib/services/cart";
import { getCookie } from "cookies-next";
import { Button } from "../../components/ui/button";
import Loader from "@/src/components/loader";
import { trackEvent } from "@/src/lib/analytics";
import CartItemRow from "./CartItemRow";

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
        unitPrice?: number | string;
        subTotal?: number | string;
        taxableAmount?: number | string;
        tax?: number | string | TaxItem[];
        taxAmount?: number | string;
        shippingFee?: number | string;
        deliveryFee?: number | string;
        finalTotal?: number | string;
        offerDiscount?: number | string;
        serviceFeeTotal?: number | string;
    };
}

export default function ExpressCart() {
    const [cartData, setCartData] = useState<CartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const t = useTranslations();
    const router = useRouter();
    const fetchingCartRef = useRef(false);

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
        // Prevent duplicate calls
        if (fetchingCartRef.current) {
            return;
        }

        fetchingCartRef.current = true;
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
            fetchingCartRef.current = false;
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
                countryId: getCookie("C_id") as string || "634fb20fc536ea86850a81d4",
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
                countryId: getCookie("C_id") as string || "634fb20fc536ea86850a81d4",
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
    useEffect(() => {
        trackEvent("GOTO_CART");
    }, []);
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
    const handleCheckout = async () => {
        trackEvent("CONTINUE_PAYMENT_CLICK");
        if (checkoutLoading || updating) return; // Prevent multiple clicks during API calls

        if (!isAuthenticated()) {
            // Show login modal if not authenticated
            setShowLoginModal(true);
        } else {
            // User is authenticated, proceed to checkout
            setCheckoutLoading(true);
            try {
                // Refresh cart before checkout to ensure latest data
                await fetchCart(false);
                router.push("/shipping-address");
            } catch (error) {
                console.warn("Error during checkout:", error);
                setCheckoutLoading(false);
            }
        }
    };

    // Handle login success - refresh cart and proceed to checkout
    const handleLoginSuccess = async () => {
        // Wait a bit for the token to be set in cookies
        setTimeout(async () => {
            // Refresh cart to get authenticated user's cart (API should merge guest cart)
            await fetchCart();
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
                    {/* <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
            <p className="mt-4 text-gray-600"> {t("loadingCart")}</p>
          </div> */}
                    <Loader />
                </div>


                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#ededed]">



            {/* Main Content */}
     
                {itemCount === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-12 text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{t("cartEmpty")}</h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{t("cartEmptyMessage")}</p>
                        <Button
                            onClick={() => router.push("/raffles")}
                            className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg transition-colors shadow-lg uppercase text-sm md:text-default gap-2"
                        >
                            {t("browseRaffles")}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Left Column - Shopping Bag */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl shadow-[inset_0_-6px_14px_0_#00000026] p-4 xl:p-6">
                                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                                    {t("myShoppingBag")} ({itemCount} {itemCount === 1 ? t("cartItem") : t("cartItems")})
                                </h2>

                                <div className="space-y-4 sm:space-y-6 max-h-[1000px] overflow-auto px-[6px] cart-list">
                                    {cartItems.map((item, index) => {
                                        const itemId = item.addToCartOnId || item._id || "";
                                        const quantity =
                                            typeof item.quantity === "object"
                                                ? Number(item.quantity?.value) || 1
                                                : Number(item.quantity) || 1;

                                        return (
                                            <CartItemRow
                                                key={index}
                                                item={{
                                                    name: item.name || item.productName,
                                                    price: Number(item.price) || 0,
                                                    image: getProductImage(item),
                                                }}
                                                quantity={quantity}
                                                currency={currency}
                                                isUpdating={updating === itemId}
                                                onIncrease={() => updateQuantity(item, quantity + 1)}
                                                onDecrease={() => updateQuantity(item, quantity - 1)}
                                                onRemove={() => handleRemoveClick(item)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                
                    </div>
                )}






        </div>
    );
}
