"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ApplyTicketConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    ticketQuantity: number;
    isApplying?: boolean;
}

export default function ApplyTicketConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    ticketQuantity,
    isApplying = false,
}: ApplyTicketConfirmationModalProps) {
    const t = useTranslations();

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        return () => {
            if (isOpen) {
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !isApplying) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-4 sm:p-6 md:p-8">
                    {/* Close Button */}
                    {!isApplying && (
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    )}

                    {/* Header */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                            {t("confirmApplyTickets") || "Confirm Apply Tickets"}
                        </h2>
                        <div className="w-16 sm:w-20 h-1 bg-[#D4AF37] mx-auto"></div>
                    </div>

                    {/* Message */}
                    <div className="text-center mb-6 sm:mb-8">
                        <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                            {t("confirmApplyTicketsMessage") || "Are you sure you want to apply"}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-[#D4AF37] mb-2 sm:mb-3">
                            {ticketQuantity} {t("tickets") || "tickets"}
                        </p>
                        <p className="text-sm sm:text-base text-gray-600">
                            {t("confirmApplyTicketsQuestion") || "to this raffle?"}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isApplying}
                            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-semibold rounded-lg transition-colors text-sm sm:text-base"
                        >
                            {t("cancel") || "CANCEL"}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isApplying}
                            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#D4AF37] hover:bg-[#B8860B] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                        >
                            {isApplying ? (t("applying") || "APPLYING...") : (t("apply") || "APPLY")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

