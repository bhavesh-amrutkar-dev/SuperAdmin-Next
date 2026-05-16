"use client";

import { useTranslations } from "next-intl";

type LegacyRaffleDetail = {
    goalValue?: number;
    ticketGoalAmount?: number;
    currencySymbol?: string;
    ticketPrice?: number;
    price?: number;
    cashAwardAmount?: number;
};

interface PriceProgressBarProps {
    lotteryItem: LegacyRaffleDetail;
}

export default function PriceProgressBar({ lotteryItem }: PriceProgressBarProps) {
    const t = useTranslations();
    // Helper function to calculate progress percentage
    const calculateProgress = (goalValue: number | undefined, ticketGoalAmount: number | undefined): number => {
        if (!goalValue || !ticketGoalAmount || goalValue === 0) return 0;
        const percentage = (ticketGoalAmount / goalValue) * 100;
        return Math.min(100, Math.max(0, Math.round(percentage)));
    };

    const displayPrice = lotteryItem?.cashAwardAmount ?? lotteryItem.goalValue ?? lotteryItem.ticketPrice ?? lotteryItem.price;
    const displayCurrency = lotteryItem.currencySymbol ?? "USD";
    const progressPercentage = calculateProgress(
        lotteryItem.goalValue,
        lotteryItem.ticketGoalAmount
    );

    return (
        <div className="px-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {displayCurrency} {displayPrice ?? "0"}
                    <span className="text-[17px] text-gray-500 px-1">
                        {t("CashWinningAmount")}
                    </span>
                </span>
                <span className="text-lg font-semibold text-gray-800 ">
                    {progressPercentage}%
                </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="bg-gradient-to-r to-[#f3c200] from-[#2f2f2f] h-2.5 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
}

