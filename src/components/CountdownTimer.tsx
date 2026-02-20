"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
    endTime: Date | string;
    onExpired?: () => void;
}

export default function CountdownTimer({ endTime, onExpired }: CountdownTimerProps) {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateCountdown = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const difference = end - now;

            if (difference <= 0) {
                setDays(0);
                setHours(0);
                setMinutes(0);
                setSeconds(0);
                setIsExpired(true);
                onExpired?.();
                return;
            }

            const d = Math.floor(difference / (1000 * 60 * 60 * 24));
            const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const m = Math.floor((difference / 1000 / 60) % 60);
            const s = Math.floor((difference / 1000) % 60);

            setDays(d);
            setHours(h);
            setMinutes(m);
            setSeconds(s);
            setIsExpired(false);
        };

        calculateCountdown();
        const timer = setInterval(calculateCountdown, 1000);

        return () => clearInterval(timer);
    }, [endTime, onExpired]);

    if (isExpired) {
        return (
            <div className="flex justify-end gap-1">
                <div className="bg-red-500 text-white p-2 rounded-[10px] flex flex-col items-center min-w-[50px]">
                    <span className="text-xl font-black leading-none">0</span>
                    <span className="text-[10px] font-bold uppercase">Days</span>
                </div>
                <div className="bg-red-500 text-white p-2 rounded-[10px] flex flex-col items-center min-w-[50px]">
                    <span className="text-xl font-black leading-none">0</span>
                    <span className="text-[10px] font-bold uppercase">Hrs</span>
                </div>
                <div className="bg-red-500 text-white p-2 rounded-[10px] flex flex-col items-center min-w-[50px]">
                    <span className="text-xl font-black leading-none">0</span>
                    <span className="text-[10px] font-bold uppercase">Mins</span>
                </div>
                <div className="bg-red-500 text-white p-2 rounded-[10px] flex flex-col items-center min-w-[50px]">
                    <span className="text-xl font-black leading-none">0</span>
                    <span className="text-[10px] font-bold uppercase">Sec</span>
                </div>
            </div>
        );
    }

    return (
        <div className="inline-flex justify-end gap-1 bg-white max-w-max py-[6px] px-2 rounded-[12px] mx-auto shadow-lg">
            <div className="flex flex-col items-center min-w-[50px] border-r border-gray-300">
                <span className="text-xl font-black leading-none">{days}</span>
                <span className="text-[10px] font-bold uppercase">Days</span>
            </div>
            <div className="flex flex-col items-center min-w-[50px] border-r border-gray-300">
                <span className="text-xl font-black leading-none">{hours}</span>
                <span className="text-[10px] font-bold uppercase">Hrs</span>
            </div>
            <div className="flex flex-col items-center min-w-[50px] border-r border-gray-300">
                <span className="text-xl font-black leading-none">{minutes}</span>
                <span className="text-[10px] font-bold uppercase">Mins</span>
            </div>
            <div className="flex flex-col items-center min-w-[50px]">
                <span className="text-xl font-black leading-none">{seconds}</span>
                <span className="text-[10px] font-bold uppercase">Sec</span>
            </div>
        </div>
    );
}
