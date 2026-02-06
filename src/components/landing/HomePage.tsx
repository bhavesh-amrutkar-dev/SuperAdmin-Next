"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { HomeService } from "@/src/lib/services/home";
import {
  HomeSection,
  HomeBanner,
  RaffleSection,
  RaffleItem,
} from "@/src/models/api/response/home";
import { RaffleService } from "@/src/lib/services/raffles";
import { PRODUCT_CART } from "@/src/lib/config";

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
import { useTranslations } from "next-intl";

type LegacyRaffleItem = {
  _id: string;
  campaignId?: string;
  childProductId?: string;
  productName?: string;
  campaignTitle?: string;
  image?: { medium: string }[];
  mobileImage?: { medium: string; altText?: string }[];
  currencySymbol?: string;
  ticketPrice?: number;
  goalValue?: number;
  ticketGoalAmount?: number;
  drawDateTimeStemp?: number;
};

const slugifyName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [contentSection, setContentSection] =
    useState<MappedContentSection | null>(null);
  const [raffleSections, setRaffleSections] = useState<RaffleSection[]>([]);
  const [raffles, setRaffles] = useState<LegacyRaffleItem[]>([]);
  const [raffleSection, setRaffleSection] = useState<RaffleSection | null>(null);
  const [loadingRaffles, setLoadingRaffles] = useState(false);

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
      .then((res: any) => {
        const sections: HomeSection[] = res.data;
        console.log("🚀 ~ HomePage ~ sections:", sections)

        // Show all banner images
        if (res.banner_images && Array.isArray(res.banner_images) && res.banner_images.length > 0) {
          setBanners(mapBanners(res.banner_images, locale));
        }

        // const content = getContentSection(sections);
        // if (content) {
        //   setContentSection(mapContentSection(content));
        // }

        // const raffles = getRaffleSections(sections)
        //   .map(mapRaffleSection)
        //   // Hide merchandise sections from the dashboard/home page
        //   .filter(
        //     (section) =>
        //       !section.title?.toLowerCase().includes("merchandise")
        //   );
        // setRaffleSections(raffles);
      })
      .finally(() => setLoading(false));
  }, [locale, router]);

  // Fetch all raffles
  const fetchRaffles = useCallback(() => {
    setLoadingRaffles(true);
    RaffleService.getAllRaffles()
      .then((payload) => {
        const items = (payload as any)?.data ?? [];
        setRaffles(items);

        // Log first item structure to debug API response
        if (items.length > 0) {
          console.log("First raffle item structure:", items[0]);
          console.log("Available fields:", Object.keys(items[0]));
        }

        // Map to RaffleSection format for RafflesSelectionLayout
        const raffleItems: (RaffleItem & { childProductId?: string; campaignId?: string })[] = items.slice(0, 5)
          .filter((raffle: LegacyRaffleItem) => {
            // Only include raffles that have a valid campaignId or _id (not a slug)
            const hasValidId = raffle.campaignId || raffle._id || raffle.childProductId;
            return !!hasValidId;
          })
          .map((raffle: LegacyRaffleItem) => {
            const name = raffle.campaignTitle ?? raffle.productName ?? "";

            // Validate ID format - MongoDB ObjectIds are 24 hex characters (no hyphens)
            const isValidObjectId = (id: string) => {
              if (!id || typeof id !== "string") return false;
              // MongoDB ObjectId: 24 hex characters, no hyphens
              return /^[a-f0-9]{24}$/i.test(id);
            };

            // Check all possible fields for campaignId (case-insensitive check)
            const raffleAny = raffle as any;
            const possibleCampaignIds = [
              raffle.campaignId,
              raffleAny.campaign_id,
              raffleAny.campaignId,
              raffleAny.CampaignId,
              raffle._id,
              raffle.childProductId,
              raffleAny.productId,
            ].filter(Boolean);

            // Find the first valid ObjectId
            let finalCampaignId = "";
            for (const id of possibleCampaignIds) {
              if (isValidObjectId(id)) {
                finalCampaignId = id;
                break;
              }
            }

            // Log if we couldn't find a valid ID
            if (!finalCampaignId) {
              console.error("No valid campaignId found for raffle:", {
                name: name,
                availableIds: possibleCampaignIds,
                raffleKeys: Object.keys(raffle),
                raffle
              });
            } else if (!raffle.campaignId && finalCampaignId !== raffle.campaignId) {
              // Log if we're using a fallback ID
              console.warn("Using fallback ID as campaignId:", {
                campaignId: raffle.campaignId,
                finalCampaignId: finalCampaignId,
                name: name
              });
            }

            const imageSrc =
              raffle.image?.[0]?.medium ||
              raffle.mobileImage?.[0]?.medium ||
              PRODUCT_CART;
            const price = raffle.goalValue ?? raffle.ticketPrice ?? 0;
            const currencySymbol = raffle.currencySymbol || "$";

            // Only return item if we have a valid campaignId
            if (!finalCampaignId) {
              return null;
            }

            return {
              id: finalCampaignId, // Use the final campaignId as the ID
              name: name,
              price: price,
              currencySymbol: currencySymbol,
              image: imageSrc,
              childProductId: raffle.childProductId,
              campaignId: finalCampaignId, // Store the actual campaignId for API calls
            };
          })
          .filter((item: (RaffleItem & { childProductId?: string; campaignId?: string }) | null): item is RaffleItem & { childProductId?: string; campaignId?: string } => item !== null);

        // Use translations function directly to avoid dependency issues
        const title = t("allRaffles") || "ALL RAFFLES";
        const description = t("playAndWin") || "PLAY AND WIN!";

        setRaffleSection({
          id: "all-raffles",
          title: title,
          description: description,
          cellType: 1,
          items: raffleItems,
        });
      })
      .catch((err) => {
        console.error("Error fetching raffles:", err);
        setRaffles([]);
        setRaffleSection(null);
      })
      .finally(() => setLoadingRaffles(false));
  }, [locale, t]);

  useEffect(() => {
    // Small delay to ensure cookies are updated after language change
    const timer = setTimeout(() => {
      fetchRaffles();
    }, 100);

    return () => clearTimeout(timer);
  }, [locale, fetchRaffles]);

  // Listen for locale changes via custom event
  useEffect(() => {
    const handleLocaleChange = () => {
      // Delay to ensure cookies are updated after language change
      setTimeout(() => {
        fetchRaffles();
      }, 200);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("localeChanged", handleLocaleChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("localeChanged", handleLocaleChange);
      }
    };
  }, [fetchRaffles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      {banners && banners.length > 0 && <HeroSlider banners={banners} />}

      {/* {contentSection && <HomeContentSection {...contentSection} />} */}
      <HowItWorksSection />

      {/* Lotteries Section */}
      {loadingRaffles ? (
        <section className="w-full pt-10 pb-[60px] lg:pb-[80px] xl:pb-[100px]">
          <div className="mx-auto w-full max-w-[1648px] px-2 md:px-6">
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-lg text-[#797979]">{t("loading") || "Loading..."}</div>
            </div>
          </div>
        </section>
      ) : raffleSection && raffleSection.items.length > 0 ? (
        <RaffleSectionLayout section={raffleSection} />
      ) : null}
      {/* {raffleSections.map((section) => (
        <RaffleSectionLayout key={section.id} section={section} />
      ))} */}
    </>
  );
}
