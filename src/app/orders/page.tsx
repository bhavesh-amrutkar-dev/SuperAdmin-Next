"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import {
    Package,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Truck,
    ShoppingBag,
    Info,
} from "lucide-react";

import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import {
    OrderService,
    type Order,
    type StoreOrder,
    type OrderProduct,
} from "@/src/lib/services/order";
import { PRODUCT_CART } from "@/src/lib/config";
import { Button } from "@/src/components/ui/button";
import Loader from "@/src/components/loader";

/* ===============================
   ORDER STATUS
================================ */

const ORDER_STATUS = {
    NEW: 1,
    ACCEPTED: 2,
    CANCELLED: 3,
    PACKED: 4,
    READY_FOR_PICKUP: 5,
    IN_DISPATCH: 6,
    COMPLETED: 7,
};

const getStatusLabel = (
    t: any,
    status?: number,
    statusText?: string
): string => {
    if (statusText?.trim()) return statusText;

    if (!status) return t("orderStatus.processing");

    switch (status) {
        case ORDER_STATUS.NEW:
            return t("orderStatus.new");
        case ORDER_STATUS.ACCEPTED:
            return t("orderStatus.accepted");
        case ORDER_STATUS.CANCELLED:
            return t("orderStatus.cancelled");
        case ORDER_STATUS.PACKED:
            return t("orderStatus.packed");
        case ORDER_STATUS.READY_FOR_PICKUP:
            return t("orderStatus.readyForPickup");
        case ORDER_STATUS.IN_DISPATCH:
            return t("orderStatus.inDispatch");
        case ORDER_STATUS.COMPLETED:
            return t("orderStatus.completed");
        default:
            return t("orderStatus.unknown", { status });
    }
};
const getStatusColor = (status?: number): string => {
    if (!status) return "bg-orange-100 text-orange-800";

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
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const getStatusIcon = (status?: number) => {
    switch (status) {
        case ORDER_STATUS.COMPLETED:
            return <CheckCircle2 className="w-4 h-4" />;
        case ORDER_STATUS.CANCELLED:
            return <XCircle className="w-4 h-4" />;
        case ORDER_STATUS.IN_DISPATCH:
            return <Truck className="w-4 h-4" />;
        case ORDER_STATUS.PACKED:
        case ORDER_STATUS.READY_FOR_PICKUP:
            return <Package className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
    }
};
const getSourceLabel = (t: any, source?: string): string => {
    if (!source) return "-";

    switch (source) {
        case "By_User":
            return t("orderSource.byUser");
        case "By_Admin":
            return t("orderSource.byAdmin");
        case "AMOE_Ticket":
            return t("orderSource.amoeTicket");
        case "CSV_Import":
            return t("orderSource.csvImport");
        default:
            return source;
    }
};
/* ===============================
   HELPERS
================================ */

const getNumericValue = (value: any): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "object" && "value" in value)
        return Number(value.value) || 0;
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (amount: number, symbol = "$") => {
    return `${symbol}${amount.toFixed(2)}`;
};

const normalizeTimestamp = (ts?: number) => {
    if (!ts) return 0;
    return ts > 9999999999 ? Math.floor(ts / 1000) : ts;
};

const getProductImage = (product: any): string => {
    if (product?.images) {
        return (
            product.images.small ||
            product.images.medium ||
            product.images.thumbnail ||
            PRODUCT_CART
        );
    }

    if (Array.isArray(product?.image) && product.image.length > 0) {
        return (
            product.image[0]?.medium ||
            product.image[0]?.small ||
            PRODUCT_CART
        );
    }

    if (typeof product?.image === "string") return product.image;

    return PRODUCT_CART;
};

/* ===============================
   TOTAL CALCULATIONS
================================ */

