// src/lib/filters/home.filters.ts

import { HomeSection } from "@/src/models/api/response/home";

export function getContentSection(
  sections: HomeSection[]
): HomeSection | null {
  return (
    sections && Array.isArray(sections) && sections.length > 0 ? sections.find((section) =>
      section.type === 1 &&
      section.sectionType === 1 &&
      section.visible
    ) || null : null
  );
}
