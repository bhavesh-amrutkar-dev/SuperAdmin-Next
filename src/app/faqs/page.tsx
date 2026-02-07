"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { ChevronDown, ChevronUp } from "lucide-react";
import ComingSoonPage from "@/src/components/commingSoon";

export default function FAQsPage() {
    const t = useTranslations();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // const faqs = [
    //     {
    //         question: t("faq1Question") || "How do I participate in a raffle?",
    //         answer: t("faq1Answer") || "Browse available raffles, select the one you want to enter, choose the number of tickets, and complete the secure payment process.",
    //     },
    //     {
    //         question: t("faq2Question") || "How are winners selected?",
    //         answer: t("faq2Answer") || "Winners are selected using a certified random number generator. The process is transparent and verifiable.",
    //     },
    //     {
    //         question: t("faq3Question") || "Can I get a refund for my tickets?",
    //         answer: t("faq3Answer") || "Raffle tickets are non-refundable once purchased. All sales are final to ensure fairness for all participants.",
    //     },
    //     {
    //         question: t("faq4Question") || "How will I know if I won?",
    //         answer: t("faq4Answer") || "Winners are notified via email within 48 hours of the draw. Results are also published on our platform.",
    //     },
    //     {
    //         question: t("faq5Question") || "What payment methods do you accept?",
    //         answer: t("faq5Answer") || "We accept major credit cards, debit cards, and digital wallets like Apple Pay, Google Pay, and PayPal.",
    //     },
    //     {
    //         question: t("faq6Question") || "Is my payment information secure?",
    //         answer: t("faq6Answer") || "Yes, all payments are processed through secure, encrypted channels. We never store your full credit card information.",
    //     },
    //     {
    //         question: t("faq7Question") || "How long does shipping take?",
    //         answer: t("faq7Answer") || "Shipping times vary by location and method. Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days.",
    //     },
    //     {
    //         question: t("faq8Question") || "Can I participate from outside the US?",
    //         answer: t("faq8Answer") || "We currently operate in the United States, Mexico, Dominican Republic, and Puerto Rico. Additional countries will be added soon.",
    //     },
    // ];

    // const toggleFAQ = (index: number) => {
    //     setOpenIndex(openIndex === index ? null : index);
    // };

    return (
        // <main>
        //     <Header />

        //     <div className="w-full">
        //         <div className="text-center page-head-wrapper">
        //             <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
        //                 {t("faqs") || "FAQs"}
        //             </h1>
        //             <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
        //                 {t("faqsSubtitle") || "Frequently Asked Questions"}
        //             </p>
        //         </div>

        //         <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
        //             <div className="space-y-4">
        //                 {faqs.map((faq, index) => (
        //                     <div
        //                         key={index}
        //                         className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        //                     >
        //                         <button
        //                             onClick={() => toggleFAQ(index)}
        //                             className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        //                         >
        //                             <span className="font-semibold text-[#2f2f2f] pr-4">
        //                                 {faq.question}
        //                             </span>
        //                             {openIndex === index ? (
        //                                 <ChevronUp className="w-5 h-5 text-[#f3c200] flex-shrink-0" />
        //                             ) : (
        //                                 <ChevronDown className="w-5 h-5 text-[#797979] flex-shrink-0" />
        //                             )}
        //                         </button>
        //                         {openIndex === index && (
        //                             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        //                                 <p className="text-[#797979] leading-relaxed">{faq.answer}</p>
        //                             </div>
        //                         )}
        //                     </div>
        //                 ))}
        //             </div>
        //         </div>
        //     </div>

        //     <PreFooterIconModule />
        //     <Footer />
        // </main>
        <>
        <ComingSoonPage/>
            </>
    );
}

