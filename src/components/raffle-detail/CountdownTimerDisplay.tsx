"use client";

import { useTranslations } from "next-intl";

interface CountdownTimerDisplayProps {
    countdown: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
}

export default function CountdownTimerDisplay({ countdown }: CountdownTimerDisplayProps) {
    const t = useTranslations();

    return (
        <div className="bg-black rounded-lg p-4">
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-gradient-to-r from-[#FECB02] to-[#FFD84D] rounded p-3 text-center">
                    <div className="text-2xl font-bold text-black">{countdown.days}</div>
                    <div className="text-xs font-medium text-black mt-1">{t("days")}</div>
                </div>
                <div className="bg-gradient-to-r from-[#FECB02] to-[#FFD84D] rounded p-3 text-center">
                    <div className="text-2xl font-bold text-black">{countdown.hours}</div>
                    <div className="text-xs font-medium text-black mt-1">{t("hrs")}</div>
                </div>
                <div className="bg-gradient-to-r from-[#FECB02] to-[#FFD84D] rounded p-3 text-center">
                    <div className="text-2xl font-bold text-black">{countdown.minutes}</div>
                    <div className="text-xs font-medium text-black mt-1">{t("mins")}</div>
                </div>
                <div className="bg-gradient-to-r from-[#FECB02] to-[#FFD84D] rounded p-3 text-center">
                    <div className="text-2xl font-bold text-black">{countdown.seconds}</div>
                    <div className="text-xs font-medium text-black mt-1">{t("sec")}</div>
                </div>
            </div>
        </div>
    );
}

