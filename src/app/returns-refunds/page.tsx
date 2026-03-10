"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { WebPageService } from "@/src/lib/services/webpage.service";

type ReturnsPageData = {
  returnsObj: string;
  returnsBannerImages?: {
    webUrl?: string;
    mobileUrl?: string;
  };
};

export default function ReturnsRefundsPage() {
  const t = useTranslations();
  const locale = useLocale(); // 👈 watch language change

  const [data, setData] = useState<ReturnsPageData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res: any = await WebPageService.getReturnsPage({
          signal: controller.signal,
        });

        setData(res?.data || null);
      } catch (err) {
        console.warn(err);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [locale]); // 👈 API will refetch when language changes

  return (
    <main>
      <Header />

      <div className="w-full">

        {/* Banner */}
        <div
          className="relative text-center bg-cover bg-center py-16 md:py-24"
          style={{
            backgroundImage: `url(${data?.returnsBannerImages?.webUrl || ""})`,
          }}
        >
          {/* <div className="absolute inset-0 bg-black/60" /> */}

          {/* <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-[1px] text-white">
              {t("returnsRefunds") || "Refund Policy"}
            </h1>

            <p className="text-sm md:text-lg uppercase text-gray-200 mt-3">
              {t("returnsRefundsSubtitle") ||
                "Important Information About Purchases"}
            </p>
          </div> */}
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10">

            {data?.returnsObj ? (
              <div
                className="policy-content text-[#4a4a4a]"
                dangerouslySetInnerHTML={{
                  __html: data.returnsObj,
                }}
              />
            ) : (
              <p className="text-center text-gray-400">Loading policy...</p>
            )}

          </div>
        </div>
      </div>

      <PreFooterIconModule />
      <Footer />
    </main>
  );
}