"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { RaffleService } from "@/src/lib/services/raffles";

type LegacyRaffleDetail = {
    productName?: string;
    campaignTitle?: string;
    name?: string;
    termsAndConditions?: string;
};

export default function TermsPage() {
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
                console.log("params.id ----- 5", params.id);
                const response = await RaffleService.getRaffleDetails(params.id as string);
                console.log("response ----- 6", response);
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
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h1 className="text-xl md:text-2xl font-bold text-[#2f2f2f] uppercase">
                            {t("termsAndConditions")}
                        </h1>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Page Content */}
                    <div className="p-6">
                        {lotteryItem.termsAndConditions ? (
                            <div
                                className="text-sm md:text-base text-[#797979] leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: lotteryItem.termsAndConditions }}
                            />
                        ) : (
                            <p className="text-sm text-[#797979]">{t("noDataAvailable")}</p>
                        )}
                    </div>
                </div>
            </div>
            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

