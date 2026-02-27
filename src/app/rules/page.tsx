"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { RulesService, type RulesData } from "@/src/lib/services/rules";

export default function RulesPage() {
    const t = useTranslations();
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [rulesData, setRulesData] = useState<RulesData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        RulesService.getRaffleRules()
            .then((response) => {
                const data = (response as any)?.data;
                setRulesData(data || null);
            })
            .catch((err) => {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to load rules data";
                setError(errorMessage);
                console.warn("Error fetching rules:", errorMessage);
            })
            .finally(() => setLoading(false));
    }, [locale]);

    if (loading) {
        return (
            <main>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-lg text-[#797979]">Loading...</div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-lg text-red-600">Error: {error}</div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    const rulesContent = rulesData?.raffleRulesObj || "";

    return (
        <main>
            <Header />

            {/* Page Header - Same as Contact Us */}
            <div className="text-center page-head-wrapper">
                <h1 className="pt-2 pb-2 text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                    {t("rules") || "RULES"}
                </h1>
                <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed">
                    {t("rulesSubtitle") || "How to Play and Win"}
                </p>
            </div>

            <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-8 md:py-12">
                <div className="flex justify-center">
                    <div className="w-full max-w-5xl">
                        {rulesContent ? (
                            <div className="rules-content-wrapper">
                                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 uppercase text-[#2f2f2f] py-2">
                                    {t("generalRules") || "General Rules"}
                                </h2>
                                <div
                                    className="rules-html-content text-[#000] text-base md:text-lg leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: rulesContent }}
                                />
                            </div>
                        ) : (
                            <div className="rules-content-wrapper space-y-6 text-[#2f2f2f]">
                                <section>
                                    <h2 className="text-xl md:text-2xl font-bold mb-4 uppercase">
                                        {t("rulesTitle1") || "General Rules"}
                                    </h2>
                                    <ul className="list-disc list-inside space-y-2 text-base md:text-lg leading-relaxed">
                                        <li>{t("rule1") || "Participants must be 18 years or older to participate."}</li>
                                        <li>{t("rule2") || "Each raffle has specific entry requirements and ticket prices."}</li>
                                        <li>{t("rule3") || "All entries are final and non-refundable."}</li>
                                        <li>{t("rule4") || "Winners are selected through a transparent, random drawing process."}</li>
                                        <li>{t("rule5") || "Results are published and winners are notified via email."}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl md:text-2xl font-bold mb-4 uppercase">
                                        {t("rulesTitle2") || "How to Participate"}
                                    </h2>
                                    <ol className="list-decimal list-inside space-y-2 text-base md:text-lg leading-relaxed">
                                        <li>{t("step1") || "Browse available raffles on our platform."}</li>
                                        <li>{t("step2") || "Select the raffle you want to enter."}</li>
                                        <li>{t("step3") || "Choose the number of tickets you wish to purchase."}</li>
                                        <li>{t("step4") || "Complete the payment process securely."}</li>
                                        <li>{t("step5") || "Wait for the draw date and check results."}</li>
                                    </ol>
                                </section>
                                <section>
                                    <h2 className="text-xl md:text-2xl font-bold mb-4 uppercase">
                                        {t("rulesTitle3") || "Winner Selection"}
                                    </h2>
                                    <p className="text-base md:text-lg leading-relaxed mb-4">
                                        {t("winnerSelectionText") || "Winners are selected using a certified random number generator. The drawing process is recorded and can be verified. All participants have an equal chance of winning based on the number of tickets they hold."}
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl md:text-2xl font-bold mb-4 uppercase">
                                        {t("rulesTitle4") || "Prize Claiming"}
                                    </h2>
                                    <p className="text-base md:text-lg leading-relaxed mb-4">
                                        {t("prizeClaimingText") || "Winners will be contacted within 48 hours of the draw. Prizes must be claimed within 30 days. Winners are responsible for any applicable taxes and fees."}
                                    </p>
                                </section>

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