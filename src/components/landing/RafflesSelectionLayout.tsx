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

    const itemsToShow = section.items.slice(0, 5);
    const hasMore = section.items.length > 5;

    const isLoading = !section.items || section.items.length === 0;

    return (
        <section className="w-full pt-10 pb-[60px] lg:pb-[80px] xl:pb-[100px]">
            <div className="mx-auto w-full max-w-[1648px] px-2 md:px-6">
                {/* Header */}
                <div className="mb-14 text-center">
                    <h2 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-[#2F2F2F] overflow-hidden text-ellipsis">
                        {section.title}
                    </h2>
                    {section.description && (
                        <div
                            className="text-sm md:text-base capitalize text-[#7c7878] leading-relaxed font-medium mt-2"
                            dangerouslySetInnerHTML={{ __html: section.description }}
                        />
                    )}
                </div>

                {/* Card List */}
                <div className="flex gap-4 flex-wrap justify-center">
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-[calc(20%-0.8rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-1rem)]"
                            >
                                <Skeleton />
                            </div>
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
                                <Link
                                    key={item.id}
                                    href={href}
                                    className="block w-[calc(20%-0.8rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc(20%-1rem)]"
                                >
                                    <div className="transform transition duration-300 hover:scale-105 hover:shadow-lg rounded-2xl overflow-hidden">
                                        <RaffleCard item={item} cellType={section.cellType} />
                                    </div>
                                </Link>
                            );
                        })}
                </div>

                {/* View More */}
                {hasMore && (
                    <div className="mt-6 text-center">
                        <Link
                            href={viewMoreHref}
                            className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
                        >
                            {t("viewMore")}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
