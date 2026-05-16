"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { getCookie } from "cookies-next";
import { TicketWalletService } from "@/src/lib/services/ticketWallet";
import LoginModal from "./LoginModal";

interface FreeTicket {
    id: string;
    quantity: number;
}

interface LotteryItem {
    childProductId?: string;
    productId?: string;
    unitId?: string;
    storeId?: string;
    campaignId?: string;
    tickets?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    ticketPackages?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    ticketOptions?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    entryOptions?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
}

interface FreeTicketConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    pendingFreeTicket: FreeTicket | null;
    displayName: string;
    lotteryItem: LotteryItem | null;
    productId: string;
    defaultAddressId?: string;
    onError?: (error: string) => void;
}

export default function FreeTicketConfirmationModal({
    isOpen,
    onClose,
    pendingFreeTicket,
    displayName,
    lotteryItem,
    productId,
    defaultAddressId,
    onError,
}: FreeTicketConfirmationModalProps) {
    const router = useRouter();
    const t = useTranslations();
    const [applyingTicket, setApplyingTicket] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            // Disable body scroll
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        // Cleanup function
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

    // Reset error when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen || !pendingFreeTicket) return null;

    const executePurchase = async () => {
        if (!lotteryItem || !pendingFreeTicket || applyingTicket) return;

        const quantity = pendingFreeTicket.quantity || 0;
        if (quantity <= 0) {
            onClose();
            return;
        }

        setApplyingTicket(true);
        try {
            const response = await TicketWalletService.purchaseFreeTicket({
                lotteryItem,
                ticketId: pendingFreeTicket.id,
                quantity,
                productId,
                defaultAddressId,
            });

            // If backend returns a message field in error shape but 200 status, try to read it
            const respData: any = (response as any)?.data;
            if (respData?.message) {
                setError(respData.message);
                onError?.(respData.message);
            } else {
                setError(null);
                onError?.("");
                // Redirect to thank-you page on success with no error message
                router.push("/thank-you");
            }
        } catch (err) {
            let errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : err && typeof err === "object" && "message" in err
                            ? String((err as any).message)
                            : "Failed to place order with free tickets";

            // Try to read backend JSON error: { message: "..." }
            try {
                const axiosErr = err as any;
                const backendMsg = axiosErr?.response?.data?.message;
                if (backendMsg) {
                    errorMessage = backendMsg;
                }
            } catch {
                // ignore parsing errors
            }

            setError(errorMessage);
            onError?.(errorMessage);
            // eslint-disable-next-line no-console
            console.warn("Order placement with free tickets failed:", errorMessage);
        } finally {
            setApplyingTicket(false);
            // Don't close modal on error - let user see the error and try again
            if (!error) {
                // Only close on success (which redirects anyway)
            }
        }
    };

    const handleConfirm = async () => {
        // Check if user is authenticated
        const isAuthenticated = !!getCookie("access_token");

        if (!isAuthenticated) {
            // Store the purchase action and show login modal
            setPendingAction(() => executePurchase);
            // setShowLoginModal(true);
            router.push(
                `/auth/login-mobile?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
            );
            return;
        }

        // User is authenticated, proceed with purchase
        await executePurchase();
    };

    const handleLoginSuccess = async () => {
        setShowLoginModal(false);
        // Execute the pending purchase action after successful login
        if (pendingAction) {
            await pendingAction();
            setPendingAction(null);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <>
            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setPendingAction(null);
                }}
                onLoginSuccess={handleLoginSuccess}
            />

            {/* Free Ticket Confirmation Modal */}
            {!showLoginModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCancel();
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative p-4 sm:p-6 md:p-8">
                            {/* Close Button */}
                            <button
                                onClick={handleCancel}
                                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors"
                                aria-label="Close"
                                disabled={applyingTicket}
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>

                            {/* Modal Content */}
                            <div className="text-center">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2f2f2f] mb-3 sm:mb-4">
                                    {t("confirmFreeTicketPurchase") || "Confirm Free Ticket Purchase"}
                                </h1>

                                <p className="text-sm sm:text-base md:text-lg text-[#2f2f2f] mb-3 sm:mb-4">
                                    You&apos;re about to use <span className="font-bold">Free tickets</span> to purchase{" "}
                                    <span className="font-bold">{displayName}</span>.
                                </p>
                                {!error && (
                                    <p className="text-xs sm:text-sm text-[#797979] mb-4 sm:mb-6">
                                        Press Yes to complete the selection or No to cancel.
                                    </p>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-xs sm:text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Show only Cancel button when there's an error, otherwise show YES and NO buttons */}
                                {error ? (
                                    <div className="flex justify-center">
                                        <button
                                            className="min-w-[100px] px-4 sm:px-6 py-2.5 sm:py-2 rounded-md border border-gray-300 text-xs sm:text-sm font-semibold uppercase text-[#2f2f2f] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            onClick={handleCancel}
                                            disabled={applyingTicket}
                                        >
                                            {t("cancel") || "Cancel"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                        <button
                                            className="min-w-[100px] px-4 sm:px-6 py-2.5 sm:py-2 rounded-md btn-primary text-white font-semibold uppercase text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            onClick={handleConfirm}
                                            disabled={applyingTicket}
                                        >
                                            {applyingTicket ? (t("processing") || "Processing...") : (t("yes") || "Yes")}
                                        </button>
                                        <button
                                            className="min-w-[100px] px-4 sm:px-6 py-2.5 sm:py-2 rounded-full border border-gray-300 text-xs sm:text-sm font-semibold uppercase text-[#2f2f2f] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            onClick={handleCancel}
                                            disabled={applyingTicket}
                                        >
                                            {t("no") || "No"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

