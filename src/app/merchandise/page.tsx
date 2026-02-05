"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { HomeService } from "@/src/lib/services/home";
import { HomeSection, RaffleSection } from "@/src/models/api/response/home";
import { getRaffleSections } from "@/src/lib/filters/home";
import { mapRaffleSection } from "@/src/lib/mappers/home";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";

export default function MerchandisePage() {
  const locale = useLocale();
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [merchSections, setMerchSections] = useState<RaffleSection[]>([]);

  type FlatItem = {
    item: RaffleSection["items"][0];
    sectionTitle: string;
    cellType: number;
  };

  const [allMerchItems, setAllMerchItems] = useState<FlatItem[]>([]);

  useEffect(() => {
    HomeService.getHomePage(1)
      .then((res) => {
        const sections: HomeSection[] = res.data;
        const raffles = getRaffleSections(sections).map(mapRaffleSection);

        // Heuristic: treat sections whose title includes "merchandise" as merchandise sections
        const merchOnly = raffles.filter((section) =>
          section.title?.toLowerCase().includes("merchandise")
        );

        const sourceSections = merchOnly.length > 0 ? merchOnly : raffles;
        setMerchSections(sourceSections);

        const items: FlatItem[] = sourceSections.flatMap((section) =>
          section.items.map((item) => ({
            item,
            sectionTitle: section.title,
            cellType: section.cellType,
          }))
        );

        setAllMerchItems(items);
      })
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <main>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-[#797979]">Loading...</div>
        </div>
        <PreFooterIconModule />
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />

      {/* Page Header */}
      <div className="w-full py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-4 flex flex-col items-center text-center">
            <h1
              className="
                inline-block
                w-full
                pt-[15px]
                pb-2
                text-[24px] md:text-[32px]
                font-medium
                uppercase
                tracking-[1px]
                leading-[1.35]
                text-[#797979]
              "
            >
              {t("allMerchandise")}
            </h1>
            <p
              className="
                text-[13px] md:text-[16px]
                uppercase
                text-[#797979]
                leading-relaxed
                mt-2
              "
            >
              {t("merchandiseSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Merchandise Grid */}
      <div className="container mx-auto px-4 py-8">
        {allMerchItems.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-lg text-[#797979]">
              {t("noMerchandiseAvailable")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {allMerchItems.map(({ item, cellType }, index) => {
              const aspect =
                cellType === 1 || cellType === 2
                  ? "aspect-square"
                  : "aspect-[2/1]";

              return (
                <Link
                  key={`${item.id}-${index}`}
                  href={`/merchandise/${item.id}`}
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {/* Image Wrapper */}
                  <div
                    className={`
                      relative
                      w-full
                      ${aspect}
                      flex
                      items-center
                      justify-center
                      bg-transparent
                      mb-2
                    `}
                  >
                    <Image
                      src={item.image}
                      alt={item.name || ""}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  {/* Name */}
                  {item.name && (
                    <p className="mt-2 text-sm font-medium text-[#797979] line-clamp-2 min-h-[2.5rem]">
                      {item.name}
                    </p>
                  )}

                  {/* Price */}
                  {item.price && (
                    <p className="text-sm text-[#9a9a9a] mt-1">
                      {item.currencySymbol} {item.price}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <PreFooterIconModule />
      <Footer />
    </main>
  );
}


