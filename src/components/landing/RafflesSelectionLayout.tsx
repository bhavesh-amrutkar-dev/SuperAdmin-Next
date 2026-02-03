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
        <section className="w-full py-6">
            {/* Header */}
            <div className="mb-4 flex flex-col items-center text-center">
                <h2
                    className="
      inline-block
      w-[90%]
      pt-[15px]
      pb-2
      text-[14px] md:text-[19px]
      font-medium
      capitalize
      tracking-[1px]
      leading-[1.35]
      text-[#797979]
      overflow-hidden
      text-ellipsis
    "
                >
                    {section.title}
                </h2>

                {section.description && (
                    <div
                        className="
        text-[13px]
        uppercase
        text-[#797979]
        leading-relaxed
        max-w-[90%]
      "
                        dangerouslySetInnerHTML={{ __html: section.description }}
                    />
                )}
            </div>

            {/* List */}
            <div className="flex gap-8 overflow-x-auto space-x-4 p-8 ">
                {section.items.map((item) => (
                    <RaffleCard
                        key={item.id}
                        item={item}
                        cellType={section.cellType}
                    />
                ))}
            </div>
        </section>
    );
}
