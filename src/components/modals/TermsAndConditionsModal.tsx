"use client";

import { X, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface TermsAndConditionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    termsAndConditions?: string;
}

export default function TermsAndConditionsModal({
    isOpen,
    onClose,
    termsAndConditions,
}: TermsAndConditionsModalProps) {
    const t = useTranslations();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex flex-col items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-4xl flex flex-col items-start mb-4">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group mb-2"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">{t("back") || "Back"}</span>
                </button>
            </div>

            <div
                className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl md:text-2xl font-black text-[#2f2f2f] uppercase tracking-wide">
                        {t("termsAndConditions")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {termsAndConditions ? (
                        <div
                            className="text-sm md:text-base text-[#4a4a4a] leading-relaxed space-y-4"
                            dangerouslySetInnerHTML={{ __html: termsAndConditions }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <p className="text-lg">{t("noDataAvailable") || "No terms available"}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

