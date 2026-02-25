
import { WinnerServiceServer } from "@/src/lib/services/winners-server";
import { WinnerItem, WinnerDetailData } from "@/src/models/api/response/winners";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROFILE_PLACE_HOLDER, WINNER } from "@/src/lib/config";
import WinnerVideoModal from "@/src/components/modals/WinnerVideoModal";
import WinnerVideoSection from "../../../components/winners/WinnerVideoSection";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Ideally fetch data here too for dynamic metadata, but for now simple fallback
    return {
        title: `Winner Details | DonRifa`,
    };
}

export default async function WinnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let winnerData: WinnerDetailData | null = null;
    let campaign: WinnerItem | null = null;
    const t = await getTranslations();
    try {

        const response = await WinnerServiceServer.getWinnerDetailServer(id);
        if (response && response.data) {
            winnerData = response.data.data || response.data;
            if (winnerData.campaignDetail && winnerData.campaignDetail.length > 0) {
                campaign = winnerData.campaignDetail[0];
            }
        }
    } catch (error) {
        console.error("Failed to fetch winner details:", error);
    }

    if (!campaign) {
        return notFound();
    }

    const winner = campaign.winnersList && campaign.winnersList.length > 0 ? campaign.winnersList[0] : null;
    const productImage = campaign.image && campaign.image.length > 0 ? campaign.image[0].extraLarge || campaign.image[0].large : "/images/placeholder.png";
    const drawDate = campaign.drawDateTimeStemp
        ? new Date(campaign.drawDateTimeStemp * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : "";

    // Rules - checking both 'en' and 'es', defaulting to available
    const rules = campaign.rulesOfTheDraw ? (campaign.rulesOfTheDraw['en'] || campaign.rulesOfTheDraw['es'] || "") : "";

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-grow pb-20">
                {/* Breadcrumb / Back */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                    <div className="container mx-auto px-4 py-4">
                        <Link href="/winners" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            {t("backToWinners")}
                        </Link>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Product & Winner Info */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Main Card */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100 flex items-center justify-center p-6">
                                    <Image
                                        src={productImage}
                                        alt={campaign.productName}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 70vw"
                                        priority
                                    />
                                    {/* <div className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-md flex items-center gap-1.5">
                                        <Image src={WINNER} alt="Winner" width={14} height={14} />
                                        {t("winnerDeclared")}
                                    </div> */}
                                </div>

                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{campaign.productName}</h1>
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                {t("drawnOn")} {drawDate}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 self-start">
                                            <span className="text-sm text-gray-500">{t("priceValue")}</span>
                                            <span className="font-bold text-gray-900">{campaign.currencySymbol}{campaign.ticketGoalAmount || campaign.cashAwardAmount}</span>
                                        </div>
                                    </div>

                                    {/* Winner Highlight */}
                                    {winner && (
                                        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 flex flex-col sm:flex-row items-center gap-6">
                                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={winner.profilePic || PROFILE_PLACE_HOLDER}
                                                    alt={winner.userName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">{t("luckyWinner")}</p>
                                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{winner.firstName} {winner.lastName}</h2>
                                                <p className="text-gray-600 text-sm mb-2">{winner.nationality || "International"}</p>
                                                {/* Tickets Bought Badge */}
                                                {winnerData?.totalParticipant && (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-yellow-200 shadow-sm text-xs font-medium text-yellow-700">
                                                        🎟️ {t("wonOutof")} {winnerData.totalParticipant} {t("participants")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {campaign.detailDesc && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Prize Details</h3>
                                    <div
                                        className="prose prose-sm md:prose-base text-gray-600 max-w-none"
                                        dangerouslySetInnerHTML={{ __html: campaign.detailDesc }}
                                    />
                                </div>
                            )}

                            {/* Rules */}
                            {rules && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t("rulesOfTheDraw")}</h3>
                                    <div
                                        className="prose prose-sm text-gray-500 max-w-none h-64 overflow-y-auto pr-2 custom-scrollbar"
                                        dangerouslySetInnerHTML={{ __html: rules }}
                                    />
                                </div>
                            )}

                        </div>

                        {/* Right Column: Stats & Video */}
                        <div className="space-y-6">

                            {/* Winning Moment Video */}
                            {campaign.winnersVideo && campaign.winnersVideo.length > 0 && (
                                <WinnerVideoSection videoUrl={campaign.winnersVideo[0].videoUrl} />
                            )}

                            {/* Stats Card */}
                            {winnerData && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t("participationStats")}</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-gray-600 text-sm">{t("totalParticipants")}</span>
                                            <span className="font-bold text-gray-900">{winnerData.totalParticipant}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-gray-600 text-sm">{t("freeEntries")}</span>
                                            <span className="font-bold text-gray-900">{winnerData.freeParticipant}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-gray-600 text-sm">{t("paidEntries")}</span>
                                            <span className="font-bold text-gray-900">{winnerData.paidParticipant}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Alternative Winners */}
                            {campaign.alternativeWinner && campaign.alternativeWinner.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t("alternativeWinners")}</h3>
                                    <div className="space-y-4">
                                        {campaign.alternativeWinner.map((alt) => (
                                            <div key={alt._id} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                                <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                                    <Image
                                                        src={alt.profilePic || PROFILE_PLACE_HOLDER}
                                                        alt={alt.userName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{alt.firstName} {alt.lastName}</p>
                                                    <p className="text-xs text-gray-500">{t("ticket")} #{alt.ticketId}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <PreFooterIconModule />
            <Footer />
        </main>
    );
}
