"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { RaffleService } from "@/src/lib/services/raffles";
import { TicketWalletService } from "@/src/lib/services/ticketWallet";
import { UserAddressService } from "@/src/lib/services/userAddress";
import { PRODUCT_CART } from "@/src/lib/config";
import { getCookie } from "cookies-next";

type LegacyRaffleDetail = {
    productName?: string;
    campaignTitle?: string;
    name?: string;
    image?: { medium: string }[];
    childProductId?: string;
    productId?: string;
    unitId?: string;
    storeId?: string;
    campaignId?: string;
    tickets?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    ticketPackages?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    ticketOptions?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    entryOptions?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
};

export default function FreeTicketConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [lotteryItem, setLotteryItem] = useState<LegacyRaffleDetail | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [applyingTicket, setApplyingTicket] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [defaultAddressId, setDefaultAddressId] = useState<string>("");

    // Get ticket data from query params
    const ticketId = searchParams.get("ticketId");
    const quantity = parseInt(searchParams.get("quantity") || "0", 10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch raffle data
                const raffleResponse = await RaffleService.getRaffleDetails(params.id as string);
                const raw = raffleResponse as any;
                let data: LegacyRaffleDetail | undefined = raw?.data;

                // Some APIs return an array in `data`; take the first element
                if (Array.isArray(data) && data.length > 0) {
                    data = data[0] as LegacyRaffleDetail;
                }

                if (data) {
                    setLotteryItem(data);
                } else {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                // Fetch default address
                try {
                    const addressResponse = await UserAddressService.getAddresses();
                    const addresses = addressResponse?.data || [];
                    const defaultAddress = addresses.find((addr: any) => addr?.default === true);
                    if (defaultAddress?._id) {
                        setDefaultAddressId(defaultAddress._id);
                    }
                } catch (addressError) {
                    console.warn("Failed to fetch default address:", addressError);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const handleConfirm = async () => {
        if (!lotteryItem || !ticketId || quantity <= 0 || applyingTicket) return;

        setApplyingTicket(true);
        setError(null);

        try {
            const response = await TicketWalletService.purchaseFreeTicket({
                lotteryItem,
                ticketId,
                quantity,
                productId: params.id as string,
                defaultAddressId,
            });

            // If backend returns a message field in error shape but 200 status, try to read it
            const respData: any = (response as any)?.data;
            if (respData?.message) {
                setError(respData.message);
            } else {
                // Redirect to thank-you page on success with no error message
                router.push("/thank-you");
            }
        } catch (err) {
            let errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : err && typeof err === "object" && "message" in err
                            ? String((err as any).message)
                            : "Failed to place order with free tickets";

            // Try to read backend JSON error: { message: "..." }
            try {
                const axiosErr = err as any;
                const backendMsg = axiosErr?.response?.data?.message;
                if (backendMsg) {
                    errorMessage = backendMsg;
                }
            } catch {
                // ignore parsing errors
            }

            setError(errorMessage);
            // eslint-disable-next-line no-console
            console.warn("Order placement with free tickets failed:", errorMessage);
        } finally {
            setApplyingTicket(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t("loading") || "Loading..."}</p>
                </div>
            </div>
        );
    }

    if (notFound || !lotteryItem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{t("notFound") || "Not Found"}</h1>
                    <Link
                        href="/reffles"
                        className="text-[#D4AF37] hover:underline"
                    >
                        {t("backToRaffles") || "Back to Raffles"}
                    </Link>
                </div>
            </div>
        );
    }

    if (!ticketId || quantity <= 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{t("invalidRequest") || "Invalid Request"}</h1>
                    <p className="text-gray-600 mb-4">{t("missingTicketInformation") || "Missing ticket information"}</p>
                    <button
                        onClick={() => router.back()}
                        className="text-[#D4AF37] hover:underline"
                    >
                        {t("back") || "Back"}
                    </button>
                </div>
            </div>
        );
    }

    const displayName = lotteryItem.campaignTitle || lotteryItem.productName || lotteryItem.name || "";

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Back Button */}
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-[#797979] hover:text-[#D4AF37] mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>{t("back") || "Back"}</span>
                </button>

                {/* Page Content */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="p-6 md:p-8 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#2f2f2f] mb-4">
                            {t("confirmFreeTicketPurchase") || "Confirm Free Ticket Purchase"}
                        </h1>

                        <p className="text-base md:text-lg text-[#2f2f2f] mb-4">
                            You&apos;re about to use <span className="font-bold">Free tickets</span> to purchase{" "}
                            <span className="font-bold">{displayName}</span>.
                        </p>
                        <p className="text-sm text-[#797979] mb-6">
                            Press Yes to complete the selection or No to cancel.
                        </p>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-center gap-4">
                            <button
                                className="min-w-[100px] px-6 py-2 rounded-md bg-[#D4AF37] hover:bg-[#B8860B] text-white font-semibold uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleConfirm}
                                disabled={applyingTicket}
                            >
                                {applyingTicket ? (t("processing") || "Processing...") : (t("yes") || "Yes")}
                            </button>
                            <button
                                className="min-w-[100px] px-6 py-2 rounded-md border border-gray-300 text-sm font-semibold uppercase text-[#2f2f2f] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleCancel}
                                disabled={applyingTicket}
                            >
                                {t("no") || "No"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

