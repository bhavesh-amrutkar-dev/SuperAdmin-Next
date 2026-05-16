// src/lib/filters/home.filters.ts

import { BannerImage, HomeSection } from "@/src/models/api/response/home";


export function getHeroBannerSection(
    sections: BannerImage[]
): BannerImage[] | null {

    const foundBanner = sections?.find(
        (section) =>
            section.linkWith === "Category" &&
            Array.isArray(section.data) &&
            section.data.length > 0
    );

    return foundBanner ? [foundBanner] : null;
}


export function getRaffleSections(sections: any[]) {
    return sections && Array.isArray(sections) && sections.length > 0 ? sections.filter(
        (section) =>
            section.type === 3 &&
            section.visible === true &&
            Array.isArray(section.entity) &&
            section.entity.length > 0
    ) || [] : [];
}
