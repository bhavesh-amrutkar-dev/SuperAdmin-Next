"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";


export default function WinnerFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const now = new Date();
    const t = useTranslations();
    const currentMonth = Number(searchParams?.get("month")) || now.getMonth() + 1;
    const currentYear = Number(searchParams?.get("year")) || now.getFullYear();

    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);

    const years = Array.from({ length: 20 }).map((_, i) => now.getFullYear() - i);

    const months = Array.from({ length: 12 }).map((_, i) =>
        t(`months.${i + 1}`)
    );

    const applyFilter = () => {
        setOpen(false);
        router.push(`/winners?year=${year}&month=${month}`);
    };

    const selectedLabel = `${months[currentMonth - 1]} ${currentYear}`;

    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <div className="flex justify-center mb-8">
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 px-4 py-2 text-lg font-semibold text-gray-900 bg-white border rounded-full shadow-sm hover:bg-gray-50">
                        {selectedLabel}
                        <span className="text-sm"><Calendar /></span>
                    </Button>
                </DialogTrigger>
            </div>

            <DialogContent className="max-w-md">

                <DialogTitle>{t("selectMonthYear")}</DialogTitle>

                <div className="flex gap-6 mt-4">

                    {/* Month */}
                    <div className="flex-1 h-48 overflow-y-auto border rounded-lg">
                        {months.map((m, i) => (
                            <button
                                key={m}
                                onClick={() => setMonth(i + 1)}
                                className={`block w-full text-center py-3 text-sm ${month === i + 1
                                    ? "bg-yellow-400 font-semibold"
                                    : "hover:bg-gray-100 hover:cursor-pointer"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* Year */}
                    <div className="flex-1 h-48 overflow-y-auto border rounded-lg">
                        {years.map((y) => (
                            <button
                                key={y}
                                onClick={() => setYear(y)}
                                className={`block w-full text-center py-3 text-sm ${year === y
                                    ? "bg-yellow-400 font-semibold"
                                    : "hover:bg-gray-100 hover:cursor-pointer"
                                    }`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>

                </div>

                <div className="flex gap-3 mt-6">
                    <Button
                        onClick={applyFilter}
                        className="flex-1 bg-yellow-400 rounded-lg py-2 text-sm font-semibold"
                    >
                        {t("apply")}
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}