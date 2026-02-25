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

const CircularProgressBar = ({ percentage }: { percentage: number }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90">
                <defs>
                    <linearGradient id="themeGradient" gradientTransform="rotate(137)">
                        <stop offset="0%" stopColor="#2F2F2F" />
                        <stop offset="100%" stopColor="#FECB02" />
                    </linearGradient>
                </defs>

                {/* Track */}
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="#2F2F2F"
                    strokeOpacity="0.12"
                    strokeWidth="8"
                />

                {/* Progress */}
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="url(#themeGradient)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#2F2F2F]">
                    {percentage}%
                </span>
            </div>
        </div>
    );
};

export default function WinProbabilitySection({
    lotteryItem,
}: WinProbabilitySectionProps) {
    const t = useTranslations();

    const totalEntries =
        lotteryItem.totalTicketsGenerated ??
        lotteryItem.totalEntriesSold ??
        0;

    const paidProbability =
        lotteryItem.paidProbability !== undefined
            ? Math.round(lotteryItem.paidProbability)
            : totalEntries > 0
                ? Math.round(
                    ((lotteryItem.paidEntries ?? lotteryItem.sold ?? 0) /
                        totalEntries) *
                    100
                )
                : 0;

    const freeProbability =
        lotteryItem.freeProbability !== undefined
            ? Math.round(lotteryItem.freeProbability)
            : totalEntries > 0
                ? Math.round(
                    ((lotteryItem.freeEntries ?? 0) / totalEntries) * 100
                )
                : 0;

    const myTotalEntries =
        (lotteryItem.totalPaidTicketsGeneratedUser ?? 0) +
        (lotteryItem.totalFreeTicketsGeneratedUser ?? 0);

    const myProbability =
        lotteryItem.myProbablity !== undefined
            ? Math.round(lotteryItem.myProbablity)
            : totalEntries > 0
                ? Math.round((myTotalEntries / totalEntries) * 100)
                : 0;

    return (
        <div className="border border-[#8f8f8f] rounded-2xl bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300">

            {/* Title */}
            <div className="px-6 py-4 text-center  bg-gray-200 rounded-t-2xl">
                <h2 className="text-xl font-semibold text-[#2F2F2F]">
                    {t("winProbability")}
                </h2>
                {/* <div className="w-12 h-1 bg-yellow-400 mx-auto mt-2 rounded-full" /> */}
            </div>

            {/* Statistics */}
            <div className="py-6 px-4">
                <div className="flex flex-col md:flex-row md:justify-between gap-6 text-center">

                    <div>
                        <p className="text-sm font-semibold text-[#797979]">
                            {t("totalEntriesSold")}
                        </p>
                        <p className="text-lg font-bold text-[#2F2F2F]">
                            {totalEntries.toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-[#797979]">
                            {t("myPaidEntries")}
                        </p>
                        <p className="text-lg font-bold text-[#2F2F2F]">
                            {(lotteryItem.totalPaidTicketsGeneratedUser ?? 0).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-[#797979]">
                            {t("myFreeEntries")}
                        </p>
                        <p className="text-lg font-bold text-[#2F2F2F]">
                            {(lotteryItem.totalFreeTicketsGeneratedUser ?? 0).toLocaleString()}
                        </p>
                    </div>

                </div>
            </div>

            {/* Progress Bars */}
            <div className="pb-6">
                <div className="flex flex-wrap justify-center gap-10">

                    <div className="flex flex-col items-center">
                        <CircularProgressBar percentage={paidProbability} />
                        <p className="text-sm font-medium text-[#797979] mt-3">
                            {t("paid")}
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <CircularProgressBar percentage={freeProbability} />
                        <p className="text-sm font-medium text-[#797979] mt-3">
                            {t("free")}
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <CircularProgressBar percentage={myProbability} />
                        <p className="text-sm font-medium text-[#797979] mt-3">
                            {t("myProbability")}
                        </p>
                    </div>

                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-[#797979] text-center px-6 pb-6">
                {t("probabilityDisclaimer")}
            </p>
        </div>
    );
}