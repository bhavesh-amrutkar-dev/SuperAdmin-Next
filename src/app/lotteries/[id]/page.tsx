"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowLeft, Search, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { HomeService } from "@/src/lib/services/home";
import { HomeSection, RaffleItem } from "@/src/models/api/response/home";
import { getRaffleSections } from "@/src/lib/filters/home";
import { mapRaffleSection } from "@/src/lib/mappers/home";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import Loader from "@/src/components/loader";

export default function LotteryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [lotteryItem, setLotteryItem] = useState<RaffleItem | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>("");
  const [notFound, setNotFound] = useState(false);
  const [qaSearchQuery, setQaSearchQuery] = useState<string>("");
  const [qaSortBy, setQaSortBy] = useState<string>("recent");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<number>(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const lotteryId = params.id as string;

    HomeService.getHomePage(1)
      .then((res) => {
        const sections: HomeSection[] = res.data;
        const raffles = getRaffleSections(sections).map(mapRaffleSection);

        // Find the lottery item across all sections
        let found = false;
        for (const section of raffles) {
          const item = section.items.find((item) => item.id === lotteryId);
          if (item) {
            setLotteryItem(item);
            setSectionTitle(section.title);
            found = true;
            break;
          }
        }

        if (!found) {
          setNotFound(true);
          console.error("Lottery item not found");
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

  // Countdown timer effect (placeholder - replace with actual end date from lotteryItem)
  useEffect(() => {
    const calculateCountdown = () => {
      // Placeholder: set a future date (e.g., 7 days from now)
      // TODO: Replace with actual drawDate from lotteryItem
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main>
        <Header />
        <Loader/>
        <PreFooterIconModule />
        <Footer />
      </main>
    );
  }

  if (notFound || (!loading && !lotteryItem)) {
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
              <p className="text-lg text-[#797979] mb-4">{t("lotteryNotFound")}</p>
              <button
                onClick={() => router.push("/lotteries")}
                className="px-6 py-2 text-sm font-medium text-white bg-[#797979] hover:bg-[#5a5a5a] rounded-md transition-colors"
              >
                {t("viewAllLotteries")}
              </button>
            </div>
          </div>
        </div>
        <PreFooterIconModule />
        <Footer />
      </main>
    );
  }

  if (!lotteryItem) {
    return null;
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-[#797979]">
            <button
              onClick={() => router.push("/")}
              className="hover:text-[#5a5a5a] transition-colors"
            >
              {t("home")}
            </button>
            <span>&gt;</span>
          </div>
          <button
            className="text-[#797979] hover:text-[#5a5a5a] transition-colors"
            aria-label={t("share")}
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Left Side - Product Image Area */}
          <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg p-6 md:p-8 min-h-[500px] flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
              <Image
                src={lotteryItem.image}
                alt={lotteryItem.name || ""}
                fill
                unoptimized
                className="object-contain p-6 md:p-8"
              />
            </div>
          </div>

          {/* Right Side - Sidebar */}
          <div className="w-full lg:w-1/3 space-y-4">
            {/* Countdown Timer */}
            <div className="bg-black rounded-lg p-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-[#FFD700] rounded p-3 text-center">
                  <div className="text-2xl font-bold text-black">{countdown.days}</div>
                  <div className="text-xs font-medium text-black mt-1">{t("days")}</div>
                </div>
                <div className="bg-[#FFD700] rounded p-3 text-center">
                  <div className="text-2xl font-bold text-black">{countdown.hours}</div>
                  <div className="text-xs font-medium text-black mt-1">{t("hrs")}</div>
                </div>
                <div className="bg-[#FFD700] rounded p-3 text-center">
                  <div className="text-2xl font-bold text-black">{countdown.minutes}</div>
                  <div className="text-xs font-medium text-black mt-1">{t("mins")}</div>
                </div>
                <div className="bg-[#FFD700] rounded p-3 text-center">
                  <div className="text-2xl font-bold text-black">{countdown.seconds}</div>
                  <div className="text-xs font-medium text-black mt-1">{t("sec")}</div>
                </div>
              </div>
            </div>

            {/* Prize Cost */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                <span className="text-sm text-[#797979]">{t("prizeCost")}</span>
              </div>
              <p className="text-lg font-semibold text-[#797979]">
                {lotteryItem.currencySymbol || "USD"}
                {lotteryItem.price ? lotteryItem.price : "NaN"}
              </p>
            </div>

            {/* Entry Selection */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-sm font-semibold text-[#797979] mb-3">{t("selectEntries")}</p>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedEntries}
                  onChange={(e) => setSelectedEntries(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#797979]">0%</span>
                  <span className="text-xs text-[#797979]">{selectedEntries}%</span>
                </div>
              </div>
            </div>

            {/* Participate Button */}
            <button className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-[#797979] font-bold py-4 rounded-lg transition-colors shadow-lg">
              {t("participate")}
            </button>
          </div>
        </div>

        {/* Win Probability Banner */}
        <div className="bg-[#FFD700] rounded-xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-[#797979] mb-4">
                {t("winProbability")}
              </h3>
              <div className="space-y-2 mb-4 text-[#797979]">
                <p className="text-sm md:text-base">
                  <span className="font-medium">{t("totalEntriesSold")}:</span>
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-medium">{t("myPaidEntries")}:</span>
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-medium">{t("myFreeEntries")}:</span>
                </p>
              </div>
              <p className="text-xs text-[#797979] max-w-2xl">
                {t("probabilityDisclaimer")}
              </p>
            </div>
            <div className="flex gap-4 lg:gap-6">
              {/* Paid Probability Circle */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 md:w-24 md:h-24">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#FFC700"
                      strokeWidth="4"
                      className="opacity-30"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#FFC700"
                      strokeWidth="4"
                      strokeDasharray={`${0 * 2.827} 282.7`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm md:text-base font-bold text-[#797979]">0%</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm font-medium text-[#797979] mt-2">{t("paid")}</p>
              </div>
              {/* Free Probability Circle */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 md:w-24 md:h-24">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#FFC700"
                      strokeWidth="4"
                      className="opacity-30"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#FFC700"
                      strokeWidth="4"
                      strokeDasharray={`${0 * 2.827} 282.7`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm md:text-base font-bold text-[#797979]">0%</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm font-medium text-[#797979] mt-2">{t("free")}</p>
              </div>
              {/* My Probability Circle */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 md:w-24 md:h-24">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#FFC700"
                      strokeWidth="4"
                      className="opacity-30"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#FFC700"
                      strokeWidth="4"
                      strokeDasharray={`${0 * 2.827} 282.7`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm md:text-base font-bold text-[#797979]">0%</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm font-medium text-[#797979] mt-2">{t("myProbability")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Sections */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Product Description Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#797979] mb-4">
              {t("productDescription")}
            </h2>
            <div className="border-t border-gray-200 mb-4"></div>
            <div className="text-[#797979]">
              {lotteryItem.description ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: lotteryItem.description }}
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

