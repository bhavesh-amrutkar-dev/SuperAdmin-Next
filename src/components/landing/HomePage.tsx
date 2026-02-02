// src/app/home/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { HomeService } from "@/src/lib/services/home";
import { HomeSection, HomeBanner } from "@/src/models/api/response/home";

import { getHeroBannerSection } from "@/src/lib/filters/home";

import { mapBanners } from "@/src/lib/mappers/home";
import {
  mapContentSection,
  MappedContentSection,
} from "@/src/lib/mappers/home";

import HeroSlider from "./Hero";
import { getContentSection } from "@/src/lib/filters/homeContent";
import HomeContentSection from "./HomeContentSection";

export default function HomePage() {
  const locale = useLocale();

  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [contentSection, setContentSection] =
    useState<MappedContentSection | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    HomeService.getHomePage(1)
      .then((res) => {
        const sections: HomeSection[] = res.data;

        const heroSection = getHeroBannerSection(sections);
        if (heroSection) {
          setBanners(mapBanners(heroSection.banner_image, locale));
        }

        const content = getContentSection(sections);
        if (content) {
          setContentSection(mapContentSection(content));
        }
      })
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {banners.length > 0 && <HeroSlider banners={banners} />}

      {contentSection && (
        <HomeContentSection {...contentSection} />
      )}
    </>
  );
}
