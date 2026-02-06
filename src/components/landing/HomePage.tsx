"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { HomeService } from "@/src/lib/services/home";
import {
  HomeSection,
  HomeBanner,
  RaffleSection,
} from "@/src/models/api/response/home";

import { getHeroBannerSection, getRaffleSections } from "@/src/lib/filters/home";
import { mapBanners, mapRaffleSection } from "@/src/lib/mappers/home";
import {
  mapContentSection,
  MappedContentSection,
} from "@/src/lib/mappers/home";

import HeroSlider from "./Hero";
import { getContentSection } from "@/src/lib/filters/homeContent";
import HomeContentSection from "./HomeContentSection";
import RaffleSectionLayout from "./RafflesSelectionLayout";
import HowItWorksSection from "./HowItWorks";

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();

  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [contentSection, setContentSection] =
    useState<MappedContentSection | null>(null);
  const [raffleSections, setRaffleSections] = useState<RaffleSection[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // /** 🔐 AUTH CHECK */
    // const token = localStorage.getItem("access_token");

    // if (!token) {
    //   router.replace("/auth/login");
    //   return;
    // }

    /** ✅ FETCH HOME DATA */
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

        const raffles = getRaffleSections(sections).map(mapRaffleSection);
        setRaffleSections(raffles);
      })
      .finally(() => setLoading(false));
  }, [locale, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      {banners.length > 0 && <HeroSlider banners={banners} />}

      {/* {contentSection && <HomeContentSection {...contentSection} />} */}

      <HowItWorksSection />

      {/* {raffleSections.map((section) => (
        <RaffleSectionLayout key={section.id} section={section} />
      ))} */}
    </>
  );
}
