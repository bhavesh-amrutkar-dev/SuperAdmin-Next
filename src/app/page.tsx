// app/page.tsx
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import HomePageShell from "../components/landing/HomePageShell";
import { HomeServiceServer } from "../lib/services/home-server";
import { RaffleServiceServer } from "../lib/services/raffles-server";
import { getLocale, getTranslations } from "next-intl/server";
import { mapBanners } from "../lib/mappers/home";
import { HomeBanner, RaffleSection, RaffleItem } from "../models/api/response/home";
import { PRODUCT_CART } from "../lib/config";

const isObjectId = (id?: string) =>
  typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);

export default async function LandingPage() {
  const locale = await getLocale();
  const t = await getTranslations();
  let banners: HomeBanner[] = [];
  let raffleSection: RaffleSection | null = null;

  try {
    const bannerPromise = HomeServiceServer.getHomePageServer(1);
    const rafflePromise = RaffleServiceServer.getAllRafflesServer();

    // Parallel fetch
    const [res, raffleData] = await Promise.allSettled([bannerPromise, rafflePromise]);

    if (res.status === 'fulfilled' && res.value?.banner_images) {
      banners = mapBanners(res.value.banner_images, locale);
    } else if (res.status === 'rejected') {
      console.error("Home Banners Fetch Failed:", res.reason);
    }

    if (raffleData.status === 'fulfilled') {
      const payload: any = raffleData.value;
      const items: any[] = Array.isArray(payload?.data) ? payload.data : [];

      const raffleItems: RaffleItem[] = items
        .map((raffle) => {
          const campaignId = raffle.campaignId || raffle._id || raffle.childProductId;
          if (!isObjectId(campaignId)) return null;

          return {
            id: campaignId,
            name: raffle.campaignTitle || raffle.productName || "",
            price: raffle.goalValue ?? raffle.ticketPrice ?? 0,
            currencySymbol: raffle.currencySymbol || "$",
            image: raffle.image?.[0]?.medium || raffle.mobileImage?.[0]?.medium || PRODUCT_CART,
          };
        })
        .filter(Boolean) as RaffleItem[];

      if (raffleItems.length > 0) {
        raffleSection = {
          id: "all-raffles",
          title: t("allRaffles") ?? "ALL RAFFLES",
          description: t("playAndWin") ?? "PLAY AND WIN!",
          cellType: 1,
          items: raffleItems,
        };
      }
    } else if (raffleData.status === 'rejected') {
      console.error("Raffles Fetch Failed:", raffleData.reason);
    }

  } catch (error) {
    console.error("Unexpected error in home page data fetching", error);
  }

  return (
    <main>
      <Header />
      <HomePageShell initialBanners={banners} initialRaffles={raffleSection} />
      <PreFooterIconModule />
      <Footer />
    </main>
  );
}
