
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
            winners = response.data.sort((a, b) => (b.drawDateTimeStemp || 0) - (a.drawDateTimeStemp || 0));
        }
    } catch (error) {
        console.error("Failed to fetch winners:", error);
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-grow">
                {/* Header Section */}
                {/* Header Section */}
                <div className="bg-gray-900 text-white relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-white/5 rotate-12 blur-3xl rounded-full" />
                        <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[200%] bg-yellow-400/10 rotate-12 blur-3xl rounded-full" />
                    </div>

                    <div className="text-center page-head-wrapper">
                        {/* <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-6 ring-1 ring-white/20">
                            <Image src={WINNER} alt="Winner" width={24} height={24} className="w-6 h-6" />
                        </div> */}
                        <h1 className="pt-2 pb-2 text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                            {t("winnersCircle")}
                            <span className="text-yellow-400">.</span>
                        </h1>
                        <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
                            {t("meetLuckyWinners")}
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 pt-10 lg:pt-[60px] pb-4 md:pb-6">
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
