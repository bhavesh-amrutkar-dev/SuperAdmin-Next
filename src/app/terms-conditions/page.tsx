"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { WebPageService } from "@/src/lib/services/webpage.service";

type TermsData = {
    termsObj: string;
    termsBannerImages?: {
        webUrl?: string;
        mobileUrl?: string;
    };
};

export default function TermsConditionsPage() {
    const t = useTranslations();
    const locale = useLocale();

    const [data, setData] = useState<TermsData | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        WebPageService.getCustomerPages({ signal: controller.signal })
            .then((res: any) => {
                setData(res?.data || null);
            })
            .catch(console.warn);

        return () => controller.abort();
    }, [locale]);

    return (
        <main>
            <Header />

            <div className="w-full">

                {/* Banner */}
                <div
                    className="relative text-center py-16 md:py-24 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${data?.termsBannerImages?.webUrl || ""})`,
                    }}
                >
                    {/* <div className="absolute inset-0 bg-black/60" />

                    <div className="relative z-10 max-w-4xl mx-auto px-4">
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase text-white">
                            {t("termsConditions") || "Terms & Conditions"}
                        </h1>

                        <p className="text-sm md:text-lg uppercase text-gray-200 mt-3">
                            {t("termsConditionsSubtitle") || "Terms of Service"}
                        </p>
                    </div> */}
                </div>

                {/* Content */}
                <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10">

                        {data?.termsObj ? (
                            <div
                                className="terms-content text-[#4a4a4a]"
                                dangerouslySetInnerHTML={{
                                    __html: data.termsObj,
                                }}
                            />
                        ) : (
                            <p className="text-center text-gray-400">
                                Loading terms...
                            </p>
                        )}

                    </div>
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}