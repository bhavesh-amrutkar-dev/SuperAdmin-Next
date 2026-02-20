"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface AccordionSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export default function AccordionSection({ title, isOpen, onToggle, children }: AccordionSectionProps) {
    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <h2 className="text-lg md:text-xl font-bold text-[#2f2f2f]">
                    {title}
                </h2>
                {isOpen ? (
                    <ChevronUp className="text-[#2f2f2f] w-5 h-5" />
                ) : (
                    <ChevronDown className="text-[#2f2f2f] w-5 h-5" />
                )}
            </button>
            {isOpen && (
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                    {children}
                </div>
            )}
        </div>
    );
}

