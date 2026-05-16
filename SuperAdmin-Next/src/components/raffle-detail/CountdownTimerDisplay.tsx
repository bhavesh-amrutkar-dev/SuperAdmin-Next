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
        <div className="w-full flex justify-between gap-1  py-[6px] px-2 rounded-[12px] mx-auto border border-gray-300 bg-gray-200">
            {/* <div className="grid grid-cols-4 gap-2"> */}
                <div className="flex flex-col items-center flex-1 border-r border-gray-300">
                    <div className="text-xl md:text-2xl font-bold text-black">{countdown.days}</div>
                    <div className="text-xs font-medium text-black mt-1">{t("days")}</div>
                </div>
                <div className="flex flex-col items-center flex-1 border-r border-gray-300">
                    <div className="text-xl md:text-2xl font-bold text-black">{countdown.hours}</div>
                    <div className="text-xs font-medium text-black mt-1">{t("hrs")}</div>
                </div>
                <div className="flex flex-col items-center flex-1 border-r border-gray-300">
                    <div className="text-xl md:text-2xl font-bold text-black">{countdown.minutes}</div>
                    <div className="text-xs font-medium text-black mt-1">{t("mins")}</div>
                </div>
                <div className="flex flex-col items-center flex-1">
                    <div className="text-xl md:text-2xl font-bold text-black">{countdown.seconds}</div>
                    <div className="text-xs font-medium text-black mt-1">{t("sec")}</div>
                </div>
            {/* </div> */}
        </div>
    );
}

