"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { HomeService } from "@/src/lib/services/home";
import { HomeSection, RaffleItem } from "@/src/models/api/response/home";
import { getRaffleSections } from "@/src/lib/filters/home";
import { mapRaffleSection } from "@/src/lib/mappers/home";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";

export default function MerchandiseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [merchandiseItem, setMerchandiseItem] = useState<RaffleItem | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const merchandiseId = params.id as string;

    HomeService.getHomePage(1)
      .then((res) => {
        const sections: HomeSection[] = res.data;
        const raffles = getRaffleSections(sections).map(mapRaffleSection);

        // Find the merchandise item in merchandise sections only
        let found = false;
        for (const section of raffles) {
          // Only search in sections with "merchandise" in the title
          if (section.title?.toLowerCase().includes("merchandise")) {
            const item = section.items.find((item) => item.id === merchandiseId);
            if (item) {
              setMerchandiseItem(item);
              setSectionTitle(section.title);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          setNotFound(true);
          console.error("Merchandise item not found");
        }
      })
      .finally(() => setLoading(false));
  }, [params.id, locale]);

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

  if (notFound || (!loading && !merchandiseItem)) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#797979] hover:text-[#5a5a5a] mb-6"
          >
            <ArrowLeft size={20} />
            <span>{t("goBack")}</span>
          </button>
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <p className="text-lg text-[#797979] mb-4">{t("merchandiseItemNotFound")}</p>
              <button
                onClick={() => router.push("/merchandise")}
                className="px-6 py-2 text-sm font-medium text-white bg-[#797979] hover:bg-[#5a5a5a] rounded-md transition-colors"
              >
                {t("viewAllMerchandise")}
              </button>
            </div>
          </div>
        </div>
        <PreFooterIconModule />
        <Footer />
      </main>
    );
  }

  if (!merchandiseItem) {
    return null;
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#797979] hover:text-[#5a5a5a] mb-6 md:mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{t("goBack")}</span>
        </button>

        {/* Detail Content */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Image Section - Left Side */}
              <div className="w-full lg:w-1/2 flex-shrink-0 bg-white p-6 md:p-8 lg:p-12">
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                  <Image
                    src={merchandiseItem.image}
                    alt={merchandiseItem.name || ""}
                    fill
                    unoptimized
                    className="object-contain p-6 md:p-8"
                  />
                </div>
              </div>

              {/* Details Section - Right Side */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 md:p-8 lg:p-12 bg-white">
                {/* Category/Section */}
                {sectionTitle && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#9a9a9a] bg-gray-100 rounded-full">
                      {sectionTitle}
                    </span>
                  </div>
                )}

                {/* Name */}
                {merchandiseItem.name && (
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#797979] mb-4 md:mb-6 leading-tight">
                    {merchandiseItem.name}
                  </h1>
                )}

                {/* Description */}
                {merchandiseItem.description && (
                  <div
                    className="text-sm md:text-base text-[#797979] mb-6 md:mb-8 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: merchandiseItem.description }}
                  />
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 my-6 md:my-8"></div>

                {/* Price */}
                {merchandiseItem.price && (
                  <div className="mb-8">
                    <p className="text-xs uppercase tracking-wide text-[#9a9a9a] mb-2 font-medium">
                      {t("price")}
                    </p>
                    <p className="text-4xl md:text-5xl font-bold text-[#797979]">
                      {merchandiseItem.currencySymbol} {merchandiseItem.price}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    className="
                      px-8
                      py-4
                      text-base
                      font-semibold
                      text-white
                      bg-[#797979]
                      hover:bg-[#5a5a5a]
                      rounded-lg
                      transition-all
                      duration-200
                      shadow-md
                      hover:shadow-lg
                      transform
                      hover:-translate-y-0.5
                      flex-1
                      sm:flex-none
                    "
                  >
                    {t("buyNow")}
                  </button>
                  <button
                    className="
                      px-8
                      py-4
                      text-base
                      font-semibold
                      text-[#797979]
                      border-2
                      border-[#797979]
                      hover:bg-[#797979]
                      hover:text-white
                      rounded-lg
                      transition-all
                      duration-200
                      shadow-sm
                      hover:shadow-md
                      transform
                      hover:-translate-y-0.5
                      flex-1
                      sm:flex-none
                    "
                  >
                    {t("addToCart")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PreFooterIconModule />
      <Footer />
    </main>
  );
}

