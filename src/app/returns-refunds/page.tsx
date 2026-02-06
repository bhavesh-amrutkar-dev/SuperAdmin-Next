"use client";

import { useTranslations } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { RotateCcw, Clock, FileText, AlertCircle } from "lucide-react";

export default function ReturnsRefundsPage() {
    const t = useTranslations();

    return (
        <main>
            <Header />

            <div className="w-full">
                <div className="text-center page-head-wrapper">
                    <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                        {t("returnsRefunds") || "Returns & Refunds"}
                    </h1>
                    <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
                        {t("returnsRefundsSubtitle") || "Our Return and Refund Policy"}
                    </p>
                </div>

                <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
                    <div className="space-y-8">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="w-8 h-8 text-[#f3c200]" />
                                <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
                                    {t("importantNotice") || "Important Notice"}
                                </h2>
                            </div>
                            <p className="text-[#797979] leading-relaxed bg-yellow-50 p-4 rounded-lg border-l-4 border-[#f3c200]">
                                {t("importantNoticeText") || "Raffle tickets are non-refundable once purchased. All sales are final. This policy ensures fairness and transparency for all participants."}
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <RotateCcw className="w-8 h-8 text-[#f3c200]" />
                                <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
                                    {t("returns") || "Returns"}
                                </h2>
                            </div>
                            <p className="text-[#797979] leading-relaxed mb-4">
                                {t("returnsText") || "Physical merchandise purchased through our platform can be returned within 30 days of delivery, provided the item is in its original condition and packaging."}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-[#797979]">
                                <li>{t("returnItem1") || "Items must be unused and in original packaging"}</li>
                                <li>{t("returnItem2") || "Return shipping costs are the responsibility of the customer"}</li>
                                <li>{t("returnItem3") || "Refunds will be processed within 5-7 business days after receiving the returned item"}</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-8 h-8 text-[#f3c200]" />
                                <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
                                    {t("refundProcessing") || "Refund Processing"}
                                </h2>
                            </div>
                            <p className="text-[#797979] leading-relaxed">
                                {t("refundProcessingText") || "Refunds are processed to the original payment method used for the purchase. Processing times may vary depending on your bank or payment provider, typically taking 5-10 business days."}
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-8 h-8 text-[#f3c200]" />
                                <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
                                    {t("exceptions") || "Exceptions"}
                                </h2>
                            </div>
                            <p className="text-[#797979] leading-relaxed">
                                {t("exceptionsText") || "In cases of technical errors, duplicate charges, or other exceptional circumstances, please contact our support team. We will review each case individually and work to resolve the issue fairly."}
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

