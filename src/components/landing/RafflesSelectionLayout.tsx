"use client";

import dynamic from "next/dynamic";
import { RaffleSection } from "@/src/models/api/response/home";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Skeleton from "../ui/skeleton";

// Lazy load RaffleCard
const RaffleCard = dynamic(() => import("./RaffleCard"), {
    ssr: false,
});

export default function RaffleSectionLayout({ section }: { section: RaffleSection }) {
    const t = useTranslations();

    const normalizedTitle = section.title?.toLowerCase() || "";
    const isMerchandiseSection = normalizedTitle.includes("merchandise");
    const isSaleSection = normalizedTitle.includes("sale");

    const viewMoreHref = isMerchandiseSection
        ? "/merchandise"
        : isSaleSection
            ? "/sale"
            : "/lotteries";

    const hasMore = section.items.length > 2;
    const itemsToShow = hasMore ? section.items.slice(0, 5) : section.items;
    const isLoading = !section.items || section.items.length === 0;

    return (
        <section className="w-full pt-10 pb-10 lg:pb-15 xl:pb-20">
            <div className="mx-auto w-full max-w-412 px-4 md:px-6">
                {/* Header */}
                <div className="mb-10 md:mb-14 text-center">
                    <h2 className="pt-2 pb-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-[1px] leading-tight text-gray-900">
                        {section.title}
                    </h2>
                    {section.description && (
                        <div
                            className="mt-2 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed font-medium"
                            dangerouslySetInnerHTML={{ __html: section.description }}
                        />
                    )}
                </div>

                {/* Card List */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-center">
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="w-full h-60 rounded-2xl" />
                        ))
                        : itemsToShow.map((item) => {
                            if (!item.id) return null;

                            const slugifyName = (name: string) =>
                                name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

                            const slug = item.name ? slugifyName(item.name) : item.id;
                            const campaignId = (item as any).campaignId || item.id;
                            const childProductId = (item as any).childProductId || "";

                            const href = `/raffles/${slug}?pid=${campaignId}${childProductId ? `&cpid=${childProductId}` : ""
                                }`;

                            return (
                                <Link key={item.id} href={href} className="block w-full">
                                    <div className="transform transition duration-300 hover:scale-105 hover:shadow-lg rounded-2xl overflow-hidden">
                                        <RaffleCard item={item} cellType={section.cellType} />
                                    </div>
                                </Link>
                            );
                        })}
                </div>

                {/* View More */}
                {hasMore && (
                    <div className="mt-10 text-center">
                        <Link
                            href={"/raffles"}
                            className="
        inline-flex items-center justify-center
        px-8 py-3
        bg-linear-to-r from-yellow-400 to-yellow-500
        text-black font-bold text-base sm:text-lg
        rounded-3xl
        shadow-md
        transition-all duration-300
        hover:shadow-xl hover:scale-105
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
      "
                        >
                            {t("viewMore")}
                            {/* Optional arrow icon */}
                            <svg
                                className="ml-2 w-4 h-4 sm:w-5 sm:h-5 text-black"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                )}

            </div>
        </section>
    );
}
