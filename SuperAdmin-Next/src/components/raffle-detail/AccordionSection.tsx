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
        <div className="border-b border-gray-300 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full p-4 md:p-5 flex items-center justify-between bg-gray-100 transition-colors cursor-pointer"
            >
                <h2 className="text-base lg:text-lg font-semibold text-[#2f2f2f]">
                    {title}
                </h2>
                {isOpen ? (
                    <ChevronUp className="text-[#2f2f2f] w-5 h-5" />
                ) : (
                    <ChevronDown className="text-[#2f2f2f] w-5 h-5" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 md:p-5 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
}

