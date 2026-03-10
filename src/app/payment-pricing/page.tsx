"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { WebPageService } from "@/src/lib/services/webpage.service";

type PaymentData = {
    paymentsObj: string;
    paymentsBannerImages?: {
        webUrl?: string;
        mobileUrl?: string;
    };
};

export default function PaymentPricingPage() {
    const t = useTranslations();
    const locale = useLocale();

    const [data, setData] = useState<PaymentData | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        WebPageService.getPaymentsPage({ signal: controller.signal })
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
                        backgroundImage: `url(${data?.paymentsBannerImages?.webUrl || ""})`,
                    }}
                />

                {/* Content */}
                <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10">

                        {data?.paymentsObj ? (
                            <div
                                className="payment-content text-[#4a4a4a]"
                                dangerouslySetInnerHTML={{
                                    __html: data.paymentsObj,
                                }}
                            />
                        ) : (
                            <p className="text-center text-gray-400">
                                Loading content...
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