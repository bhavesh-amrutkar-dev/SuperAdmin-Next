"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react";
import { HomeService } from "@/src/lib/services/home";
import { HomeSection, RaffleItem } from "@/src/models/api/response/home";
import { getRaffleSections } from "@/src/lib/filters/home";
import { mapRaffleSection } from "@/src/lib/mappers/home";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [saleItem, setSaleItem] = useState<RaffleItem | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>("");
  const [notFound, setNotFound] = useState(false);
  const [qaSearchQuery, setQaSearchQuery] = useState<string>("");
  const [qaSortBy, setQaSortBy] = useState<string>("recent");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const saleId = params.id as string;

    HomeService.getHomePage(1)
      .then((res) => {
        const sections: HomeSection[] = res.data;
        const raffles = getRaffleSections(sections).map(mapRaffleSection);

        // Find the sale item in sale sections only
        let found = false;
        for (const section of raffles) {
          // Only search in sections with "sale" in the title
          if (section.title?.toLowerCase().includes("sale")) {
            const item = section.items.find((item) => item.id === saleId);
            if (item) {
              setSaleItem(item);
              setSectionTitle(section.title);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          setNotFound(true);
          console.error("Sale item not found");
        }
      })
      .finally(() => setLoading(false));
  }, [params.id, locale]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  if (notFound || (!loading && !saleItem)) {
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
              <p className="text-lg text-[#797979] mb-4">{t("saleItemNotFound")}</p>
              <button
                onClick={() => router.push("/sale")}
                className="px-6 py-2 text-sm font-medium text-white bg-[#797979] hover:bg-[#5a5a5a] rounded-md transition-colors"
              >
                {t("viewAllSale")}
              </button>
            </div>
          </div>
        </div>
        <PreFooterIconModule />
        <Footer />
      </main>
    );
  }

  if (!saleItem) {
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
                    src={saleItem.image}
                    alt={saleItem.name || ""}
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
                {saleItem.name && (
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#797979] mb-4 md:mb-6 leading-tight">
                    {saleItem.name}
                  </h1>
                )}

                {/* Description */}
                {saleItem.description && (
                  <div
                    className="text-sm md:text-base text-[#797979] mb-6 md:mb-8 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: saleItem.description }}
                  />
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 my-6 md:my-8"></div>

                {/* Price */}
                {saleItem.price && (
                  <div className="mb-8">
                    <p className="text-xs uppercase tracking-wide text-[#9a9a9a] mb-2 font-medium">
                      {t("price")}
                    </p>
                    <p className="text-4xl md:text-5xl font-bold text-[#797979]">
                      {saleItem.currencySymbol} {saleItem.price}
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

          {/* Additional Information Sections */}
          <div className="max-w-7xl mx-auto mt-8 space-y-8">
            {/* Product Description Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#797979] mb-4">
                {t("productDescription")}
              </h2>
              <div className="border-t border-gray-200 mb-4"></div>
              <div className="text-[#797979]">
                {saleItem.description ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: saleItem.description }}
                  />
                ) : (
                  <p className="text-[#797979]">{t("noDataAvailable")}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#797979] mb-4">
                {t("termsAndConditions")}
              </h2>
              <div className="border-t border-gray-200 mb-4"></div>
              <div className="flex items-center gap-2">
                <span className="text-[#797979]">-</span>
                <button className="text-sm md:text-base font-bold text-[#FFD700] hover:text-[#FFC700] transition-colors">
                  {t("allDetails")}
                </button>
              </div>
            </div>

            {/* Questions & Answers Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-[#797979]">
                  {t("questionsAndAnswers")} (0)
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-[#FFD700] hover:bg-[#FFC700] rounded-md transition-colors whitespace-nowrap">
                    {t("askAQuestion")}
                  </button>
                  <div className="relative flex-1 sm:flex-initial sm:w-48">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={t("search")}
                      value={qaSearchQuery}
                      onChange={(e) => setQaSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-[#797979] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={qaSortBy}
                      onChange={(e) => setQaSortBy(e.target.value)}
                      className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-md text-sm font-medium text-[#797979] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent cursor-pointer"
                    >
                      <option value="recent">{t("sortRecent")}</option>
                      <option value="oldest">{t("sortOldest")}</option>
                      <option value="mostHelpful">{t("sortMostHelpful")}</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#797979] w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200"></div>
            </div>

            {/* Seller Information Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#797979] mb-4">
                {t("sellerInformation")}
              </h2>
              <div className="border-t border-gray-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#797979] hover:bg-[#5a5a5a] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
          aria-label={t("scrollToTop")}
        >
          <ChevronUp size={24} />
        </button>
      )}

      <PreFooterIconModule />
      <Footer />
    </main>
  );
}