const getProductTotal = (product: OrderProduct): number => {
    // 1️⃣ singleUnitPrice.subTotal (best source)
    if ((product as any)?.singleUnitPrice?.subTotal !== undefined) {
        return getNumericValue(
            (product as any).singleUnitPrice.subTotal
        );
    }

    // 2️⃣ accounting.subTotal
    if ((product as any)?.accounting?.subTotal !== undefined) {
        return getNumericValue(
            (product as any).accounting.subTotal
        );
    }

    // 3️⃣ unitPrice * quantity
    const qty = getNumericValue(product.quantity) || 1;

    if ((product as any)?.singleUnitPrice?.finalUnitPrice) {
        return (
            getNumericValue(
                (product as any).singleUnitPrice.finalUnitPrice
            ) * qty
        );
    }

    if ((product as any)?.accounting?.unitPrice) {
        return (
            getNumericValue((product as any).accounting.unitPrice) *
            qty
        );
    }

    return 0;
};

const getStoreOrderTotal = (storeOrder: StoreOrder): number => {
    if (!storeOrder?.accounting) return 0;

    const acc = storeOrder.accounting;

    if (acc.finalTotal !== undefined)
        return getNumericValue(acc.finalTotal);

    if (acc.finalTotalMulti !== undefined)
        return getNumericValue(acc.finalTotalMulti);

    if (acc.unitPriceWithTax !== undefined)
        return getNumericValue(acc.unitPriceWithTax);

    if (acc.payBy) {
        return (
            getNumericValue(acc.payBy.card) +
            getNumericValue(acc.payBy.cash) +
            getNumericValue(acc.payBy.wallet) +
            getNumericValue(acc.payBy.rewardWallet)
        );
    }

    return 0;
};

const getOrderTotal = (order: Order): number => {
    if (order?.accounting) {
        const acc = order.accounting;

        if (acc.finalTotal !== undefined)
            return getNumericValue(acc.finalTotal);

        if (acc.finalTotalMulti !== undefined)
            return getNumericValue(acc.finalTotalMulti);

        if (acc.unitPriceWithTax !== undefined)
            return getNumericValue(acc.unitPriceWithTax);

        if (acc.payBy) {
            return (
                getNumericValue(acc.payBy.card) +
                getNumericValue(acc.payBy.cash) +
                getNumericValue(acc.payBy.wallet) +
                getNumericValue(acc.payBy.rewardWallet)
            );
        }
    }

    // fallback from store orders
    if (order.storeOrders?.length) {
        return order.storeOrders.reduce(
            (sum, so) => sum + getStoreOrderTotal(so),
            0
        );
    }

    return 0;
};

/* ===============================
   COMPONENT
================================ */

