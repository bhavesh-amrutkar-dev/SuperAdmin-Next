"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Package, Search, Calendar, CheckCircle2, XCircle, Clock, Truck, ShoppingBag, Info } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { OrderService, type Order, type StoreOrder, type OrderProduct } from "@/src/lib/services/order";
import { PRODUCT_CART } from "@/src/lib/config";
import { Button } from "@/src/components/ui/button";

// Order status codes
const ORDER_STATUS = {
    NEW: 1,
    ACCEPTED: 2,
    CANCELLED: 3,
    PACKED: 4,
    READY_FOR_PICKUP: 5,
    IN_DISPATCH: 6,
    COMPLETED: 7,
};

const getStatusLabel = (status: number, statusName?: string): string => {
    // Use statusName from API if available
    if (statusName && statusName.trim() !== "") {
        return statusName;
    }

    // Handle status 0 or undefined
    if (!status || status === 0) {
        return "Pending";
    }

    switch (status) {
        case ORDER_STATUS.NEW:
            return "New";
        case ORDER_STATUS.ACCEPTED:
            return "Accepted";
        case ORDER_STATUS.CANCELLED:
            return "Cancelled";
        case ORDER_STATUS.PACKED:
            return "Packed";
        case ORDER_STATUS.READY_FOR_PICKUP:
            return "Ready for Pickup";
        case ORDER_STATUS.IN_DISPATCH:
            return "In Transit";
        case ORDER_STATUS.COMPLETED:
            return "Completed";
        default:
            return `Status ${status}`;
    }
};

