// src/components/sections/RaffleSectionLayout.tsx

"use client";

import { RaffleSection } from "@/src/models/api/response/home";
import RaffleCard from "./RaffleCard";


export default function RaffleSectionLayout({
    section,
}: {
    section: RaffleSection;
}) {
    return (
        <section className="w-full pt-10 pb-[60px] lg:pb-[80px] xl:pb-[100px]">
            <div className="mx-auto w-full max-w-[1648px] px-2 md:px-6">
                {/* Header */}
                <div className="mb-14 text-center">
                    <div className="text-center section_heading min-w-[400px] inline-block px-8 py-3">
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
        "
                                dangerouslySetInnerHTML={{ __html: section.description }}
                            />
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-center">
                    {section.items.slice(0, 5).map((item) => (
                        <RaffleCard
                            key={item.id}
                            item={item}
                            cellType={section.cellType}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
