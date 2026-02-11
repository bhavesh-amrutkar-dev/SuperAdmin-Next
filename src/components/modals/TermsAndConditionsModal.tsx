"use client";

import { X } from "lucide-react";
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl md:text-2xl font-bold text-[#2f2f2f] uppercase">
                        {t("termsAndConditions")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    {termsAndConditions ? (
                        <div
                            className="accordion-content text-sm md:text-base text-[#797979] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: termsAndConditions }}
                        />
                    ) : (
                        <p className="text-sm text-[#797979]">{t("noDataAvailable")}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

