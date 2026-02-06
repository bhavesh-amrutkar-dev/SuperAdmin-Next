"use client";

import { useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";
import { useTranslations } from "next-intl";

import {
    COUNTRY,
    COUNTRY_CODE,
    DEFAULT_COUNTRY,
    DEFAULT_COUNTRY_CODE,
} from "@/src/lib/config";
import { CountryService, CountryApiItem } from "@/src/lib/services/country";

type CountryOption = {
    id: string;
    code: string;
    name: string;
};

const FALLBACK_COUNTRIES: CountryOption[] = [
    {
        id: "fallback-do",
        code: "DO",
        name: "Dominican Republic",
    },
    {
        id: "fallback-pr",
        code: "PR",
        name: "Puerto Rico",
    },
    {
        id: "fallback-us",
        code: "US",
        name: "United States of America",
    },
];

type CountrySelectorModalProps = {
    open: boolean;
    onClose: () => void;
    onCountryChange?: (country: CountryOption) => void;
};

export default function CountrySelectorModal({
    open,
    onClose,
    onCountryChange,
}: CountrySelectorModalProps) {
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [countries, setCountries] = useState<CountryOption[]>(FALLBACK_COUNTRIES);
    const t = useTranslations();

    useEffect(() => {
        if (!open) return;

        const existingCode =
            (getCookie(COUNTRY_CODE) as string | undefined) || DEFAULT_COUNTRY_CODE;
        setSelectedCode(existingCode);

        CountryService.getCountries()
            .then((payload) => {
                const apiCountries = (payload as any)?.data ?? [];

                const mapped: CountryOption[] = (apiCountries as CountryApiItem[]).map(
                    (c) => ({
                        id: c._id,
                        code: c.countryCode,
                        name: c.countryName,
                    })
                );

                if (mapped.length) {
                    setCountries(mapped);
                }
            })
            .catch(() => {
                // fall back silently to static list
            });
    }, [open]);

    if (!open) return null;

    const handleContinue = () => {
        const selected =
            countries.find((c) => c.code === selectedCode) ??
            countries.find((c) => c.code === DEFAULT_COUNTRY_CODE) ??
            countries[0];

        if (!selected) {
            return;
        }

        setCookie(COUNTRY_CODE, selected.code, {
            maxAge: 60 * 60 * 24 * 365,
        });
        setCookie(COUNTRY, selected.name || DEFAULT_COUNTRY, {
            maxAge: 60 * 60 * 24 * 365,
        });
        setCookie("C_id", selected.id, {
            maxAge: 60 * 60 * 24 * 365,
        });

        // Mirror country code in localStorage for compatibility with legacy logic
        try {
            if (typeof window !== "undefined") {
                window.localStorage.setItem("C_code", selected.code);
            }
        } catch {
            // ignore localStorage errors (e.g. in private mode)
        }

        onCountryChange?.(selected);

        // Dispatch custom event for country change
        try {
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("countryChanged", { detail: selected }));
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Error dispatching country change event:", err);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="mx-4 w-full max-w-3xl rounded-lg bg-white shadow-2xl">
                {/* Top accent bar */}
                <div className="h-3 w-full rounded-t-lg bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400" />

                <div className="px-8 pb-8 pt-6">
                    {/* Search bar (visual only for now) */}
                    <div className="mb-8">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full rounded-full border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-yellow-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                placeholder={t("countryModalSearchPlaceholder")}
                                disabled
                            />
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                🔍
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-8">
                        <p className="text-center text-lg font-semibold uppercase leading-tight text-gray-900">
                            {t("countryModalTitle")}
                        </p>
                    </div>

                    {/* Country options */}
                    <div className="mb-10 max-h-[60vh] overflow-y-auto pr-2 flex flex-wrap items-stretch justify-center gap-8">
                        {countries.map((country) => {
                            const isSelected = selectedCode === country.code;

                            return (
                                <button
                                    key={country.id}
                                    type="button"
                                    onClick={() => setSelectedCode(country.code)}
                                    className={`flex w-40 flex-col items-center rounded-md border px-4 py-4 transition ${isSelected
                                        ? "border-yellow-400 bg-yellow-50 shadow-md"
                                        : "border-gray-200 bg-white hover:border-yellow-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold">
                                        {country.code}
                                    </div>
                                    <span className="text-center text-sm font-semibold text-gray-900">
                                        {country.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                        >
                            {t("countryModalCancel")}
                        </button>

                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={!selectedCode}
                            className={`min-w-[160px] rounded-md px-8 py-2 text-sm font-semibold uppercase tracking-wide text-gray-900 ${selectedCode
                                ? "bg-yellow-400 hover:bg-yellow-500"
                                : "cursor-not-allowed bg-gray-300 text-gray-500"
                                }`}
                        >
                            {t("countryModalContinue")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
