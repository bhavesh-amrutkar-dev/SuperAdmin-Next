// src/lib/filters/home.filters.ts

import { HomeSection } from "@/src/models/api/response/home";


export function getHeroBannerSection(
    sections: HomeSection[]
): HomeSection | null {
    console.log(sections);

    return (
        sections.find(
            (section) =>
                section.type === 2 &&
                section.sectionType === 1 &&
                Array.isArray(section.banner_image) &&
                section.banner_image.length > 0
        ) || null
    );
}


export function getRaffleSections(sections: any[]) {
    return sections.filter(
        (section) =>
            section.type === 3 &&
            section.visible === true &&
            Array.isArray(section.entity) &&
            section.entity.length > 0
    );
}
