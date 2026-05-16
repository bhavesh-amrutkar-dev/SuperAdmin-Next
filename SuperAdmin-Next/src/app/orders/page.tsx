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

    // ✅ Force Purchased when completed (Delivered)
    if (status === ORDER_STATUS.COMPLETED) {
        return t("orderStatus.purchased");
        // or return "Purchased" if not using translation
    }

    // fallback to backend statusText
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
        default:
            return t("orderStatus.unknown", { status });
    }
};
const getProductStatusLabel = (
    t: any,
    product: OrderProduct
): string => {
    const status = product?.status?.status;
    const statusText = product?.status?.statusText;

    // ✅ iOS logic (highest priority)
    if (status === 0) {
        return t("orderStatus.processing") || "Processing your payment";
    }

    // ✅ fallback to your existing logic
    return getStatusLabel(t, status, statusText);
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
const getProductStatusColor = (product: OrderProduct): string => {
    const status = product?.status?.status;

    if (status === 0) {
        return "bg-orange-100 text-orange-800"; // processing color
    }

    return getStatusColor(status);
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
const getProductStatusIcon = (product: OrderProduct) => {
    const status = product?.status?.status;

    if (status === 0) {
        return <Clock className="w-4 h-4" />;
    }

    return getStatusIcon(status);
};
const getProductNote = (product: OrderProduct): string | null => {
    const status = product?.status?.status;

    if (status === 0) {
        if ((product as any)?.payment_receipt_link) {
            return "Your bank receipt could not be processed. Please wait while admin reviews it.";
        }

        return "Your payment is being securely processed. Your order will be confirmed once completed.";
    }

    return null;
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

        const date = new Date(ts * 1000);

        const day = date.getDate();
        const month = date.toLocaleString(locale === "es" ? "es-ES" : "en-US", {
            month: "short",
        });
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");

        const formattedHours = hours % 12 || 12;
        const ampm = hours >= 12 ? "pm" : "am";

        const getOrdinal = (n: number) => {
            if (n > 3 && n < 21) return "th";
            switch (n % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${day}${getOrdinal(day)} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
    };
    const getTotalProductCount = (order: Order) => {
        return order.storeOrders?.reduce((total, storeOrder) => {
            return (
                total +
                (storeOrder.products?.reduce(
                    (sum, p) => sum + getNumericValue(p.quantity),
                    0
                ) || 0)
            );
        }, 0) || 0;
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
                    <h1 className="pt-2 pb-2 text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white">
                        {t("myOrders")}
                    </h1>
                    <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
                        {t("trackPurchases")}
                    </p>
                </div>

                {/* Content */}
                <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 pt-10 pb-5 xl:pb-7">

                    {/* Search + Filter */}
                    <div className="mb-6 border-b border-gray-300 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-lg lg:text-2xl font-bold text-[#2f2f2f] uppercase tracking-tight flex items-center gap-2">
                            <span className="bg-[#f3c200] text-[#2f2f2f] py-1 px-3 text-lg rounded-lg leading-none">
                                {orders.length}
                            </span>
                            {t("orders")}
                        </h2>

                        <div className="flex gap-4 w-full md:w-auto">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("searchOrders")}
                                className="w-full md:w-[300px] px-4 py-2 rounded-xl border !border-[#2f2f2f] focus:outline-none focus:!border-[#f3c200]"
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(Number(e.target.value))}
                                className="px-4 py-2 rounded-xl border !border-[#2f2f2f] focus:outline-none focus:!border-[#f3c200]"
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
                            <p className="text-lg text-[#797979]">{t("noOrderAvl")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1  gap-6">
                            {orders.map((order) => {
                                const total = getOrderTotal(order);
                                const currency = normalizeCurrencySymbol(
                                    order.accounting?.currencySymbol
                                );

                                return (
                                    <div
                                        key={order.orderId}
                                        className="group relative bg-white rounded-3xl border border-[#e5e5e5] shadow-sm hover:shadow-xl transition-all duration-300 p-5 sm:p-6"
                                    >
                                        {/* Subtle Gold Accent */}
                                        <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-[#FECB02] shadow-[0_1px_6px_rgba(254,203,2,0.4)] p-2" />

                                        {/* Header */}

                                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">

                                            {/* LEFT */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg sm:text-xl font-semibold text-[#2F2F2F] tracking-tight truncate">
                                                    #{order.orderId}
                                                </h3>

                                                <div className="mt-1 text-xs sm:text-sm text-[#797979] flex flex-wrap items-center gap-2">
                                                    <span>
                                                        {t("orderedOn")} {formatDate(order.createdTimeStamp)}
                                                    </span>

                                                    <span className="w-1 h-1 bg-[#FECB02] rounded-full"></span>

                                                    <span className="font-medium text-[#2F2F2F] whitespace-nowrap">
                                                        {getTotalProductCount(order)}{" "}
                                                        {getTotalProductCount(order) === 1 ? "Product" : "Products"}
                                                    </span>
                                                    {/* Mobile Status */}
                                                    <span
                                                        className={`sm:hidden mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide w-fit ${getStatusColor(
                                                            order.status?.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(order.status?.status)}
                                                        {getStatusLabel(
                                                            t,
                                                            order.status?.status,
                                                            order.status?.statusText
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* RIGHT */}
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <div className="text-right">
                                                    <div className="text-lg sm:text-2xl font-bold text-[#2F2F2F]">
                                                        {formatCurrency(total, currency)}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#797979]">
                                                        {t("total")}
                                                    </div>
                                                </div>

                                                {/* Desktop Status */}
                                                {/* <span
                                                    className={`hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(
                                                        order.status?.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(order.status?.status)}
                                                    {getStatusLabel(
                                                        t,
                                                        order.status?.status,
                                                        order.status?.statusText
                                                    )}
                                                </span> */}
                                            </div>

                                        </div>

                                        {/* Products */}
                                        <div className="mt-6 space-y-4">
                                            {order.storeOrders?.map((storeOrder, i) => (
                                                <div key={i} className="space-y-3">
                                                    {storeOrder.products?.map((product, index) => {
                                                        const note = getProductNote(product);

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="flex flex-col md:flex-row md:items-center gap-5 bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors p-4 rounded-2xl border border-transparent hover:border-[#FECB02]/40"
                                                            >
                                                                {/* Image */}
                                                                <div className="w-full md:w-[90px] h-[150px] md:h-[90px] flex items-center justify-center bg-white rounded-xl border border-gray-100 overflow-hidden">
                                                                    <Image
                                                                        src={getProductImage(product)}
                                                                        alt={product.name ?? "Product image"}
                                                                        width={90}
                                                                        height={90}
                                                                        className="p-2 object-contain w-full h-full"
                                                                        unoptimized
                                                                    />
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1">
                                                                    <h4 className="text-base font-semibold text-[#2F2F2F] line-clamp-2">
                                                                        {product.name}
                                                                    </h4>

                                                                    {/* Quantity */}
                                                                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-medium text-[#2F2F2F] uppercase tracking-wide">
                                                                        {t("quantity")}: {getNumericValue(product.quantity)}
                                                                    </div>

                                                                    {/* ✅ Product Status */}
                                                                    <div className="mt-2">
                                                                        <span
                                                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getProductStatusColor(
                                                                                product
                                                                            )}`}
                                                                        >
                                                                            {getProductStatusIcon(product)}
                                                                            {getProductStatusLabel(t, product)}
                                                                        </span>
                                                                    </div>

                                                                    {/* ✅ Optional Note */}
                                                                    {note && (
                                                                        <p className="text-xs text-[#797979] mt-2 leading-relaxed">
                                                                            {note}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Price */}
                                                                <div className="text-lg font-semibold text-[#2F2F2F]">
                                                                    {formatCurrency(
                                                                        getProductTotal(product),
                                                                        currency
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-6 flex justify-end">
                                            <Link
                                                href={`/orders/${order.orderId}`}
                                                className="btn-primary text-sm py-2 px-6 font-semibold uppercase tracking-wide"
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