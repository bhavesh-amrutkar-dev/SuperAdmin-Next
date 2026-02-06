"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import { HomeService } from "@/src/lib/services/home";
import { RaffleService } from "@/src/lib/services/raffles";
import { PRODUCT_CART } from "@/src/lib/config";

import {
  HomeBanner,
  RaffleSection,
  RaffleItem,
} from "@/src/models/api/response/home";

import { mapBanners } from "@/src/lib/mappers/home";

import HeroSlider from "./Hero";
import HowItWorksSection from "./HowItWorks";
import RaffleSectionLayout from "./RafflesSelectionLayout";
import { FullScreenLoader } from "../fullScreenLoader";

type LegacyRaffleItem = {
  _id?: string;
  campaignId?: string;
  childProductId?: string;
  productName?: string;
  campaignTitle?: string;
  image?: { medium: string }[];
  mobileImage?: { medium: string }[];
  currencySymbol?: string;
  ticketPrice?: number;
  goalValue?: number;
};

const isObjectId = (id?: string) =>
  typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations();

  const abortRef = useRef<AbortController | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingRaffles, setLoadingRaffles] = useState(false);

  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [raffleSection, setRaffleSection] = useState<RaffleSection | null>(null);

  /* -----------------------------
     Fetch Home Page Content
  ------------------------------ */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res: any = await HomeService.getHomePage(1);

        if (!active) return;

        if (Array.isArray(res?.banner_images)) {
          setBanners(mapBanners(res.banner_images, locale));
        }
      } catch {
        // silent fail – home page should not break
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [locale]);

  /* -----------------------------
     Fetch Raffles (SAFE)
  ------------------------------ */
  const fetchRaffles = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoadingRaffles(true);

    try {
      const payload: any = await RaffleService.getAllRaffles(undefined, {
        signal: abortRef.current.signal,
      });

      const items: LegacyRaffleItem[] = Array.isArray(payload?.data)
        ? payload.data
        : [];

      const raffleItems: RaffleItem[] = items
        .slice(0, 5)
        .map((raffle) => {
          const campaignId =
            raffle.campaignId ||
            raffle._id ||
            raffle.childProductId;

          if (!isObjectId(campaignId)) return null;

          return {
            id: campaignId,
            name:
              raffle.campaignTitle ||
              raffle.productName ||
              "",
            price:
              raffle.goalValue ??
              raffle.ticketPrice ??
              0,
            currencySymbol:
              raffle.currencySymbol || "$",
            image:
              raffle.image?.[0]?.medium ||
              raffle.mobileImage?.[0]?.medium ||
              PRODUCT_CART,
          };
        })
        .filter(Boolean) as RaffleItem[];

      if (raffleItems.length === 0) {
        setRaffleSection(null);
        return;
      }

      setRaffleSection({
        id: "all-raffles",
        title: t("allRaffles") ?? "ALL RAFFLES",
        description: t("playAndWin") ?? "PLAY AND WIN!",
        cellType: 1,
        items: raffleItems,
      });
    } catch (err: any) {
      if (err?.name !== "AbortError") {
       
        setRaffleSection(null);
      }
    } finally {
      setLoadingRaffles(false);
    }
  }, [t]);

  /* -----------------------------
     Re-fetch on locale change
  ------------------------------ */
  useEffect(() => {
    fetchRaffles();
    return () => abortRef.current?.abort();
  }, [locale, fetchRaffles]);

  /* -----------------------------
     Render
  ------------------------------ */
  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      {banners.length > 0 && <HeroSlider banners={banners} />}

      <HowItWorksSection />

      {loadingRaffles ? (
        <section className="py-20 text-center text-[#797979]">
          {t("loading") ?? "Loading..."}
        </section>
      ) : raffleSection ? (
        <RaffleSectionLayout section={raffleSection} />
      ) : null}
    </>
  );
}