"use client";

type LegacyRaffleDetail = {
    goalValue?: number;
    ticketGoalAmount?: number;
    currencySymbol?: string;
    ticketPrice?: number;
    price?: number;
};

interface PriceProgressBarProps {
    lotteryItem: LegacyRaffleDetail;
}

export default function PriceProgressBar({ lotteryItem }: PriceProgressBarProps) {
    // Helper function to calculate progress percentage
    const calculateProgress = (goalValue: number | undefined, ticketGoalAmount: number | undefined): number => {
        if (!goalValue || !ticketGoalAmount || goalValue === 0) return 0;
        const percentage = (ticketGoalAmount / goalValue) * 100;
        return Math.min(100, Math.max(0, Math.round(percentage)));
    };

    const displayPrice = lotteryItem.goalValue ?? lotteryItem.ticketPrice ?? lotteryItem.price;
    const displayCurrency = lotteryItem.currencySymbol ?? "USD";
    const progressPercentage = calculateProgress(
        lotteryItem.goalValue,
        lotteryItem.ticketGoalAmount
    );

    return (
        <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-[#797979]">
                    {displayCurrency} {displayPrice ?? "0"}
                </span>
                <span className="text-lg font-semibold text-[#797979]">
                    {progressPercentage}%
                </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#FECB02] to-[#FFD84D] transition-all duration-300 "
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
}