export default function OrdersPage() {
    const t = useTranslations();
    const locale = useLocale();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState<number>(0);

    /* ===== Debounce Search ===== */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    /* ===== Fetch Orders ===== */
    const fetchOrders = useCallback(() => {
        setLoading(true);
        setError(null);

        const params: any = {
            skip: 0,
            limit: 20,
            status: statusFilter,
        };

        if (debouncedSearch.trim())
            params.search = debouncedSearch.trim();

        OrderService.getOrders(params)
            .then((res: any) => {
                setOrders(res?.data || []);
            })
            .catch((err) => {
                setError(err?.message || "Failed to load orders");
                setOrders([]);
            })
            .finally(() => setLoading(false));
    }, [statusFilter, debouncedSearch]);
    const normalizeCurrencySymbol = (
        symbol?: string | { value?: string; unit?: string }
    ): string => {
        if (!symbol) return "$";

        if (typeof symbol === "string") return symbol;

        // object case
        return symbol.value || symbol.unit || "$";
    };
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatDate = (timestamp?: number) => {
        const ts = normalizeTimestamp(timestamp);
        if (!ts) return "";
        return new Date(ts * 1000).toLocaleString(
            locale === "es" ? "es-ES" : "en-US"
        );
    };

    if (loading && !orders.length) {
        return (
            <main>
                <Header />
                <div className="flex justify-center min-h-[60vh] items-center">
                    <Loader />
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }
    const getSourceColor = (source?: string) => {
        switch (source) {
            case "By_User":
                return "bg-blue-100 text-blue-800";
            case "By_Admin":
                return "bg-purple-100 text-purple-800";
            case "AMOE_Ticket":
                return "bg-green-100 text-green-800";
            case "CSV_Import":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (
        <main>
            <Header />

            {/* Page Header (same style as raffles) */}
            <div className="w-full">
                <div className="text-center page-head-wrapper">
                    <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white">
                        {t("myOrders")}
                    </h1>
                    <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
                        {t("trackPurchases")}
                    </p>
                </div>

                {/* Content */}
                <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 pt-10 lg:pt-[60px] pb-16">

                    {/* Search + Filter */}
                    <div className="mb-8 border-b border-gray-300 pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <h2 className="text-lg lg:text-2xl font-bold text-[#2f2f2f] uppercase tracking-tight flex items-center gap-2">
                            <span className="bg-[#f3c200] text-[#2f2f2f] py-1 px-3 text-lg rounded-lg leading-none">
                                {orders.length}
                            </span>
                            {t("orders")}
                        </h2>

                        <div className="flex gap-4 w-full lg:w-auto">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("searchOrders")}
                                className="w-full lg:w-[300px] px-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f3c200]"
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(Number(e.target.value))}
                                className="px-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#f3c200]"
                            >
                                <option value={0}>{t("all")}</option>
                                <option value={7}>{t("completed")}</option>
                                <option value={6}>{t("inTransit")}</option>
                                <option value={3}>{t("cancelled")}</option>
                            </select>
                        </div>
                    </div>

                    {/* Orders */}
                    {error ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <p className="text-lg text-[#797979]">{error}</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <p className="text-lg text-[#797979]">No orders available</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {orders.map((order) => {
                                const total = getOrderTotal(order);
                                const currency = normalizeCurrencySymbol(
                                    order.accounting?.currencySymbol
                                );

                                return (
                                    <div
                                        key={order.orderId}
                                        className="bg-white rounded-4xl shadow-xl hover:shadow-2xl transition-shadow p-6"
                                    >
                                        {/* Order Top */}
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-gray-200 pb-5 mb-5">

                                            <div>
                                                <h3 className="text-xl font-black text-[#2f2f2f] tracking-tight">
                                                    {order.orderId}
                                                </h3>
                                                <p className="text-sm text-[#797979] mt-1">
                                                    {formatDate(order.createdTimeStamp)}
                                                </p>

                                                {order.source && (
                                                    <p className={`text-xs mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full uppercase font-semibold tracking-wide ${getSourceColor(order.source)}`}>
                                                        <Info className="w-3 h-3" />
                                                        {getSourceLabel(t, order.source)}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-[#2f2f2f]">
                                                        {formatCurrency(total, currency)}
                                                    </div>
                                                    <div className="text-xs uppercase text-[#797979]">
                                                        {t("total")}
                                                    </div>
                                                </div>

                                                <span
                                                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${getStatusColor(
                                                        order.status?.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        t,
                                                        order.status?.status,
                                                        order.status?.statusText
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Products */}
                                        <div className="space-y-6">
                                            {order.storeOrders?.map((storeOrder, i) => (
                                                <div key={i} className="space-y-4">
                                                    {storeOrder.products?.map((product, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex flex-col md:flex-row md:items-center gap-6 bg-gray-50 p-4 rounded-3xl"
                                                        >
                                                            <div className="w-full md:w-[140px] h-[140px] flex items-center justify-center bg-white rounded-3xl overflow-hidden">
                                                                <Image
                                                                    src={getProductImage(product)}
                                                                    alt={product.name ?? "Product image"}
                                                                    width={140}
                                                                    height={140}
                                                                    className="object-contain w-full h-full"
                                                                    unoptimized
                                                                />
                                                            </div>

                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-bold text-[#2f2f2f] line-clamp-2">
                                                                    {product.name}
                                                                </h4>

                                                                <div className="text-sm text-[#797979] mt-2 uppercase">
                                                                    {t("quantity")}: {getNumericValue(product.quantity)}
                                                                </div>
                                                            </div>

                                                            <div className="text-xl font-black text-[#2f2f2f]">
                                                                {formatCurrency(
                                                                    getProductTotal(product),
                                                                    currency
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Bottom Button */}
                                        <div className="mt-6 flex justify-end">
                                            <Link
                                                href={`/orders/${order.orderId}`}
                                                className="bg-[#2f2f2f] text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-wide hover:bg-[#f3c200] hover:text-[#2f2f2f] transition-colors"
                                            >
                                                {t("viewDetails")}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}