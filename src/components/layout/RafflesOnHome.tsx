"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
    cashAwardAmount?: number;
    ticketGoalAmount?: number;
    drawDateTimeStemp?: number; // Unix timestamp (seconds)
};

const slugifyName = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

// Calculate progress percentage: (current amount / target amount) * 100
// goalValue = target amount, ticketGoalAmount = current amount sold
const getProgressPercentage = (goalValue?: number, ticketGoalAmount?: number): number => {
    if (!goalValue || !ticketGoalAmount || goalValue <= 0) return 0;
    const percentage = (ticketGoalAmount / goalValue) * 100;
    if (percentage > 100) return 100;
    return Math.round(percentage);
};

export default function RafflesOnHome() {
    const locale = useLocale();
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [raffles, setRaffles] = useState<LegacyRaffleItem[]>([]);
    const fetchingRafflesRef = useRef(false);
    const lastFetchedLocaleRef = useRef<string | null>(null);

    const fetchRaffles = useCallback(() => {
        // Prevent duplicate calls
        if (fetchingRafflesRef.current) {
            return;
        }

        fetchingRafflesRef.current = true;
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
                    console.warn("Error fetching raffles:", errorMessage);
                } catch {
                    // eslint-disable-next-line no-console
                    console.warn("Error fetching raffles: Unknown error");
                }
                setRaffles([]); // Set empty array on error
            })
            .finally(() => {
                setLoading(false);
                fetchingRafflesRef.current = false;
            });
    }, []);

    useEffect(() => {
        // Prevent duplicate calls for the same locale
        if (lastFetchedLocaleRef.current === locale && fetchingRafflesRef.current) {
            return;
        }

        lastFetchedLocaleRef.current = locale;
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
                    console.warn("Error handling country change:", errorMessage);
                } catch {
                    // eslint-disable-next-line no-console
                    console.warn("Error handling country change: Unknown error");
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
                console.warn("Error reading cookie:", errorMessage);
            } catch {
                // eslint-disable-next-line no-console
                console.warn("Error reading cookie: Unknown error");
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
                    console.warn("Error checking country change:", errorMessage);
                } catch {
                    // eslint-disable-next-line no-console
                    console.warn("Error checking country change: Unknown error");
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


    function RaffleSkeletonCard() {
        return (
            <div id="raffles" className="relative overflow-hidden bg-white rounded-4xl shadow-xl flex flex-col p-4">
                {/* shimmer layer */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                {/* Image skeleton */}
                <div className="aspect-video w-full h-[250px] rounded-4xl bg-gradient-to-br from-gray-200 to-gray-300" />

                <div className="flex-grow mt-4 bg-gray-50 p-4 rounded-4xl flex flex-col">
                    {/* Tag line */}
                    <div className="h-4 w-40 bg-gray-300 rounded mb-3" />

                    {/* Title */}
                    <div className="space-y-2 mb-4">
                        <div className="h-5 w-3/4 bg-gray-300 rounded" />
                        <div className="h-5 w-1/2 bg-gray-300 rounded" />
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-4 mt-auto">
                        <div className="w-full h-2.5 bg-gray-300 rounded-full" />
                        <div className="h-4 w-10 bg-gray-300 rounded" />
                    </div>

                    {/* Countdown */}
                    <div className="mt-4 h-6 w-32 bg-gray-300 rounded" />
                </div>
            </div>
        );
    }

    // if (loading) {
    //     return (
    //         <main>
    //             <Header />

    //             <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 pt-10 lg:pt-[60px] pb-10">
    //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 mx-auto">
    //                     {Array.from({ length: 6 }).map((_, index) => (
    //                         <RaffleSkeletonCard key={index} />
    //                     ))}
    //                 </div>
    //             </div>

    //             <PreFooterIconModule />
    //             <Footer />
    //         </main>
    //     );
    // }
    return (
        <main>

            {/* Page Header */}
            <section className="mx-auto w-full max-w-[1648px] px-2 md:px-6 pt-8 lg:pt-4 xl:pt-8 pb-7 lg:pb-9 xl:pb-10">

                {/* Raffles Grid */}
                {/* <div className="p-3 mb-6 border-b border-gray-300 pb-3 flex items-center justify-between">
                    <h2 className="text-lg lg:text-2xl font-bold text-[#2f2f2f] uppercase tracking-tight flex items-center gap-2">
                        <span className="bg-[#f3c200] text-[#2f2f2f] py-1 px-2 text-lg lg:text-xl rounded-lg !leading-none">
                            {loading ? "..." : raffles.length}
                        </span>
                        {t("raffles")}
                    </h2>
                </div> */}
                <div className="text-center mb-10 lg:mb-12">
                    <div className="text-center section_heading min-w-[200px] lg:min-w-[400px] inline-block px-8 py-3">
                        <h2 className="
      text-lg md:text-2xl lg:text-3xl xl:text-4xl
      font-bold
      uppercase
      tracking-[1px]
      leading-[1.35]
      text-[#2F2F2F]
      overflow-hidden
      text-ellipsis
    ">
                            {t("allRaffles") ?? "ALL RAFFLES"}
                        </h2>
                    </div>

                    <p className="mt-2 text-sm md:text-base text-[#797979]">
                        {t("playAndWin") ?? "PLAY AND WIN!"}
                    </p>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 mx-auto">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <RaffleSkeletonCard key={index} />
                        ))}
                    </div>
                ) : raffles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                        <div className="text-6xl mb-4 opacity-20">🎟️</div>
                        <h3 className="text-2xl font-bold text-[#2f2f2f] mb-2">
                            {t("noRflAvl")}
                        </h3>
                        <p className="text-[#797979] max-w-md">
                            {t("checkBackLater")}
                        </p>
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 mx-auto">
                        {raffles.map((raffle, index) => {
                            const name = raffle.campaignTitle ?? raffle.productName ?? "";
                            const productName = raffle.productName ?? "";
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
                                    className="bg-white rounded-4xl shadow-xl flex flex-col p-4 hover:shadow-2xl transition-shadow"
                                >
                                    <div className="aspect-video flex items-center justify-center w-full h-[250px] overflow-hidden rounded-4xl bg-white">
                                        <Image
                                            src={imageSrc}
                                            alt={name || "Prize"}
                                            width={320}
                                            height={320}
                                            className="max-h-full w-full h-full object-contain rounded-4xl"
                                        />
                                    </div>

                                    <div className="flex-grow mt-4 bg-gray-50 p-4 rounded-4xl flex flex-col">
                                        <div>
                                            <div className="flex items-center gap-2 text-[#FECB02] font-bold text-sm uppercase mb-2">
                                                {t("buyDigitalFileAndParticipate")}
                                            </div>

                                            <div className="min-h-[80px] space-y-1">
                                                {name && (
                                                    <h2 className="text-lg md:text-xl font-black text-[#2F2F2F] tracking-tight line-clamp-2">
                                                        {name}
                                                    </h2>
                                                )}

                                                {productName && (
                                                    <p className="text-sm md:text-base font-medium text-[#797979] line-clamp-1">
                                                        {productName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-3">
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
                                        </div>

                                        {endTime && <CountdownTimer endTime={endTime} />}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

        </main>
    );
}


