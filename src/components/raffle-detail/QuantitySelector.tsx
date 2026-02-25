"use client";

import { Minus, Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";

interface QuantitySelectorProps {
    selectedQuantity: number;
    onQuantityChange: (quantity: number) => void;
    onDecrease: () => void;
    onIncrease: () => void;
    onContinue: () => void;
    applyingTicket: boolean;
    continuing: boolean;
    disabled?: boolean;
}

export default function QuantitySelector({
    selectedQuantity,
    onQuantityChange,
    onDecrease,
    onIncrease,
    onContinue,
    applyingTicket,
    continuing,
    disabled = false,
}: QuantitySelectorProps) {
    const t = useTranslations();

    return (
        <div className="flex items-center gap-4 flex-col sm:flex-row">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    onClick={onDecrease}
                    disabled={applyingTicket || disabled}
                    className="btn-primary w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-[#797979] transition-all duration-200"
                >
                    <Minus size={20} />
                </Button>

                <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onBlur={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        onQuantityChange(val);
                    }}
                    onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        onQuantityChange(val);
                    }}
                    className="w-16 md:w-20 h-10 md:h-12 text-center text-lg md:text-xl font-bold text-[#2f2f2f] rounded-lg focus:outline-none border !border-[#2f2f2f] ticket-quantity focus:!border-[#f3c200]"
                />

                <Button
                    type="button"
                    onClick={onIncrease}
                    disabled={applyingTicket || disabled}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full btn-primary transition-all duration-200"
                >
                    <Plus size={20} />
                </Button>
            </div>

            {/* Continue Button */}
            <Button
                className="flex-1 bg-gradient-to-r from-[#FECB02] to-[#FFD84D] hover:from-[#FFD84D] hover:to-[#FECB02] text-black font-bold py-3 px-6 md:px-8 rounded-lg transition-all shadow-lg uppercase text-sm md:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] btn-primary w-full md:h-12"
                onClick={onContinue}
                disabled={applyingTicket || continuing || disabled}
            >
                {(applyingTicket || continuing) ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t("loading") || "Loading..."}</span>
                    </>
                ) : (
                    <span>{t("continue") || "CONTINUE"}</span>
                )}
            </Button>
        </div>
    );
}

