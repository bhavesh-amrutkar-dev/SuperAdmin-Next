"use client";

import { useTranslations } from "next-intl";

type LegacyRaffleDetail = {
    totalEntriesSold?: number;
    sold?: number;
    paidEntries?: number;
    freeEntries?: number;
    myEntries?: number;
    totalPaidTicketsGeneratedUser?: number;
    totalFreeTicketsGeneratedUser?: number;
    paidProbability?: number;
    freeProbability?: number;
    myProbablity?: number;
    totalTicketsGenerated?: number;
};

interface WinProbabilitySectionProps {
    lotteryItem: LegacyRaffleDetail;
}

// Circular Progress Bar Component
const CircularProgressBar = ({ percentage }: { percentage: number }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-24 h-24">
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="#FECB02"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#2f2f2f]">{percentage}%</span>
            </div>
        </div>
    );
};

export default function WinProbabilitySection({ lotteryItem }: WinProbabilitySectionProps) {
    const t = useTranslations();

    // Calculate probabilities - use API values if available, otherwise calculate
    const totalEntries = lotteryItem.totalTicketsGenerated ?? lotteryItem.totalEntriesSold ?? 0;
    // Paid probability: use API value or calculate
    const paidProbability = lotteryItem.paidProbability !== undefined
        ? Math.round(lotteryItem.paidProbability)
        : totalEntries > 0
            ? Math.round(((lotteryItem.paidEntries ?? lotteryItem.sold ?? 0) / totalEntries) * 100)
            : 0;
    // Free probability: use API value or calculate
    const freeProbability = lotteryItem.freeProbability !== undefined
        ? Math.round(lotteryItem.freeProbability)
        : totalEntries > 0
            ? Math.round(((lotteryItem.freeEntries ?? 0) / totalEntries) * 100)
            : 0;
    // My probability: use API value or calculate
    const myTotalEntries = (lotteryItem.totalPaidTicketsGeneratedUser ?? 0) + (lotteryItem.totalFreeTicketsGeneratedUser ?? 0);
    const myProbability = lotteryItem.myProbablity !== undefined
        ? Math.round(lotteryItem.myProbablity)
        : totalEntries > 0
            ? Math.round((myTotalEntries / totalEntries) * 100)
            : 0;

    return (
        <div className="border border-gray-200 rounded-xl">
            {/* Row 1: Title */}
            <h2 className="p-3 md:p-4 bg-gray-200 text-lg md:text-xl font-bold text-[#2f2f2f] mb-6 uppercase text-center rounded-t-xl">
                {t("winProbability")}
            </h2>

            {/* Row 2: Statistics */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-6 px-4 sm:max-w-[80%] sm:mx-auto lg:max-w-full xl:max-w-[92%] 2xl:max-w-[80%]">
                    <div className="text-center">
                        <div className="text-sm md:text-base text-[#2f2f2f]">
                            <span className="text-[#797979] text-sm font-semibold">{t("totalEntriesSold")}:</span>
                            <br />
                            <span className="text-[#2f2f2f] font-semibold">{totalEntries.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm md:text-base text-[#2f2f2f]">
                            <span className="text-[#797979] text-sm font-semibold">{t("myPaidEntries")}:</span>
                            <br />
                            <span className="text-[#2f2f2f] font-semibold">
                                {(lotteryItem.totalPaidTicketsGeneratedUser ?? 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm md:text-base text-[#2f2f2f]">
                            <span className="text-[#797979] text-sm font-semibold">{t("myFreeEntries")}:</span>
                            <br />
                            <span className="text-[#2f2f2f] font-semibold">
                                {(lotteryItem.totalFreeTicketsGeneratedUser ?? 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Progress Bars */}
            <div className="mb-6">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 px-4">
                    <div className="flex flex-col items-center">
                        <CircularProgressBar percentage={paidProbability} />
                        <p className="SubProgress text-xs md:text-sm font-medium text-[#797979] mt-3 whitespace-nowrap">
                            {t("paid")}
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <CircularProgressBar percentage={freeProbability} />
                        <p className="SubProgress text-xs md:text-sm font-medium text-[#797979] mt-3 whitespace-nowrap">
                            {t("free")}
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <CircularProgressBar percentage={myProbability} />
                        <p className="SubProgress text-xs md:text-sm font-medium text-[#797979] mt-3 whitespace-nowrap">
                            {t("myProbability")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs md:text-sm text-[#797979] leading-relaxed text-center p-4">
                {t("probabilityDisclaimer")}
            </p>
        </div>
    );
}

