"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { RaffleService } from "@/src/lib/services/raffles";
import ComingSoon from "@/src/components/common/ComingSoon";
import { PRODUCT_CART } from "@/src/lib/config";
import Loader from "@/src/components/loader";

type LegacyRaffleDetail = {
    productName?: string;
    campaignTitle?: string;
    name?: string;
    image?: { medium: string }[];
    description?: string;
    detailDesc?: string;
};

export default function AskQuestionPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [lotteryItem, setLotteryItem] = useState<LegacyRaffleDetail | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchRaffleData = async () => {
            try {
                setLoading(true);
                // Use params.id as campaignId for getRaffleDetails
                const response = await RaffleService.getRaffleDetails(params.id as string);
                const raw = response as any;
                let data: LegacyRaffleDetail | undefined = raw?.data;

                // Some APIs return an array in `data`; take the first element
                if (Array.isArray(data) && data.length > 0) {
                    data = data[0] as LegacyRaffleDetail;
                }

                if (data) {
                    setLotteryItem(data);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error("Failed to fetch raffle data:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchRaffleData();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                {/* <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t("loading") || "Loading..."}</p>
                </div> */}
                <Loader/>
            </div>
        );
    }

    if (notFound || !lotteryItem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{t("notFound") || "Not Found"}</h1>
                    <Link
                        href="/raffles"
                        className="text-[#D4AF37] hover:underline"
                    >
                        {t("backToRaffles") || "Back to Raffles"}
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = lotteryItem.campaignTitle || lotteryItem.productName || lotteryItem.name || "";
    const displayImage = lotteryItem.image?.[0]?.medium ?? PRODUCT_CART;

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#797979] hover:text-[#D4AF37] mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>{t("back") || "Back"}</span>
                </button>

                {/* Page Content */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Page Header */}
                    <div className="flex items-start justify-between p-6 border-b border-gray-200">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF37]">
                                {t("askAQuestion")}
                            </h1>
                            <p className="mt-1 text-xs md:text-sm font-semibold uppercase text-red-500">
                                Coming Soon
                            </p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    {/* Page Content */}
                    <div className="p-6">
                        {/* Product Information */}
                        <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                            <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    src={displayImage}
                                    alt={displayName}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base md:text-lg font-semibold text-[#2f2f2f] mb-2">
                                    {displayName || t("product") || "Product"}
                                </h3>
                                <p className="text-sm text-[#797979] line-clamp-2">
                                    {lotteryItem.detailDesc || lotteryItem.description
                                        ? (lotteryItem.detailDesc || lotteryItem.description || "").replace(/<[^>]*>/g, "").substring(0, 150) + "..."
                                        : t("noDataAvailable")
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Coming Soon Placeholder */}
                        <ComingSoon
                            description="The question &amp; answer feature is not yet available on this new site. You&apos;ll soon be able to ask the seller and community anything about this raffle."
                        />
                    </div>
                </div>
            </div>
            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

