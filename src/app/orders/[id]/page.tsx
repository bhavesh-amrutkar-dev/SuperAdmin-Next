"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, CheckCircle2, XCircle, Clock, Truck, Calendar, MapPin, CreditCard, RefreshCw, AlertCircle } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { OrderService, type Order, type StoreOrder, type OrderProduct } from "@/src/lib/services/order";
import { PRODUCT_CART } from "@/src/lib/config";
import { Button } from "@/src/components/ui/button";
import Loader from "@/src/components/loader";

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
    if (statusName && statusName.trim() !== "") {
        return statusName;
    }
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
            return <CheckCircle2 className="w-5 h-5" />;
        case ORDER_STATUS.CANCELLED:
            return <XCircle className="w-5 h-5" />;
        case ORDER_STATUS.IN_DISPATCH:
            return <Truck className="w-5 h-5" />;
        case ORDER_STATUS.READY_FOR_PICKUP:
        case ORDER_STATUS.PACKED:
            return <Package className="w-5 h-5" />;
        default:
            return <Clock className="w-5 h-5" />;
    }
};

const getProductImage = (product: any): string => {
    if (product.images) {
        return (
            product.images.small ||
            product.images.thumbnail ||
            product.images.image ||
            product.images.medium ||
            PRODUCT_CART
        );
    }
    if (Array.isArray(product.image) && product.image.length > 0) {
        return (
            product.image[0].medium ||
            product.image[0].small ||
            product.image[0].thumbnail ||
            product.image[0].large ||
            PRODUCT_CART
        );
    }
    if (typeof product.image === "string" && product.image) {
        return product.image;
    }
    return PRODUCT_CART;
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

const getProductTotal = (product: OrderProduct, storeOrder?: StoreOrder): number => {
    if (product.totalPrice !== undefined && product.totalPrice !== null) {
        const total = getNumericValue(product.totalPrice);
        if (total > 0) {
            return total;
        }
    }
    if ((product as any).accounting?.subTotal !== undefined && (product as any).accounting?.subTotal !== null) {
        const total = getNumericValue((product as any).accounting.subTotal);
        if (total > 0) {
            return total;
        }
    }
    if (product.price !== undefined && product.price !== null) {
        const qty = getNumericValue(product.quantity) || 1;
        const unitPrice = getNumericValue(product.price);
        if (unitPrice > 0) {
            return unitPrice * qty;
        }
    }
    if ((product as any).accounting?.unitPrice !== undefined && (product as any).accounting?.unitPrice !== null) {
        const qty = getNumericValue(product.quantity) || 1;
        const unitPrice = getNumericValue((product as any).accounting.unitPrice);
        if (unitPrice > 0) {
            return unitPrice * qty;
        }
    }
    if (storeOrder?.accounting?.finalUnitPrice) {
        const qty = getNumericValue(product.quantity) || 1;
        const unitPrice = getNumericValue(storeOrder.accounting.finalUnitPrice);
        if (unitPrice > 0) {
            return unitPrice * qty;
        }
    }
    return 0;
};

const getOrderTotal = (order: Order): number => {
    if (order.accounting) {
        if (order.accounting.finalUnitPrice !== undefined && order.accounting.finalUnitPrice !== null) {
            return getNumericValue(order.accounting.finalUnitPrice);
        }
        if ((order.accounting as any).unitPrice !== undefined && (order.accounting as any).unitPrice !== null) {
            return getNumericValue((order.accounting as any).unitPrice);
        }
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
    if (order.totalPrice !== undefined && order.totalPrice !== null) {
        const totalPrice = getNumericValue(order.totalPrice);
        if (totalPrice > 0) {
            return totalPrice;
        }
    }
    return 0;
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations();
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retrying, setRetrying] = useState(false);

    const orderId = params.id as string;

    const fetchOrderDetails = async () => {
        if (!orderId) {
            setError("Order ID is required");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await OrderService.getOrderDetails(orderId);
            const data = (response as any)?.data;
            if (data) {
                setOrder(data);
                setError(null);
            } else {
                setError("Order not found");
            }
        } catch (err) {
            let errorMessage = "Failed to load order details";

            try {
                // Try to extract error message from API response
                const axiosErr = err as any;
                const backendMsg = axiosErr?.response?.data?.message;

                if (backendMsg) {
                    errorMessage = backendMsg;
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                } else if (err && typeof err === "object" && "message" in err) {
                    errorMessage = String(err.message);
                }
            } catch {
                errorMessage = "Failed to load order details";
            }

            setError(errorMessage);
            console.warn("Error fetching order details:", errorMessage);
        } finally {
            setLoading(false);
            setRetrying(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const handleRetry = () => {
        setRetrying(true);
        fetchOrderDetails();
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    if (loading) {
        return (
            <main>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    {/* <div className="text-lg text-[#797979]">{t("loading") || "Loading..."}</div> */}
                    <Loader />
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    if (error || !order) {
        const isServerError = error?.toLowerCase().includes("internal server error") ||
            error?.toLowerCase().includes("server error");

        return (
            <main>
                <Header />
                <div className="w-full">
                    <div className="text-center page-head-wrapper">
                        <h1 className="pt-2 pb-2 text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                            {t("orderDetails") || "Order Details"}
                        </h1>
                    </div>

                    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-10">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="mb-4 sm:mb-6 text-[#797979] hover:text-[#D4AF37]"
                        >
                            <ArrowLeft size={20} />
                            <span>{t("goBack") || "Go Back"}</span>
                        </Button>

                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-12">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                    <AlertCircle size={32} className="sm:w-10 sm:h-10 text-red-600" />
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                                    {isServerError ? (t("serverError") || "Server Error") : (t("orderNotFound") || "Order not found")}
                                </h2>

                                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md px-2">
                                    {isServerError
                                        ? (t("serverErrorMessage") || "We're experiencing technical difficulties. Please try again in a moment.")
                                        : (error || t("orderNotFoundMessage") || "The order you're looking for could not be found.")
                                    }
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                                    {isServerError && (
                                        <Button
                                            onClick={handleRetry}
                                            disabled={retrying || loading}
                                            variant="primary"
                                            size="default"
                                        >
                                            <RefreshCw size={18} className={retrying ? "animate-spin" : ""} />
                                            {retrying ? (t("retrying") || "Retrying...") : (t("tryAgain") || "Try Again")}
                                        </Button>
                                    )}
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="default"
                                    >
                                        <Link href="/orders">
                                            {t("viewAllOrders") || "View All Orders"}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    const currencySymbol = order.currencySymbol ||
        order.accounting?.currencySymbol ||
        order.storeOrders?.[0]?.accounting?.currencySymbol ||
        "$";

    return (
        <main>
            <Header />

            <div className="w-full">
                <div className="text-center page-head-wrapper">
                    <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                        {t("orderDetails") || "Order Details"}
                    </h1>
                </div>

                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6 text-[#797979] hover:text-[#D4AF37]"
                    >
                        <ArrowLeft size={20} />
                        <span>{t("goBack") || "Go Back"}</span>
                    </Button>

                    {/* Order Summary Card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-4 sm:px-6 py-4 sm:py-5">
                            <div className="flex flex-col gap-3 sm:gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white break-all">
                                            {order.orderId || order.masterOrderId}
                                        </h2>
                                        {order.status && (
                                            <span
                                                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 shadow-md w-fit ${getStatusColor(
                                                    order.status.status
                                                )}`}
                                            >
                                                {getStatusIcon(order.status.status)}
                                                {getStatusLabel(order.status.status, order.status.statusName)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        <span className="text-xs sm:text-sm font-medium">
                                            {formatDate(order.createdAt || order.createdTimeStamp)}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-white/20 pt-3 sm:border-0 sm:pt-0 sm:text-right">
                                    <p className="text-xs text-white/80 mb-1 font-medium">Total Amount</p>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                                        {formatCurrency(getOrderTotal(order), currencySymbol)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        {order.accounting?.payBy && (
                            <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white border-b border-gray-200">
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <div className="p-1.5 sm:p-2 bg-[#D4AF37]/10 rounded-lg">
                                        <CreditCard size={16} className="sm:w-[18px] sm:h-[18px] text-[#D4AF37]" />
                                    </div>
                                    {t("paymentMethod") || "Payment Method"}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                                    {getNumericValue(order.accounting.payBy.card) > 0 && (
                                        <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-xs text-gray-600 mb-1 font-medium">{t("card") || "Card"}</p>
                                            <p className="text-sm sm:text-base font-bold text-gray-900">
                                                {formatCurrency(getNumericValue(order.accounting.payBy.card), currencySymbol)}
                                            </p>
                                        </div>
                                    )}
                                    {getNumericValue(order.accounting.payBy.cash) > 0 && (
                                        <div className="p-2 sm:p-3 bg-green-50 rounded-lg border border-green-100">
                                            <p className="text-xs text-gray-600 mb-1 font-medium">{t("cash") || "Cash"}</p>
                                            <p className="text-sm sm:text-base font-bold text-gray-900">
                                                {formatCurrency(getNumericValue(order.accounting.payBy.cash), currencySymbol)}
                                            </p>
                                        </div>
                                    )}
                                    {getNumericValue(order.accounting.payBy.wallet) > 0 && (
                                        <div className="p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <p className="text-xs text-gray-600 mb-1 font-medium">{t("wallet") || "Wallet"}</p>
                                            <p className="text-sm sm:text-base font-bold text-gray-900">
                                                {formatCurrency(getNumericValue(order.accounting.payBy.wallet), currencySymbol)}
                                            </p>
                                        </div>
                                    )}
                                    {getNumericValue(order.accounting.payBy.rewardWallet) > 0 && (
                                        <div className="p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-100">
                                            <p className="text-xs text-gray-600 mb-1 font-medium">{t("rewardWallet") || "Reward Wallet"}</p>
                                            <p className="text-sm sm:text-base font-bold text-gray-900">
                                                {formatCurrency(getNumericValue(order.accounting.payBy.rewardWallet), currencySymbol)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Store Orders */}
                        {order.storeOrders && order.storeOrders.length > 0 && (
                            <div className="px-4 sm:px-6 py-4 sm:py-6">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                                    <div className="w-1 h-5 sm:h-6 bg-[#D4AF37] rounded-full"></div>
                                    {t("orderItems") || "Order Items"}
                                </h3>
                                {order.storeOrders.map((storeOrder, storeIndex) => (
                                    <div
                                        key={storeIndex}
                                        className={storeIndex > 0 ? "mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-gray-200" : ""}
                                    >
                                        {/* Store Header */}
                                        {storeOrder.storeName && (
                                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                                                {storeOrder.storeLogo?.logoImageweb && (
                                                    <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                                        <Image
                                                            src={storeOrder.storeLogo.logoImageweb}
                                                            alt={storeOrder.storeName}
                                                            width={32}
                                                            height={32}
                                                            className="sm:w-10 sm:h-10 rounded object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                                        {storeOrder.storeName}
                                                    </h4>
                                                </div>
                                                {storeOrder.status && (
                                                    <span
                                                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(
                                                            storeOrder.status.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(storeOrder.status.status, storeOrder.status.statusName)}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Products */}
                                        {storeOrder.products && storeOrder.products.length > 0 && (
                                            <div className="space-y-3 sm:space-y-4">
                                                {storeOrder.products.map((product, productIndex) => (
                                                    <div
                                                        key={productIndex}
                                                        className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-5 bg-white border-2 border-gray-100 rounded-lg sm:rounded-xl hover:border-[#D4AF37]/50 hover:shadow-md transition-all"
                                                    >
                                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl bg-gray-100 shadow-sm self-center sm:self-start">
                                                            <Image
                                                                src={getProductImage(product)}
                                                                alt={product.name || "Product"}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                                                            <h5 className="font-bold text-base sm:text-lg text-gray-900 mb-2 break-words">
                                                                {product.name || product.productId || t("product") || "Product"}
                                                            </h5>
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium">
                                                                    {t("quantity") || "Qty"}: {getNumericValue(product.quantity) || 1}
                                                                </span>
                                                                {product.campaignId && (
                                                                    <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase">
                                                                        {t("entries") || "ENTRIES"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {product.attributes && product.attributes.length > 0 && (
                                                                <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-2 rounded-lg mb-2 sm:mb-0">
                                                                    {product.attributes.map((attr, attrIndex) => (
                                                                        <div key={attrIndex} className="flex gap-2 flex-wrap">
                                                                            <span className="font-medium">{attr.attrname}:</span>
                                                                            <span>{attr.value}{attr.measurementUnitName && ` ${attr.measurementUnitName}`}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 sm:border-0">
                                                            <p className="text-lg sm:text-xl font-bold text-[#D4AF37]">
                                                                {formatCurrency(
                                                                    getProductTotal(product, storeOrder),
                                                                    storeOrder.accounting?.currencySymbol ||
                                                                    currencySymbol
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Store Order Total */}
                                        {storeOrder.accounting && (
                                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-gray-200">
                                                <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl">
                                                    <span className="text-sm sm:text-base font-bold text-gray-700">
                                                        {t("storeOrderTotal") || "Store Order Total"}
                                                    </span>
                                                    <span className="text-xl sm:text-2xl font-bold text-[#D4AF37]">
                                                        {formatCurrency(
                                                            storeOrder.accounting.finalTotal ||
                                                            storeOrder.accounting.finalTotalMulti ||
                                                            storeOrder.accounting.finalUnitPrice ||
                                                            0,
                                                            storeOrder.accounting.currencySymbol || currencySymbol
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

