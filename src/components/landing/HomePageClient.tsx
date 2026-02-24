"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import FallbackUI from "../common/FallBackUi";

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

export default function HomePageClient({
  initialBanners = [],
  initialRaffles,
}: {
  initialBanners?: HomeBanner[];
  initialRaffles?: RaffleSection | null;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const { ready } = useAuth();

  const abortRef = useRef<AbortController | null>(null);

  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<HomeBanner[]>(initialBanners);
  const [raffleSection, setRaffleSection] = useState<RaffleSection | null>(
    initialRaffles || null
  );
  const [countryId, setCountryId] = useState<string | null>(null);

  // Global error if any API fails
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loadingRaffles, setLoadingRaffles] = useState(false);

  /* -----------------------------
     Resolve Country ID
  ------------------------------ */
  useEffect(() => {
    const id = getCookie("C_id");
    if (id) setCountryId(id as string);
  }, []);

  /* -----------------------------
     Fetch Home Banners
  ------------------------------ */
  const fetchBanners = useCallback(async () => {
    try {
      const res = await HomeService.getHomePage(1);

      if (!Array.isArray(res?.banner_images)) {
        throw new Error(t("serviceDown") || "Failed to load banners");
      }

      setBanners(mapBanners(res.banner_images, locale));
    } catch (err: any) {
      console.warn("Home Banners Fetch Failed:", err);
      throw err; // propagate to global error
    }
  }, [locale, t]);

  /* -----------------------------
     Fetch Raffles
  ------------------------------ */
  const fetchRaffles = useCallback(async () => {
    if (!countryId) return;

    if (abortRef.current) abortRef.current.abort();
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
        .map((raffle) => {
          const campaignId =
            raffle.campaignId || raffle._id || raffle.childProductId;

          if (!isObjectId(campaignId)) return null;

          return {
            id: campaignId,
            name: raffle.campaignTitle || raffle.productName || "",
            price: raffle.goalValue ?? raffle.ticketPrice ?? 0,
            currencySymbol: raffle.currencySymbol || "$",
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
      } else {
        throw new Error(t("serviceDown") || "No raffles available");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.warn("Raffles Fetch Failed:", err);
        throw err; // propagate to global error
      }
    } finally {
      setLoadingRaffles(false);
    }
  }, [countryId, t]);

  /* -----------------------------
     Fetch All Data
  ------------------------------ */
  const fetchAll = useCallback(async () => {
    setGlobalError(null);
    setLoading(true);

    try {
      await Promise.all([fetchBanners(), fetchRaffles()]);
    } catch (err: any) {
      setGlobalError(
        err?.message ||
          t("serviceDown") ||
          "Oops! Our services are temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchBanners, fetchRaffles, t]);

  useEffect(() => {
    if (ready) fetchAll();
    return () => abortRef.current?.abort();
  }, [ready, fetchAll]);

  /* -----------------------------
     Render
  ------------------------------ */
  if (loading) return <FullScreenLoader />;

  if (globalError) {
    return <FallbackUI message={globalError} onRetry={fetchAll} />;
  }

  return (
    <>
      {banners.length > 0 && <HeroSlider banners={banners} />}
      {loadingRaffles ? (
        <Loader />
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