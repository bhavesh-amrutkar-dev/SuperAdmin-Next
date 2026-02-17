"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getCookie } from "cookies-next";

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
import { useAuth } from "@/src/context/authContext";
import Loader from "../loader";

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

export default function HomePageClient({ initialBanners = [], initialRaffles }: { initialBanners?: HomeBanner[], initialRaffles?: RaffleSection | null }) {
  const locale = useLocale();
  const t = useTranslations();
  const { ready } = useAuth();

  const abortRef = useRef<AbortController | null>(null);

  const [loading, setLoading] = useState(initialBanners.length === 0);
  const [loadingRaffles, setLoadingRaffles] = useState(false);

  const [banners, setBanners] = useState<HomeBanner[]>(initialBanners);
  const [raffleSection, setRaffleSection] = useState<RaffleSection | null>(initialRaffles || null);
  const [countryId, setCountryId] = useState<string | null>(null);

  /* -----------------------------
     Resolve Country ID
  ------------------------------ */
  useEffect(() => {
    const id = getCookie("C_id");
    if (id) setCountryId(id as string);
  }, []);
  /* -----------------------------
     Listen for country changes
  ------------------------------ */
  useEffect(() => {
    const handleCountryChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id) {
        setCountryId(customEvent.detail.id);
      } else {
        // fallback: re-read cookie
        const id = getCookie("C_id");
        if (id) setCountryId(id as string);
      }
    };

    window.addEventListener("countryChanged", handleCountryChange);

    return () => {
      window.removeEventListener("countryChanged", handleCountryChange);
    };
  }, []);

  /* -----------------------------
     Fetch Home Page Content
  ------------------------------ */
  useEffect(() => {
    if (!ready) return;

    // If we already have banners (from server), don't fetch again unless needed (e.g., refresh?)
    // For now, if banners are present, we assume we are good.
    if (initialBanners.length > 0) {
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const res = await HomeService.getHomePage(1);

        if (!active) return;

        if (Array.isArray(res?.banner_images)) {
          setBanners(mapBanners(res.banner_images, locale));
        }
      } catch {
        // silent fail
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [ready, locale]);

  /* -----------------------------
     Fetch Raffles
  ------------------------------ */
  const fetchRaffles = useCallback(async () => {
    // Skip if we already have raffles from server
    if (initialRaffles) return;

    if (!countryId) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingRaffles(true);

    try {
      const payload: any = await RaffleService.getAllRaffles(undefined, {
        signal: controller.signal,
      });

      const items: LegacyRaffleItem[] = Array.isArray(payload?.data)
        ? payload.data
        : [];

      const raffleItems: RaffleItem[] = items
        // .slice(0, 5)
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

      if (raffleItems.length > 0) {
        setRaffleSection({
          id: "all-raffles",
          title: t("allRaffles") ?? "ALL RAFFLES",
          description: t("playAndWin") ?? "PLAY AND WIN!",
          cellType: 1,
          items: raffleItems,
        });
      }

    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.warn("Failed to load raffles", err);
      }
    } finally {
      setLoadingRaffles(false);
    }
  }, [countryId, t]);

  /* -----------------------------
     Trigger Raffle Fetch
  ------------------------------ */
  useEffect(() => {
    if (!ready || !countryId) return;

    fetchRaffles();

    return () => {
      abortRef.current?.abort();
    };
  }, [ready, countryId, locale, fetchRaffles]);

  /* -----------------------------
     Render
  ------------------------------ */
  if (loading && banners.length === 0) {
    return <FullScreenLoader />;
  }


  return (
    <>
      {banners.length > 0 && <HeroSlider banners={banners} />}



      {loadingRaffles ? (
        <section className="py-20 text-center text-[#797979]">

          <Loader />
          {/* {t("loading") ?? "Loading..."} */}
        </section>
      ) : raffleSection ? (
        <RaffleSectionLayout
          section={raffleSection}
          viewMoreLabel={t("viewMore") ?? "View More"}
        />

      ) : null}

      <HowItWorksSection />
    </>
  );
}
