"use client";

import { useLocale, useTranslations } from "next-intl";

type TimelineDate = {
    key: string;
    date: number;
    isActive: boolean;
    label?: string;
};

interface TimelineProps {
    timelineData: TimelineDate[];
}

import { CalendarDays } from "lucide-react";

export default function Timeline({ timelineData }: TimelineProps) {
    const locale = useLocale();
    const t = useTranslations();

    // Helper function to format date
    const formatDate = (timestamp: number | undefined): string => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }).toUpperCase();
        } catch {
            return "";
        }
    };

    if (timelineData.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="relative flex items-start justify-between px-2">
                {/* Connecting line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-[#FECB02] z-0"></div>

                {timelineData.map((item) => (
                    <div key={item.key} className="flex flex-col items-center flex-1 relative z-10">
                        <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white transition-all duration-300 ${item.isActive ? "border-[#FECB02] text-[#FECB02] scale-110" : "border-gray-200 text-gray-400"
                                } mb-2 shadow-sm`}
                        >
                            <CalendarDays size={16} className={item.isActive ? "text-[#FECB02]" : "text-gray-400"} />
                        </div>
                        <div className="text-center">
                            <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider`}>
                                {formatDate(item.date)}
                            </p>
                            <p className={`text-[9px] md:text-[10px] font-bold uppercase mt-0.5 tracking-wide`}>
                                {item.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

