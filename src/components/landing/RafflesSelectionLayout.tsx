// src/components/sections/RaffleSectionLayout.tsx

"use client";

import { RaffleSection } from "@/src/models/api/response/home";
import RaffleCard from "./RaffleCard";
import { useTranslations } from "next-intl";
import Link from "next/link";


export default function RaffleSectionLayout({
    section,
}: {
    section: RaffleSection;
}) {
    const t = useTranslations();

    const normalizedTitle = section.title?.toLowerCase() || "";
    const isMerchandiseSection = normalizedTitle.includes("merchandise");
    const isSaleSection = normalizedTitle.includes("sale");

    let viewMoreHref = "/lotteries";
    if (isMerchandiseSection) {
        viewMoreHref = "/merchandise";
    } else if (isSaleSection) {
        viewMoreHref = "/sale";
    }

    return (
        <section className="w-full pt-10 pb-[60px] lg:pb-[80px] xl:pb-[100px]">
            <div className="mx-auto w-full max-w-[1648px] px-2 md:px-6">
                {/* Header */}
                <div className="mb-14 text-center">
                    <h2
                        className="
        pt-2
        pb-2
        text-lg md:text-2xl lg:text-3xl xl:text-4xl
        font-bold
        uppercase
        tracking-[1px]
        leading-[1.35]
        text-[#2F2F2F]
        overflow-hidden
        text-ellipsis
        "
                    >
                        {section.title}
                    </h2>

                    {section.description && (
                        <div
                            className="
            text-sm md:text-base 
            capitalize
            text-[#7c7878]
            leading-relaxed
            font-medium
            mt-2
        "
                            dangerouslySetInnerHTML={{ __html: section.description }}
                        />
                    )}
                </div>

                {/* List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-center">
                    {section.items.slice(0, 5).map((item) => {
                        const slugifyName = (name: string) =>
                            name
                                .toLowerCase()
                                .trim()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "");

                        const slug = item.name ? slugifyName(item.name) : item.id;

                        // Validate MongoDB ObjectId format (24 hex characters)
                        const isValidObjectId = (id: string | null | undefined): id is string => {
                            if (!id || typeof id !== "string") return false;
                            // MongoDB ObjectId: 24 hex characters, no hyphens
                            return /^[a-f0-9]{24}$/i.test(id);
                        };

                        // Get campaignId from item - it MUST be a valid ObjectId
                        let campaignId = (item as any).campaignId;

                        // Validate campaignId - it must be a valid MongoDB ObjectId
                        if (!campaignId || !isValidObjectId(campaignId)) {
                            // If campaignId is missing or invalid, check item.id
                            if (item.id && isValidObjectId(item.id)) {
                                campaignId = item.id;
                                console.warn("Using item.id as campaignId (campaignId field missing/invalid):", {
                                    campaignId: (item as any).campaignId,
                                    itemId: item.id,
                                    name: item.name
                                });
                            } else {
                                // Both are invalid - skip this item
                                console.error("Skipping raffle card - no valid campaignId (must be 24 hex chars):", {
                                    campaignId: (item as any).campaignId,
                                    itemId: item.id,
                                    slug,
                                    name: item.name,
                                    item
                                });
                                return null;
                            }
                        }

                        // Double-check: campaignId must not be the slug
                        if (campaignId === slug) {
                            console.error("campaignId matches slug - this should never happen:", {
                                campaignId,
                                slug,
                                itemId: item.id,
                                name: item.name,
                                item
                            });
                            return null;
                        }

                        const childProductId = (item as any).childProductId || "";

                        // Construct URL with validated campaignId
                        const href = `/reffles/${slug}?pid=${campaignId}${childProductId ? `&cpid=${childProductId}` : ""}`;


                        return (
                            <Link
                                key={item.id}
                                href={href}
                                className="block"
                            >
                                <RaffleCard
                                    item={item}
                                    cellType={section.cellType}
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
