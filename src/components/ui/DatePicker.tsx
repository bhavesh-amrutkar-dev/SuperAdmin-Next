"use client";

import * as React from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface DatePickerProps {
    value?: string;
    onChange: (date: string) => void;
    error?: boolean;
    placeholder?: string;
    maxDate?: Date;
}

export function DatePicker({
    value,
    onChange,
    error,
    placeholder = "Select date",
    maxDate = new Date(),
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    const selectedDate = value ? new Date(value) : undefined;

    // Close on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            {/* Trigger */}
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    "w-full justify-between font-normal",
                    error && "border-red-500 focus-visible:ring-red-500"
                )}
            >
                {selectedDate ? (
                    format(selectedDate, "PPP")
                ) : (
                    <span className="text-muted-foreground">
                        {placeholder}
                    </span>
                )}
                <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
            </Button>

            {open && (
                <div className="absolute left-0 right-0 sm:right-auto sm:w-auto z-50 mt-2 rounded-xl border bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (!date) return;
                            onChange(format(date, "yyyy-MM-dd"));
                            setOpen(false);
                        }}
                        toDate={maxDate}
                        captionLayout="dropdown"
                        className="text-gray-900"
                        classNames={{
                            caption: "flex justify-between items-center mb-3",

                            caption_label: "hidden",

                            dropdown:
                                "bg-white text-gray-900 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#FECB02] focus:border-[#FECB02]",

                            dropdown_month: "mr-2",
                            dropdown_year: "",

                            nav_button:
                                "h-8 w-8 rounded-md hover:bg-yellow-400 hover:text-black transition",

                            head_cell:
                                "text-gray-500 text-xs font-medium pb-2",

                            day:
                                "h-9 w-9 rounded-md text-sm hover:bg-[#FECB02]/20 hover:text-black transition",

                            day_selected:
                                "bg-[#FECB02] text-black hover:bg-[#FECB02]",

                            day_today:
                                "border border-[#FECB02] font-semibold",

                            day_outside:
                                "text-gray-400 opacity-60",
                        }}
                    />

                </div>
            )}
        </div>
    );
}
