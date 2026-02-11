"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketWalletService } from "@/src/lib/services/ticketWallet";

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
    const [applyingTicket, setApplyingTicket] = useState(false);

    if (!isOpen || !pendingFreeTicket) return null;

    const handleConfirm = async () => {
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
                onError?.(respData.message);
            } else {
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

            onError?.(errorMessage);
            // eslint-disable-next-line no-console
            console.warn("Order placement with free tickets failed:", errorMessage);
        } finally {
            onClose();
            setApplyingTicket(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleCancel();
                }
            }}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 md:p-8 text-center">
                    <p className="text-base md:text-lg text-[#2f2f2f] mb-4">
                        You&apos;re about to use <span className="font-bold">Free tickets</span> to purchase{" "}
                        <span className="font-bold">{displayName}</span>.
                    </p>
                    <p className="text-sm text-[#797979] mb-6">
                        Press Yes to complete the selection or No to cancel.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            className="min-w-[100px] px-6 py-2 rounded-md bg-[#D4AF37] hover:bg-[#B8860B] text-white font-semibold uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleConfirm}
                            disabled={applyingTicket}
                        >
                            {applyingTicket ? "Processing..." : "Yes"}
                        </button>
                        <button
                            className="min-w-[100px] px-6 py-2 rounded-md border border-gray-300 text-sm font-semibold uppercase text-[#2f2f2f] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCancel}
                            disabled={applyingTicket}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

