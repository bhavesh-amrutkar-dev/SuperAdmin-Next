
import { WinnerServiceServer } from "@/src/lib/services/winners-server";
import { WinnerItem } from "@/src/models/api/response/winners";
import WinnerCard from "@/src/components/winners/WinnerCard";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { WINNER } from "@/src/lib/config";

// Metadata for SEO
export const metadata = {
    title: "Winners | DonRifa",
    description: "Check out the lucky winners of our recent raffles and giveaways!",
};

export default async function Winners() {
    const t = await getTranslations();
    let winners: WinnerItem[] = [];

    try {
        const response = await WinnerServiceServer.getWinnersServer();
        if (response && response.data) {
            winners = response.data;
        }
    } catch (error) {
        console.error("Failed to fetch winners:", error);
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-grow pb-20">
                {/* Header Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-8 md:py-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t("winnersCircle")}</h1>
                        <p className="text-gray-600 text-lg">{t("meetLuckyWinners")}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8 md:py-12">
                    {winners.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {winners.map((winner) => {
                                const drawDate = winner.drawDateTimeStemp
                                    ? new Date(winner.drawDateTimeStemp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : "";
                                return (
                                    <WinnerCard key={winner._id} item={winner} customDrawDate={drawDate} />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Image src={WINNER} alt="Winner" width={40} height={40} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("noWinnersYet")}</h2>
                            <p className="text-gray-500 max-w-md">{t("ongoingRafflesMessage")}</p>
                        </div>
                    )}
                </div>
            </div>
            <PreFooterIconModule />
            <Footer />
        </main>
    );
}
