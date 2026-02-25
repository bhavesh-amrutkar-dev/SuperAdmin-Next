"use client";

import { Minus, Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/context/authContext";

type LegacyRaffleDetail = {
    tickets?: Array<{
        ticketId?: string;
        price?: number;
        ticketPrice?: number;
        numberOfTicket?: number;
        numberOfTickets?: number;
        quantity?: number;
        id?: string;
        _id?: string;
    }>;
    campaignId?: string;
    childProductId?: string;
    productId?: string;
};

interface EntrySelectionProps {
    lotteryItem: LegacyRaffleDetail;
    selectedTicket: string | null;
    onTicketSelect: (ticketId: string) => void;
    currencySymbol?: string;
    freeTicketError?: string | null;
    userTickets: number;
    ticketQuantity: number;
    onTicketQuantityChange: (quantity: number) => void;
    onApplyClick: () => void;
    applyingTicket: boolean;
}


export default function EntrySelection({
    lotteryItem,
    selectedTicket,
    onTicketSelect,
    currencySymbol = "USD",
    freeTicketError,
    userTickets,
    ticketQuantity,
    onTicketQuantityChange,
    onApplyClick,
    applyingTicket,
}: EntrySelectionProps) {
    const t = useTranslations();
    const { user } = useAuth();
    const displayCurrency = currencySymbol;

    // Check multiple possible ticket field names
    const tickets =
        lotteryItem.tickets ||
        (lotteryItem as any).ticketPackages ||
        (lotteryItem as any).ticketOptions ||
        (lotteryItem as any).entryOptions ||
        [];

    return (
        <div className="">
            <div className={`grid grid-cols-1 ${user ? "lg:grid-cols-1 xl:grid-cols-2" : "grid-cols-1"} gap-4 2xl:gap-6`}>
                {/* Left Column: Tickets */}
                <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-3">
                        {tickets && Array.isArray(tickets) && tickets.length > 0 ? (
                            tickets.map((ticket: any, index: number) => {
                                // Handle different ticket structures
                                const ticketId = ticket.ticketId || ticket.id || ticket._id || index.toString();
                                const ticketPrice = ticket.price || ticket.ticketPrice || 0;
                                const numberOfTickets = ticket.numberOfTicket || ticket.numberOfTickets || ticket.quantity || 0;

                                return (
                                    <button
                                        key={ticketId}
                                        onClick={() => onTicketSelect(ticketId)}
                                        className={`p-4 lg:p-3 2xl:p-4 rounded-xl border-2 transition-all w-full cursor-pointer ${selectedTicket === ticketId
                                            ? "border-[#FECB02] bg-[#fffbf3] ring-3 ring-[#FECB02]/20"
                                            : "border-gray-200 hover:border-[#FECB02]/50 bg-white"
                                            }`}
                                    >
                                        <div className="flex flex-row justify-between items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-2 text-base font-semibold text-[#2f2f2f]">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
                                                {displayCurrency} {ticketPrice?.toFixed(2) || "0.00"}
                                            </span>
                                            <span className="text-xs text-[#797979] whitespace-nowrap font-medium">
                                                ({numberOfTickets || 0} {t("tickets") || "Tickets"})
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-sm text-[#797979] text-center py-4 col-span-2">
                                {t("noTicketsAvailable") || "No tickets available"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Special Ticket Entry Box - Only visible if logged in */}
                {user && (
                    <div className="p-3 bg-[#2f2f2f] rounded-lg flex flex-col justify-between min-h-[150px]">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-white uppercase tracking-wider">{t("tickets") || "TICKETS"}</span>
                                <button className="text-[10px] px-2 py-0.5 bg-transparent border border-white text-white rounded hover:bg-white hover:text-[#2f2f2f] transition-colors uppercase">
                                    {t("useWithRestrictions") || "USE WITH RESTRICTIONS"}
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <span className="text-[#2f2f2f] font-bold text-lg">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-muted-foreground"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-lg font-extrabold text-[#FECB02] uppercase leading-none">
                                            {userTickets?.toLocaleString() || "0"} {t("tickets") || "TICKETS"}
                                        </p>
                                    </div>
                                </div>

                                <input
                                    type="number"
                                    min="0"
                                    max={userTickets}
                                    value={ticketQuantity === 0 ? "" : ticketQuantity}
                                    onChange={(e) => {
                                        const val = Math.max(0, Math.min(userTickets, parseInt(e.target.value) || 0));
                                        onTicketQuantityChange(val);
                                    }}
                                    placeholder="0"
                                    className="ticket-quantity w-14 h-8 bg-[#fff] focus:ring-3 focus:ring-[#FECB02]  transition-all text-black font-extrabold rounded-md text-center focus:outline-none text-sm shadow-md"
                                />
                            </div>
                        </div>

                        {/* Footer section of the black box */}
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                            <div className="text-left">
                                <button className="text-[11px] text-white hover:text-[#FECB02] font-semibold transition-colors block leading-tight">
                                    {t("howToEarn") || "How to Earn?"}
                                </button>
                                <p className="text-[10px] text-gray-400 italic mt-0.5">
                                    {t("ticketPurchaseNote") || "NOTE: Request purchase with ticket"}
                                </p>
                            </div>

                            {ticketQuantity > 0 && (
                                <Button
                                    onClick={onApplyClick}
                                    disabled={applyingTicket}
                                    className="px-4 py-1.5 h-auto bg-[#FECB02] hover:bg-[#FFD84D] text-black font-bold rounded transition-all uppercase shadow-md text-[11px] min-w-[80px]"
                                >
                                    {applyingTicket ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        t("apply") || "APPLY"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
