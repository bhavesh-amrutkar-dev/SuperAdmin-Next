"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Package, Search, Filter, Calendar, CheckCircle2, XCircle, Clock, Truck, ShoppingBag } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { OrderService, type Order, type StoreOrder } from "@/src/lib/services/order";
import { PRODUCT_CART } from "@/src/lib/config";

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

const getStatusLabel = (status: number): string => {
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
            return "Unknown";
    }
};

const getStatusColor = (status: number): string => {
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
    const [timeFilter, setTimeFilter] = useState<number>(0); // 0 = all

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
        let symbol = "$";
        if (currencySymbol) {
            symbol = getStringValue(currencySymbol) || "$";
        }
        return `${symbol}${numericAmount.toFixed(2)}`;
    };

    const handleReorder = async (order: Order) => {
        try {
            await OrderService.reorder({ orderId: order.masterOrderId || order.orderId });
            alert(t("reorderSuccess") || "Items added to cart successfully!");
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Error reordering:", err);
            alert(t("reorderError") || "Failed to add items to cart");
        }
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

                <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-12">
                    {/* Filters */}
                    <div className="mb-8 space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("searchOrders") || "Search orders..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent"
                            />
                        </div>

                        {/* Status and Time Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2f2f2f] mb-2">
                                    <Filter className="w-4 h-4 inline mr-2" />
                                    {t("filterByStatus") || "Filter by Status"}
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent bg-white"
                                >
                                    <option value={0}>{t("allOrders") || "All Orders"}</option>
                                    <option value={ORDER_STATUS.NEW}>{t("new") || "New"}</option>
                                    <option value={ORDER_STATUS.ACCEPTED}>{t("accepted") || "Accepted"}</option>
                                    <option value={ORDER_STATUS.PACKED}>{t("packed") || "Packed"}</option>
                                    <option value={ORDER_STATUS.READY_FOR_PICKUP}>
                                        {t("readyForPickup") || "Ready for Pickup"}
                                    </option>
                                    <option value={ORDER_STATUS.IN_DISPATCH}>{t("inTransit") || "In Transit"}</option>
                                    <option value={ORDER_STATUS.COMPLETED}>{t("completed") || "Completed"}</option>
                                    <option value={ORDER_STATUS.CANCELLED}>{t("cancelled") || "Cancelled"}</option>
                                </select>
                            </div>

                            {/* Time Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2f2f2f] mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    {t("filterByTime") || "Filter by Time"}
                                </label>
                                <select
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c200] focus:border-transparent bg-white"
                                >
                                    <option value={0}>{t("allTime") || "All Time"}</option>
                                    <option value={1}>{t("lastMonth") || "Last Month"}</option>
                                    <option value={3}>{t("last3Months") || "Last 3 Months"}</option>
                                    <option value={12}>{t("last12Months") || "Last 12 Months"}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    {error ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <div className="text-lg text-red-600">Error: {error}</div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[40vh]">
                            <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
                            <p className="text-lg text-[#797979]">{t("noOrdersFound") || "No orders found"}</p>
                            <Link
                                href="/reffles"
                                className="mt-4 px-6 py-2 bg-[#f3c200] text-[#2f2f2f] rounded-lg font-semibold hover:bg-[#e6b800] transition-colors"
                            >
                                {t("startShopping") || "Start Shopping"}
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div
                                    key={order.orderId || order.masterOrderId}
                                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                                >
                                    {/* Order Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-[#2f2f2f]">
                                                        {t("orderId") || "Order ID"}: {order.orderId || order.masterOrderId}
                                                    </h3>
                                                    {order.status && (
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                                                                order.status.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(order.status.status)}
                                                            {getStatusLabel(order.status.status)}
                                                        </span>
                                                    )}
                                                </div>
                                                {order.createdAt && (
                                                    <p className="text-sm text-[#797979]">
                                                        {t("orderedOn") || "Ordered on"}: {formatDate(order.createdAt)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-[#2f2f2f]">
                                                    {formatCurrency(order.totalPrice, order.currencySymbol)}
                                                </p>
                                                {order.status?.status !== ORDER_STATUS.CANCELLED && (
                                                    <button
                                                        onClick={() => handleReorder(order)}
                                                        className="mt-2 text-sm text-[#f3c200] hover:text-[#e6b800] font-semibold"
                                                    >
                                                        {t("reorder") || "Reorder"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store Orders */}
                                    {order.storeOrders && order.storeOrders.length > 0 && (
                                        <div className="p-6">
                                            {order.storeOrders.map((storeOrder, storeIndex) => (
                                                <div
                                                    key={storeIndex}
                                                    className={storeIndex > 0 ? "mt-6 pt-6 border-t border-gray-200" : ""}
                                                >
                                                    {/* Store Header */}
                                                    <div className="flex items-center gap-3 mb-4">
                                                        {storeOrder.storeLogo?.logoImageweb && (
                                                            <Image
                                                                src={storeOrder.storeLogo.logoImageweb}
                                                                alt={storeOrder.storeName || "Store"}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full object-cover"
                                                                unoptimized
                                                            />
                                                        )}
                                                        <div>
                                                            <h4 className="font-semibold text-[#2f2f2f]">
                                                                {storeOrder.storeName}
                                                            </h4>
                                                            {storeOrder.storeOrderId && (
                                                                <p className="text-sm text-[#797979]">
                                                                    {t("storeOrderId") || "Store Order"}:{" "}
                                                                    {storeOrder.storeOrderId}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Products */}
                                                    {storeOrder.products && storeOrder.products.length > 0 && (
                                                        <div className="space-y-4">
                                                            {storeOrder.products.map((product, productIndex) => (
                                                                <div
                                                                    key={productIndex}
                                                                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                                                                >
                                                                    {/* Product Image */}
                                                                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                                                                        <Image
                                                                            src={getProductImage(product)}
                                                                            alt={product.name || "Product"}
                                                                            fill
                                                                            className="object-cover"
                                                                            unoptimized
                                                                        />
                                                                    </div>

                                                                    {/* Product Details */}
                                                                    <div className="flex-grow">
                                                                        <h5 className="font-semibold text-[#2f2f2f] mb-1">
                                                                            {product.name || t("product") || "Product"}
                                                                        </h5>
                                                                        {product.campaignId && (
                                                                            <span className="inline-block px-2 py-1 bg-[#f3c200] text-[#2f2f2f] text-xs font-semibold rounded mb-2">
                                                                                {t("entries") || "Entries"}
                                                                            </span>
                                                                        )}
                                                                        <div className="flex items-center gap-4 text-sm text-[#797979]">
                                                                            <span>
                                                                                {t("quantity") || "Qty"}: {getNumericValue(product.quantity) || 1}
                                                                            </span>
                                                                            <span>
                                                                                {t("price") || "Price"}: {formatCurrency(product.price, order.currencySymbol)}
                                                                            </span>
                                                                        </div>
                                                                        {product.status && (
                                                                            <div className="mt-2">
                                                                                <span
                                                                                    className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                                                                                        product.status.status
                                                                                    )}`}
                                                                                >
                                                                                    {getStatusLabel(product.status.status)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Product Total */}
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-[#2f2f2f]">
                                                                            {formatCurrency(product.totalPrice || product.price, order.currencySymbol)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Store Total */}
                                                    {storeOrder.accounting && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                                            <div className="text-right">
                                                                <p className="text-sm text-[#797979]">
                                                                    {t("storeTotal") || "Store Total"}:
                                                                </p>
                                                                <p className="text-xl font-bold text-[#2f2f2f]">
                                                                    {formatCurrency(
                                                                        storeOrder.accounting.finalPrice,
                                                                        storeOrder.accounting.currencySymbol
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Order Actions */}
                                    {/* <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
                                        <Link
                                            href={`/orders/${order.orderId || order.masterOrderId}`}
                                            className="px-4 py-2 bg-[#2f2f2f] text-white rounded-lg font-semibold hover:bg-[#f3c200] hover:text-[#2f2f2f] transition-colors"
                                        >
                                            {t("viewDetails") || "View Details"}
                                        </Link>
                                        {order.status?.status === ORDER_STATUS.COMPLETED && (
                                            <button
                                                onClick={() => handleReorder(order)}
                                                className="px-4 py-2 border-2 border-[#2f2f2f] text-[#2f2f2f] rounded-lg font-semibold hover:bg-[#2f2f2f] hover:text-white transition-colors"
                                            >
                                                {t("reorder") || "Reorder"}
                                            </button>
                                        )}
                                    </div> */}
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

