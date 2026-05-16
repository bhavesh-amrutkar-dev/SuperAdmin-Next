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
import { useAuth } from "@/src/context/authContext";
import Loader from "../loader";
import { useCountry } from "@/src/context/countryContext";
import RafflesOnHome from "../layout/RafflesOnHome";

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
  cashAwardAmount?: number;
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

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loadingRaffles, setLoadingRaffles] = useState(false);

  const { selectedCountryId } = useCountry();
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const id = hash.replace("#", "");

      // small delay ensures DOM is fully ready
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    };

    scrollToHash();
  }, []);
  /* ----------------------------- Fetch Banners ------------------------------ */
  const fetchBanners = useCallback(async () => {
    try {
      const res = await HomeService.getHomePage(1);

      if (!Array.isArray(res?.banner_images)) {
        throw new Error(t("serviceDown") || "Failed to load banners");
      }

      setBanners(mapBanners(res.banner_images, locale));
    } catch (err: any) {
      console.warn("Home Banners Fetch Failed:", err);
      throw err;
    }
  }, [locale, t]);

  /* ----------------------------- Fetch Raffles ------------------------------ */
  const fetchRaffles = useCallback(async () => {
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
            price:
              raffle.cashAwardAmount ??
              raffle.goalValue ??
              raffle.ticketPrice ??
              0,
            currencySymbol: raffle.currencySymbol || "$",
            image:
              raffle.image?.[0]?.medium ||
              raffle.mobileImage?.[0]?.medium ||
              PRODUCT_CART,
          };
        })
        .filter(Boolean) as RaffleItem[];

      // ✅ FIX: do NOT throw error on empty
      if (raffleItems.length > 0) {
        setRaffleSection({
          id: "all-raffles",
          title: t("allRaffles") ?? "ALL RAFFLES",
          description: t("playAndWin") ?? "PLAY AND WIN!",
          cellType: 1,
          items: raffleItems,
        });
      } else {
        setRaffleSection(null);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.warn("Raffles Fetch Failed:", err);
        throw err;
      }
    } finally {
      setLoadingRaffles(false);
    }
  }, [t]);

  /* ----------------------------- Fetch All ------------------------------ */
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

  /* ----------------------------- Initial Load ------------------------------ */
  useEffect(() => {
    if (!ready) return;

    fetchAll();

    return () => abortRef.current?.abort();
  }, [ready]);

  /* ----------------------------- Country Change Retry ------------------------------ */
  useEffect(() => {
    const handleCountryChange = () => {
      fetchAll();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("countryChanged", handleCountryChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("countryChanged", handleCountryChange);
      }
    };
  }, [fetchAll]);

  /* ----------------------------- Render ------------------------------ */
  if (loading) return <FullScreenLoader />;

  return (
    <>
      {banners.length > 0 && <HeroSlider banners={banners} />}

      {/* {loadingRaffles ? (
        <Loader />
      ) : raffleSection ? (
        <RaffleSectionLayout
          section={raffleSection}
          viewMoreLabel={t("viewMore") ?? "View More"}
        />
      ) : null} */}
      <RafflesOnHome />
      <HowItWorksSection />
    </>
  );
}