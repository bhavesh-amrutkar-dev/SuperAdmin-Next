"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SupportService } from "@/src/lib/services/support.services";

type FAQ = {
    question: string;
    answer: string;
    link?: string;
};
type APIFaq = {
    name: string;
    desc: string;
};
export default function FAQsPage() {
    const t = useTranslations();
    const locale = useLocale();

    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [banner, setBanner] = useState({
        mobile: "",
        web: "",
    });
    useEffect(() => {
        const controller = new AbortController();

        const fetchFAQs = async () => {
            try {
                setLoading(true);

                const res: any = await SupportService.getFAQ({
                    signal: controller.signal,
                });
                const mappedFaqs: FAQ[] =
                    res?.data?.map((item: any) => {
                        let answer = item.desc;

                        // If there is a link but no anchor tag, make text clickable
                        if (item.link && !answer.includes("<a")) {
                            answer = answer.replace(
                                "Forgot&nbsp;password?",
                                `<a href="${item.link}" target="_blank" class="text-[#f3c200] underline">Forgot password?</a>`
                            );
                        }

                        return {
                            question: item.name,
                            answer,
                            link: item.link,
                        };
                    }) || [];
                setFaqs(mappedFaqs);

                setBanner({
                    mobile: res?.bannerImages?.bannerMobileUrl || "",
                    web: res?.bannerImages?.bannerWebUrl || "",
                });

            } catch (err) {
                console.warn(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();

        return () => controller.abort();
    }, [locale]);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <main>
            <Header />

            <div className="w-full">

                {/* Banner */}
                <div
                    className="relative text-center py-16 md:py-24 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${banner.web})`,
                    }}
                >
                    {/* <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-[1px] text-white">
                            {t("faqs") || "FAQs"}
                        </h1>

                        <p className="text-sm md:text-lg uppercase text-gray-300 mt-3">
                            {t("faqsSubtitle") || "Frequently Asked Questions"}
                        </p>
                    </div> */}
                </div>

                {/* Content */}
                <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">

                    {loading ? (
                        <p className="text-center text-gray-400">Loading FAQs...</p>
                    ) : (
                        <div className="space-y-4">

                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors hover:cursor-pointer"
                                    >
                                        <span className="font-semibold text-[#2f2f2f] pr-4">
                                            {faq.question}
                                        </span>

                                        {openIndex === index ? (
                                            <ChevronUp className="w-5 h-5 text-[#f3c200] flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>

                                    {openIndex === index && (
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                            <div
                                                className="text-[#797979] leading-relaxed faq-content"
                                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>
                    )}

                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}