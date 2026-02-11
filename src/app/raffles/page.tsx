"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { RaffleService } from "@/src/lib/services/raffles";
import { PRODUCT_CART } from "@/src/lib/config";
import CountdownTimer from "@/src/components/CountdownTimer";

type LegacyRaffleItem = {
    _id: string;
    childProductId?: string;
    productName?: string;
    campaignTitle?: string;
    image?: { medium: string }[];
    mobileImage?: { medium: string; altText?: string }[];
    currencySymbol?: string;
    ticketPrice?: number;
    goalValue?: number;
    ticketGoalAmount?: number;
    drawDateTimeStemp?: number; // Unix timestamp (seconds)
};

const slugifyName = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const getProgressPercentage = (total?: number, goal?: number): number => {
    if (!total || !goal || total <= 0) return 0;
    const percentage = (goal / total) * 100;
    if (percentage > 100) return 100;
    return Math.round(percentage);
};

export default function RafflesPage() {
    const locale = useLocale();
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [raffles, setRaffles] = useState<LegacyRaffleItem[]>([]);

    const fetchRaffles = useCallback(() => {
        setLoading(true);

        RaffleService.getAllRaffles()
            .then((payload) => {
                // apiClient already returns response.data
                const items = (payload as any)?.data ?? [];
                setRaffles(items);
            })
            .catch((err) => {
                // Safely log error - axios interceptor returns { status, message }
                try {
                    let errorMessage = "Unknown error";
                    if (err instanceof Error) {
                        errorMessage = err.message || err.toString();
                    } else if (err && typeof err === "object") {
                        // Check for axios interceptor error format: { status, message }
                        if ("message" in err && typeof err.message === "string") {
                            errorMessage = err.message;
                            // Include status if available
                            if ("status" in err && err.status) {
                                errorMessage = `[${err.status}] ${errorMessage}`;
                            }
                        } else if ("error" in err && typeof err.error === "string") {
                            errorMessage = err.error;
                        } else {
                            // Try JSON.stringify for other object types
                            try {
                                const serialized = JSON.stringify(err, null, 2);
                                errorMessage = serialized.length > 200
                                    ? serialized.substring(0, 200) + "..."
                                    : serialized;
                            } catch {
                                errorMessage = "Error object could not be serialized";
                            }
                        }
                    } else {
                        errorMessage = String(err);
                    }
                    // eslint-disable-next-line no-console
                    console.error("Error fetching raffles:", errorMessage);
                } catch {
                    // eslint-disable-next-line no-console
                    console.error("Error fetching raffles: Unknown error");
                }
                setRaffles([]); // Set empty array on error
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchRaffles();
    }, [locale, fetchRaffles]);

    // Listen for country changes
    useEffect(() => {
        const handleCountryChange = () => {
            try {
                // Small delay to ensure cookie is updated
                setTimeout(() => {
                    fetchRaffles();
                }, 100);
            } catch (err) {
                try {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    // eslint-disable-next-line no-console
                    console.error("Error handling country change:", errorMessage);
                } catch {
                    // eslint-disable-next-line no-console
                    console.error("Error handling country change: Unknown error");
                }
            }
        };

        // Listen for custom country change event (primary method)
        if (typeof window !== "undefined") {
            window.addEventListener("countryChanged", handleCountryChange);
        }

        // Also watch for cookie changes by polling (fallback for cases where event doesn't fire)
        let lastCountryId: string | undefined;
        try {
            lastCountryId = getCookie("C_id") as string | undefined;
        } catch (err) {
            try {
                const errorMessage = err instanceof Error ? err.message : String(err);
                // eslint-disable-next-line no-console
                console.error("Error reading cookie:", errorMessage);
            } catch {
                // eslint-disable-next-line no-console
                console.error("Error reading cookie: Unknown error");
            }
        }

        const checkCountryChange = setInterval(() => {
            try {
                const currentCountryId = getCookie("C_id") as string | undefined;
                if (currentCountryId && currentCountryId !== lastCountryId) {
                    lastCountryId = currentCountryId;
                    fetchRaffles();
                }
            } catch (err) {
                try {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    // eslint-disable-next-line no-console
                    console.error("Error checking country change:", errorMessage);
                } catch {
                    // eslint-disable-next-line no-console
                    console.error("Error checking country change: Unknown error");
                }
            }
        }, 2000); // Check every 2 seconds as fallback

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("countryChanged", handleCountryChange);
            }
            clearInterval(checkCountryChange);
        };
    }, [fetchRaffles]);

    if (loading) {
        return (
            <main>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-lg text-[#797979]">Loading...</div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    return (
        <main>
            <Header />

            {/* Page Header */}
            <div className="w-full">
                <div className="text-center page-head-wrapper">
                    <h1
                        className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis"
                    >
                        {t("allRaffles")}
                    </h1>
                    <p
                        className="
            text-[13px] md:text-[16px]
            uppercase
            text-white
            leading-relaxed
            mt-2
            "
                    >
                        {t("playAndWin")}
                    </p>
                </div>

                {/* Raffles Grid */}
                <div className="mx-auto w-full max-w-[1648px] px-2 md:px-6 lg:pt-[60px] pb-[100px]">
                    <div className="mb-6 border-b border-gray-300 pb-2 flex items-center justify-between">
                        <h2 className="text-base font-bold text-[#2f2f2f] uppercase tracking-tight">
                            {raffles.length} {t("raffles")}
                        </h2>
                    </div>

                    {raffles.length === 0 ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <p className="text-lg text-[#797979]">No raffles available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto">
                            {raffles.map((raffle, index) => {
                                const name = raffle.campaignTitle ?? raffle.productName ?? "";
                                const id = raffle._id ?? raffle.childProductId ?? "";
                                const slug = name ? slugifyName(name) : id;

                                const imageSrc =
                                    raffle.image?.[0]?.medium ||
                                    raffle.mobileImage?.[0]?.medium ||
                                    PRODUCT_CART;

                                const progress = getProgressPercentage(
                                    raffle.goalValue,
                                    raffle.ticketGoalAmount
                                );

                                const endTime =
                                    raffle.drawDateTimeStemp && raffle.drawDateTimeStemp > 0
                                        ? new Date(raffle.drawDateTimeStemp * 1000)
                                        : undefined;

                                return (
                                    <Link
                                        key={`${id}-${index}`}
                                        href={id ? `/raffles/${slug}?pid=${id}&cpid=${raffle.childProductId ?? ""}` : "#"}
                                        className="bg-white rounded-[25px] shadow-xl overflow-hidden flex flex-col xl:flex-row p-4 hover:shadow-2xl transition-shadow"
                                    >
                                        <div className="aspect-video flex items-center justify-center w-full max-w-[320px] overflow-hidden rounded-[25px] bg-[#f5f5f5]">
                                            <Image
                                                src={imageSrc}
                                                alt={name || "Prize"}
                                                width={320}
                                                height={200}
                                                className="max-h-full w-full h-full object-contain rounded-[25px]"
                                            />
                                        </div>

                                        <div className="px-6 flex-grow mt-4 xl:mt-0">
                                            <div className="flex items-center gap-2 text-[#f3c200] font-bold text-sm uppercase mb-2">
                                                Buy Digital File and Participate
                                            </div>
                                            {name && (
                                                <h2 className="text-2xl font-black text-[#2f2f2f] uppercase tracking-tight line-clamp-2">
                                                    {name}
                                                </h2>
                                            )}

                                            <div className="py-4">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r to-[#f3c200] from-[#2f2f2f] h-2.5 rounded-full transition-all"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-bold text-sm">
                                                        {progress}%
                                                    </span>
                                                </div>

                                                {endTime && <CountdownTimer endTime={endTime} />}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <PreFooterIconModule />
            <Footer />
        </main>
    );
}


