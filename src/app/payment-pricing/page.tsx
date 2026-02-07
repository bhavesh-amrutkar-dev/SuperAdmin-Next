"use client";

import { useTranslations } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { CreditCard, Shield, DollarSign, Lock } from "lucide-react";
import ComingSoonPage from "@/src/components/commingSoon";

export default function PaymentPricingPage() {
    const t = useTranslations();

    return (
        // <main>
        //     <Header />

        //     <div className="w-full">
        //         <div className="text-center page-head-wrapper">
        //             <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
        //                 {t("paymentPricing") || "Payment & Pricing"}
        //             </h1>
        //             <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
        //                 {t("paymentPricingSubtitle") || "Secure Payment Options"}
        //             </p>
        //         </div>

        //         <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
        //             <div className="space-y-8">
        //                 <section>
        //                     <div className="flex items-center gap-3 mb-4">
        //                         <CreditCard className="w-8 h-8 text-[#f3c200]" />
        //                         <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
        //                             {t("paymentMethods") || "Payment Methods"}
        //                         </h2>
        //                     </div>
        //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        //                         <div className="bg-gray-50 p-4 rounded-lg">
        //                             <h3 className="font-semibold text-[#2f2f2f] mb-2">
        //                                 {t("creditDebitCards") || "Credit & Debit Cards"}
        //                             </h3>
        //                             <p className="text-[#797979] text-sm">
        //                                 {t("creditDebitCardsText") || "Visa, Mastercard, American Express"}
        //                             </p>
        //                         </div>
        //                         <div className="bg-gray-50 p-4 rounded-lg">
        //                             <h3 className="font-semibold text-[#2f2f2f] mb-2">
        //                                 {t("digitalWallets") || "Digital Wallets"}
        //                             </h3>
        //                             <p className="text-[#797979] text-sm">
        //                                 {t("digitalWalletsText") || "Apple Pay, Google Pay, PayPal"}
        //                             </p>
        //                         </div>
        //                     </div>
        //                 </section>

        //                 <section>
        //                     <div className="flex items-center gap-3 mb-4">
        //                         <Shield className="w-8 h-8 text-[#f3c200]" />
        //                         <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
        //                             {t("security") || "Security"}
        //                         </h2>
        //                     </div>
        //                     <p className="text-[#797979] leading-relaxed">
        //                         {t("securityText") || "All payments are processed through secure, encrypted channels. We never store your full credit card information. Your financial data is protected by industry-standard security measures."}
        //                     </p>
        //                 </section>

        //                 <section>
        //                     <div className="flex items-center gap-3 mb-4">
        //                         <DollarSign className="w-8 h-8 text-[#f3c200]" />
        //                         <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
        //                             {t("pricing") || "Pricing"}
        //                         </h2>
        //                     </div>
        //                     <p className="text-[#797979] leading-relaxed mb-4">
        //                         {t("pricingText") || "Ticket prices vary by raffle. Each raffle clearly displays the ticket price and the total number of tickets available. Prices are shown in your local currency."}
        //                     </p>
        //                 </section>

        //                 <section>
        //                     <div className="flex items-center gap-3 mb-4">
        //                         <Lock className="w-8 h-8 text-[#f3c200]" />
        //                         <h2 className="text-2xl font-bold text-[#2f2f2f] uppercase">
        //                             {t("refundPolicy") || "Refund Policy"}
        //                         </h2>
        //                     </div>
        //                     <p className="text-[#797979] leading-relaxed">
        //                         {t("refundPolicyText") || "All ticket purchases are final. Refunds are only available in exceptional circumstances as outlined in our Terms & Conditions."}
        //                     </p>
        //                 </section>
        //             </div>
        //         </div>
        //     </div>

        //     <PreFooterIconModule />
        //     <Footer />
        // </main>
        <>
        <ComingSoonPage />
        </>
    );
}

