import { Suspense } from "react";
import { FullScreenLoader } from "../fullScreenLoader";
import HomePageClient from "./HomePageClient";
import { HomeBanner, RaffleSection } from "@/src/models/api/response/home";

interface HomePageShellProps {
  initialBanners?: HomeBanner[];
  initialRaffles?: RaffleSection | null;
}

export default function HomePageShell({ initialBanners, initialRaffles }: HomePageShellProps) {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <HomePageClient initialBanners={initialBanners} initialRaffles={initialRaffles} />
    </Suspense>
  );
}
