// components/landing/HomePageShell.tsx
import { Suspense } from "react";
import { FullScreenLoader } from "../fullScreenLoader";
import HomePageClient from "./HomePageClient";

export default function HomePageShell() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <HomePageClient />
    </Suspense>
  );
}
