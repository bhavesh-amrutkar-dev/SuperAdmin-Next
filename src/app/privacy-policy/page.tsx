"use client";

import { useTranslations } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import ComingSoonPage from "@/src/components/commingSoon";

export default function PrivacyPolicyPage() {
    const t = useTranslations();

    return (
        // <main>
        //     <Header />

        //     <div className="w-full">
        //         <div className="text-center page-head-wrapper">
        //             <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
        //                 {t("privacyPolicy") || "Privacy Policy"}
        //             </h1>
        //             <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
        //                 {t("privacyPolicySubtitle") || "How We Protect Your Information"}
        //             </p>
        //         </div>

        //         <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
        //             <div className="prose prose-lg max-w-none">
        //                 <div className="space-y-6 text-[#2f2f2f]">
        //                     <section>
        //                         <h2 className="text-2xl font-bold mb-4 uppercase">
        //                             {t("privacyTitle1") || "Information We Collect"}
        //                         </h2>
        //                         <p className="text-base leading-relaxed text-[#797979] mb-4">
        //                             {t("privacyText1") || "We collect information that you provide directly to us, including your name, email address, phone number, payment information, and any other information you choose to provide when using our services."}
        //                         </p>
        //                     </section>

        //                     <section>
        //                         <h2 className="text-2xl font-bold mb-4 uppercase">
        //                             {t("privacyTitle2") || "How We Use Your Information"}
        //                         </h2>
        //                         <ul className="list-disc list-inside space-y-2 text-base leading-relaxed text-[#797979]">
        //                             <li>{t("privacyUse1") || "To process and manage your raffle entries"}</li>
        //                             <li>{t("privacyUse2") || "To communicate with you about your account and transactions"}</li>
        //                             <li>{t("privacyUse3") || "To send you promotional materials and updates (with your consent)"}</li>
        //                             <li>{t("privacyUse4") || "To improve our services and user experience"}</li>
        //                             <li>{t("privacyUse5") || "To comply with legal obligations"}</li>
        //                         </ul>
        //                     </section>

        //                     <section>
        //                         <h2 className="text-2xl font-bold mb-4 uppercase">
        //                             {t("privacyTitle3") || "Information Sharing"}
        //                         </h2>
        //                         <p className="text-base leading-relaxed text-[#797979] mb-4">
        //                             {t("privacyText3") || "We do not sell your personal information. We may share your information with trusted service providers who assist us in operating our platform, conducting our business, or serving our users, as long as those parties agree to keep this information confidential."}
        //                         </p>
        //                     </section>

        //                     <section>
        //                         <h2 className="text-2xl font-bold mb-4 uppercase">
        //                             {t("privacyTitle4") || "Data Security"}
        //                         </h2>
        //                         <p className="text-base leading-relaxed text-[#797979] mb-4">
        //                             {t("privacyText4") || "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure."}
        //                         </p>
        //                     </section>

        //                     <section>
        //                         <h2 className="text-2xl font-bold mb-4 uppercase">
        //                             {t("privacyTitle5") || "Your Rights"}
        //                         </h2>
        //                         <p className="text-base leading-relaxed text-[#797979] mb-4">
        //                             {t("privacyText5") || "You have the right to access, update, or delete your personal information at any time. You can also opt-out of receiving promotional communications from us."}
        //                         </p>
        //                     </section>

        //                     <section>
        //                         <h2 className="text-2xl font-bold mb-4 uppercase">
        //                             {t("privacyTitle6") || "Contact Us"}
        //                         </h2>
        //                         <p className="text-base leading-relaxed text-[#797979]">
        //                             {t("privacyText6") || "If you have any questions about this Privacy Policy, please contact us at support@donrifa.com"}
        //                         </p>
        //                     </section>
        //                 </div>
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

