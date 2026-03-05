"use client";

import { useTranslations } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { Package, Truck, Clock, MapPin } from "lucide-react";
import ComingSoonPage from "@/src/components/commingSoon";

export default function OrdersShippingPage() {
    const t = useTranslations();

    return (
        <>
            <ComingSoonPage />
            {/* <main>
            <Header />

            <div className="w-full">
                <div className="text-center page-head-wrapper">
                    <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                        {t("ordersShipping") || "Orders & Shipping"}
                    </h1>
                    <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
                        {t("ordersShippingSubtitle") || "Everything You Need to Know"}
                    </p>
                </div>

                <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
                    <div className="space-y-8">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Package className="w-8 h-8 text-[#f3c200]" />
                                <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
                                    {t("orderProcessing") || "Order Processing"}
                                </h2>
                            </div>
                            <p className="text-[#797979] leading-relaxed mb-4">
                                {t("orderProcessingText") || "Once your order is confirmed, we process it within 1-2 business days. You will receive an email confirmation with your order details and tracking information."}
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Truck className="w-8 h-8 text-[#f3c200]" />
                                <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
                                    {t("shippingOptions") || "Shipping Options"}
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-[#2f2f2f] mb-2">
                                        {t("standardShipping") || "Standard Shipping"}
                                    </h3>
                                    <p className="text-[#797979] text-sm">
                                        {t("standardShippingText") || "5-7 business days - Free on orders over $50"}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-[#2f2f2f] mb-2">
                                        {t("expressShipping") || "Express Shipping"}
                                    </h3>
                                    <p className="text-[#797979] text-sm">
                                        {t("expressShippingText") || "2-3 business days - Additional charges apply"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-8 h-8 text-[#f3c200]" />
                                <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
                                    {t("deliveryTime") || "Delivery Time"}
                                </h2>
                            </div>
                            <p className="text-[#797979] leading-relaxed">
                                {t("deliveryTimeText") || "Delivery times vary by location and shipping method selected. You can track your order in real-time using the tracking number provided in your confirmation email."}
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="w-8 h-8 text-[#f3c200]" />
                                <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
                                    {t("shippingLocations") || "Shipping Locations"}
                                </h2>
                            </div>
                            <p className="text-[#797979] leading-relaxed">
                                {t("shippingLocationsText") || "We currently ship to the United States, Mexico, Dominican Republic, and Puerto Rico. Additional countries will be added soon."}
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main> */}
        </>

    );
}