const getStatusColor = (status: number): string => {
    // Handle status 0 or undefined
    if (!status || status === 0) {
        return "bg-orange-100 text-orange-800";
    }

    switch (status) {
        case ORDER_STATUS.COMPLETED:
            return "bg-green-100 text-green-800";
        case ORDER_STATUS.CANCELLED:
            return "bg-red-100 text-red-800";
        case ORDER_STATUS.IN_DISPATCH:
            return "bg-blue-100 text-blue-800";
        case ORDER_STATUS.READY_FOR_PICKUP:
            return "bg-yellow-100 text-yellow-800";
        case ORDER_STATUS.PACKED:
            return "bg-purple-100 text-purple-800";
        case ORDER_STATUS.ACCEPTED:
            return "bg-blue-100 text-blue-800";
        case ORDER_STATUS.NEW:
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const getStatusIcon = (status: number) => {
    switch (status) {
        case ORDER_STATUS.COMPLETED:
            return <CheckCircle2 className="w-4 h-4" />;
        case ORDER_STATUS.CANCELLED:
            return <XCircle className="w-4 h-4" />;
        case ORDER_STATUS.IN_DISPATCH:
            return <Truck className="w-4 h-4" />;
        case ORDER_STATUS.READY_FOR_PICKUP:
        case ORDER_STATUS.PACKED:
            return <Package className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
    }
};

const getProductImage = (product: any): string => {
    // Try images object first (old API format: {small, thumbnail, image, medium})
    if (product.images) {
        return (
            product.images.small ||
            product.images.thumbnail ||
            product.images.image ||
            product.images.medium ||
            PRODUCT_CART
        );
    }
    // Try image array (raffle format: [{medium, small, thumbnail, large}])
    if (Array.isArray(product.image) && product.image.length > 0) {
        return (
            product.image[0].medium ||
            product.image[0].small ||
            product.image[0].thumbnail ||
            product.image[0].large ||
            PRODUCT_CART
        );
    }
    // Try image as string
    if (typeof product.image === "string" && product.image) {
        return product.image;
    }
    // Fallback to PRODUCT_CART
    return PRODUCT_CART;
};

export default function OrdersPage() {
    const t = useTranslations();
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<number>(0); // 0 = all
    const [timeFilter, setTimeFilter] = useState<number>(3); // 3 = last 3 months (default)

    const fetchOrders = useCallback(() => {
        setLoading(true);
        setError(null);

        const params: any = {
            skip: 0,
            limit: 20,
            status: statusFilter,
            storeType: 0,
        };

        if (searchQuery.trim()) {
            params.search = searchQuery.trim();
        }

        if (timeFilter > 0) {
            const now = Math.floor(Date.now() / 1000);
            const monthsAgo = timeFilter;
            const startDate = Math.floor(
                new Date(Date.now() - monthsAgo * 30 * 24 * 60 * 60 * 1000).getTime() / 1000
            );
            params.startorderTime = startDate;
            params.endorderTime = now;
        }

        OrderService.getOrders(params)
            .then((response) => {
                const data = (response as any)?.data || [];
                setOrders(data || []);
            })
            .catch((err) => {
                try {
                    const errorMessage =
                        err instanceof Error
                            ? err.message
                            : err && typeof err === "object" && "message" in err
                                ? String(err.message)
                                : "Failed to load orders";
                    setError(errorMessage);
                    // eslint-disable-next-line no-console
                    console.error("Error fetching orders:", errorMessage);
                } catch {
                    setError("Unknown error occurred");
                }
                setOrders([]);
            })
            .finally(() => setLoading(false));
    }, [statusFilter, searchQuery, timeFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    const getNumericValue = (value: any): number => {
        if (value === undefined || value === null) return 0;
        if (typeof value === "number") return value;
        if (typeof value === "object" && value !== null) {
            return (value as any).value || (value as any).unit || 0;
        }
        const parsed = parseFloat(String(value));
        return isNaN(parsed) ? 0 : parsed;
    };

    // Helper to check if order is express checkout (ALL products have campaignId)
    const isExpressCheckout = (order: Order): boolean => {
        if (order.storeOrders && order.storeOrders.length > 0) {
            let totalProducts = 0;
            let expressProducts = 0;

            for (const storeOrder of order.storeOrders) {
                if (storeOrder.products && storeOrder.products.length > 0) {
                    for (const product of storeOrder.products) {
                        totalProducts++;
                        if (product.campaignId) {
                            expressProducts++;
                        }
                    }
                }
            }

            // Only consider it express checkout if ALL products are express checkout
            return totalProducts > 0 && expressProducts === totalProducts;
        }
        return false;
    };

    // Helper to extract order total from various possible locations
    const getOrderTotal = (order: Order): number => {
        // First priority: Check accounting object - prioritize unitPrice/finalUnitPrice
        if (order.accounting) {
            // First check finalUnitPrice (most accurate unit price) - always use this if available
            if (order.accounting.finalUnitPrice !== undefined && order.accounting.finalUnitPrice !== null) {
                const finalUnitPrice = getNumericValue(order.accounting.finalUnitPrice);
                // Return finalUnitPrice regardless of value (even if 0)
                // For express checkout, if finalUnitPrice is 0, it will naturally display as 0
                return finalUnitPrice;
            }
            // Then check unitPrice (if it exists in accounting)
            if ((order.accounting as any).unitPrice !== undefined && (order.accounting as any).unitPrice !== null) {
                const unitPrice = getNumericValue((order.accounting as any).unitPrice);
                return unitPrice;
            }
            // Then check finalTotal
            if (order.accounting.finalTotal !== undefined && order.accounting.finalTotal !== null) {
                const finalTotal = getNumericValue(order.accounting.finalTotal);
                if (finalTotal > 0) {
                    return finalTotal;
                }
            }
            if (order.accounting.finalTotalMulti !== undefined && order.accounting.finalTotalMulti !== null) {
                const finalTotalMulti = getNumericValue(order.accounting.finalTotalMulti);
                if (finalTotalMulti > 0) {
                    return finalTotalMulti;
                }
            }
            // Calculate from payBy if available
            if (order.accounting.payBy) {
                const payByTotal =
                    getNumericValue(order.accounting.payBy.card) +
                    getNumericValue(order.accounting.payBy.cash) +
                    getNumericValue(order.accounting.payBy.wallet) +
                    getNumericValue(order.accounting.payBy.rewardWallet);
                if (payByTotal > 0) {
                    return payByTotal;
                }
            }
        }

        // If express checkout order (all products have campaignId) and no accounting data, return 0
        if (isExpressCheckout(order)) {
            return 0;
        }

        // Second priority: Check root level fields
        if (order.finalUnitPrice !== undefined && order.finalUnitPrice !== null) {
            const finalUnitPrice = getNumericValue(order.finalUnitPrice);
            if (finalUnitPrice > 0) {
                return finalUnitPrice;
            }
        }
        if (order.finalTotal !== undefined && order.finalTotal !== null) {
            const finalTotal = getNumericValue(order.finalTotal);
            if (finalTotal > 0) {
                return finalTotal;
            }
        }
        if (order.finalTotalMulti !== undefined && order.finalTotalMulti !== null) {
            const finalTotalMulti = getNumericValue(order.finalTotalMulti);
            if (finalTotalMulti > 0) {
                return finalTotalMulti;
            }
        }
        if (order.totalPrice !== undefined && order.totalPrice !== null) {
            const totalPrice = getNumericValue(order.totalPrice);
            if (totalPrice > 0) {
                return totalPrice;
            }
        }

        // Third priority: Calculate from products (fallback)
        // Exclude express checkout products (with campaignId) from calculation
        if (order.storeOrders && order.storeOrders.length > 0) {
            let calculatedTotal = 0;
            let hasNonExpressProducts = false;

            order.storeOrders.forEach((storeOrder) => {
                if (storeOrder.products && storeOrder.products.length > 0) {
                    storeOrder.products.forEach((product) => {
                        // Only include non-express checkout products in total
                        if (!product.campaignId) {
                            hasNonExpressProducts = true;
                            calculatedTotal += getProductTotal(product, storeOrder);
                        }
                    });
                }
            });

            // If we have non-express products and calculated total > 0, use it
            // OR if we have non-express products but calculated total is 0, still use it (might be free products)
            if (hasNonExpressProducts) {
                return calculatedTotal;
            }
        }

        // Calculate from store orders accounting - check finalUnitPrice first
        if (order.storeOrders && order.storeOrders.length > 0) {
            let storeTotal = 0;
            let hasFinalUnitPrice = false;

            // First, try to sum finalUnitPrice from all store orders
            for (const so of order.storeOrders) {
                if (so.accounting && so.accounting.finalUnitPrice !== undefined && so.accounting.finalUnitPrice !== null) {
                    storeTotal += getNumericValue(so.accounting.finalUnitPrice);
                    hasFinalUnitPrice = true;
                }
            }

            // If we found finalUnitPrice values, return the sum
            if (hasFinalUnitPrice) {
                return storeTotal;
            }

            // Otherwise, fall back to other accounting fields
            storeTotal = order.storeOrders.reduce((sum, so) => {
                if (so.accounting) {
                    return sum + getNumericValue(
                        so.accounting.finalTotal ||
                        so.accounting.finalTotalMulti ||
                        so.accounting.finalPrice ||
                        (so.accounting.payBy && (
                            getNumericValue(so.accounting.payBy.card) +
                            getNumericValue(so.accounting.payBy.cash) +
                            getNumericValue(so.accounting.payBy.wallet) +
                            getNumericValue(so.accounting.payBy.rewardWallet)
                        ))
                    );
                }
                return sum;
            }, 0);
            if (storeTotal > 0) {
                return storeTotal;
            }
        }

        return 0;
    };

    // Helper to extract store order total
    const getStoreOrderTotal = (storeOrder: StoreOrder): number => {
        if (storeOrder.accounting) {
            if (storeOrder.accounting.finalTotal !== undefined && storeOrder.accounting.finalTotal !== null) {
                return getNumericValue(storeOrder.accounting.finalTotal);
            }
            if (storeOrder.accounting.finalTotalMulti !== undefined && storeOrder.accounting.finalTotalMulti !== null) {
                return getNumericValue(storeOrder.accounting.finalTotalMulti);
            }
            if (storeOrder.accounting.finalUnitPrice !== undefined && storeOrder.accounting.finalUnitPrice !== null) {
                return getNumericValue(storeOrder.accounting.finalUnitPrice);
            }
            if (storeOrder.accounting.finalPrice !== undefined && storeOrder.accounting.finalPrice !== null) {
                return getNumericValue(storeOrder.accounting.finalPrice);
            }
            // Calculate from payBy if available
            if (storeOrder.accounting.payBy) {
                const payByTotal =
                    getNumericValue(storeOrder.accounting.payBy.card) +
                    getNumericValue(storeOrder.accounting.payBy.cash) +
                    getNumericValue(storeOrder.accounting.payBy.wallet) +
                    getNumericValue(storeOrder.accounting.payBy.rewardWallet);
                if (payByTotal > 0) {
                    return payByTotal;
                }
            }
        }
        return 0;
    };

    // Helper to extract product total
    const getProductTotal = (product: OrderProduct, storeOrder?: StoreOrder): number => {
        // First check product.totalPrice (most accurate)
        if (product.totalPrice !== undefined && product.totalPrice !== null) {
            const total = getNumericValue(product.totalPrice);
            if (total > 0) {
                return total;
            }
        }

        // Check product accounting subTotal
        if ((product as any).accounting?.subTotal !== undefined && (product as any).accounting?.subTotal !== null) {
            const total = getNumericValue((product as any).accounting.subTotal);
            if (total > 0) {
                return total;
            }
        }

        // Calculate from unit price * quantity
        if (product.price !== undefined && product.price !== null) {
            const qty = getNumericValue(product.quantity) || 1;
            const unitPrice = getNumericValue(product.price);
            if (unitPrice > 0) {
                return unitPrice * qty;
            }
        }

        // Try product accounting unitPrice
        if ((product as any).accounting?.unitPrice !== undefined && (product as any).accounting?.unitPrice !== null) {
            const qty = getNumericValue(product.quantity) || 1;
            const unitPrice = getNumericValue((product as any).accounting.unitPrice);
            if (unitPrice > 0) {
                return unitPrice * qty;
            }
        }

        // Try store order accounting finalUnitPrice (fallback)
        if (storeOrder?.accounting?.finalUnitPrice) {
            const qty = getNumericValue(product.quantity) || 1;
            const unitPrice = getNumericValue(storeOrder.accounting.finalUnitPrice);
            if (unitPrice > 0) {
                return unitPrice * qty;
            }
        }

        return 0;
    };

    const getStringValue = (value: any): string => {
        if (value === undefined || value === null) return "";
        if (typeof value === "string") return value;
        if (typeof value === "object" && value !== null) {
            return (value as any).value || (value as any).unit || "";
        }
        return String(value);
    };

    const formatCurrency = (amount?: number | { value?: number; unit?: number }, currencySymbol?: string | { value?: string; unit?: string }) => {
        const numericAmount = getNumericValue(amount);
        // If amount is 0 or invalid, return formatted 0
        if (numericAmount === 0 || isNaN(numericAmount)) {
            let symbol = "$";
            if (currencySymbol) {
                symbol = getStringValue(currencySymbol) || "$";
            }
            return `${symbol}0.00`;
        }
        let symbol = "$";
        if (currencySymbol) {
            symbol = getStringValue(currencySymbol) || "$";
        }
        return `${symbol}${numericAmount.toFixed(2)}`;
    };


    if (loading && orders.length === 0) {
        return (
            <main>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-lg text-[#797979]">{t("loading") || "Loading..."}</div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    return (
        <main>
            <Header />

            <div className="w-full">
                <div className="text-center page-head-wrapper">
                    <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                        {t("myOrders") || "My Orders"}
                    </h1>
                    <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
                        {t("ordersSubtitle") || "View and manage your orders"}
                    </p>
                </div>

                <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
                    {/* Simple Filters */}
                    <div className="mb-8 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("searchOrders") || "Search orders..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border-b-2 border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(Number(e.target.value))}
                            className="px-4 py-2.5 text-sm border-b-2 border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-transparent"
                        >
                            <option value={0}>{t("allOrders") || "All Orders"}</option>
                            <option value={ORDER_STATUS.COMPLETED}>{t("completed") || "Completed"}</option>
                            <option value={ORDER_STATUS.IN_DISPATCH}>{t("inTransit") || "In Transit"}</option>
                            <option value={ORDER_STATUS.CANCELLED}>{t("cancelled") || "Cancelled"}</option>
                        </select>
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(Number(e.target.value))}
                            className="px-4 py-2.5 text-sm border-b-2 border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-transparent"
                        >
                            <option value={0}>{t("allTime") || "All Time"}</option>
                            <option value={1}>{t("lastMonth") || "Last Month"}</option>
                            <option value={3}>{t("last3Months") || "Last 3 Months"}</option>
                            <option value={12}>{t("last12Months") || "Last 12 Months"}</option>
                        </select>
                    </div>

                    {/* Orders List */}
                    {error ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <div className="text-sm sm:text-base md:text-lg text-red-600">Error: {error}</div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[40vh]">
                            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-300 mb-3 sm:mb-4" />
                            <p className="text-sm sm:text-base md:text-lg text-[#797979]">{t("noOrdersFound") || "No orders found"}</p>
                            <Button
                                asChild
                                variant="primary"
                                size="default"
                                className="mt-3 sm:mt-4"
                            >
                                <Link href="/raffles">
                                    {t("startShopping") || "Start Shopping"}
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div
                                    key={order.orderId || order.masterOrderId}
                                    className="bg-white border-l-4 border-[#D4AF37] shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Order Header - Simple */}
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {order.orderId || order.masterOrderId}
                                                    </h3>
                                                    {order.status && (
                                                        <span
                                                            className={`px-2.5 py-1 rounded text-xs font-medium ${getStatusColor(
                                                                order.status.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(order.status.status, order.status.statusName)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(order.createdAt || order.createdTimeStamp)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {formatCurrency(
                                                        getOrderTotal(order),
                                                        order.currencySymbol ||
                                                        order.accounting?.currencySymbol ||
                                                        order.storeOrders?.[0]?.accounting?.currencySymbol ||
                                                        "$"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store Orders */}
                                    {order.storeOrders && order.storeOrders.length > 0 && (
                                        <div className="px-6 py-4">
                                            {order.storeOrders.map((storeOrder, storeIndex) => (
                                                <div
                                                    key={storeIndex}
                                                    className={storeIndex > 0 ? "mt-6 pt-6 border-t border-gray-100" : ""}
                                                >
                                                    {/* Store Header - Minimal */}
                                                    {storeOrder.storeName && (
                                                        <div className="flex items-center gap-2 mb-4">
                                                            {storeOrder.storeLogo?.logoImageweb && (
                                                                <Image
                                                                    src={storeOrder.storeLogo.logoImageweb}
                                                                    alt={storeOrder.storeName}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded object-cover"
                                                                    unoptimized
                                                                />
                                                            )}
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {storeOrder.storeName}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Products - Simple List */}
                                                    {storeOrder.products && storeOrder.products.length > 0 && (
                                                        <div className="space-y-3">
                                                            {storeOrder.products.map((product, productIndex) => (
                                                                <div
                                                                    key={productIndex}
                                                                    className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                                                                        <Image
                                                                            src={getProductImage(product)}
                                                                            alt={product.name || "Product"}
                                                                            fill
                                                                            className="object-cover"
                                                                            unoptimized
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className="font-medium text-gray-900 mb-1 text-sm break-words">
                                                                            {product.name || product.productId || t("product") || "Product"}
                                                                        </h5>
                                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                            <span>Qty: {getNumericValue(product.quantity) || 1}</span>
                                                                            {product.campaignId && (
                                                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                                                    {t("entries") || "ENTRIES"}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-semibold text-gray-900">
                                                                            {formatCurrency(
                                                                                getProductTotal(product, storeOrder),
                                                                                storeOrder.accounting?.currencySymbol ||
                                                                                order.currencySymbol ||
                                                                                order.accounting?.currencySymbol ||
                                                                                "$"
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* More Details Button - Bottom */}
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
                                        <Button
                                            asChild
                                            className="w-auto bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg transition-colors shadow-lg text-sm md:text-default gap-2"
                                        >
                                            <Link href={`/orders/${order.orderId || order.masterOrderId}`}>
                                                <Info size={18} />
                                                {t("moreDetails") || "More Details"}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

