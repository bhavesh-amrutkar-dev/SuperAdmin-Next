"use client";

import { useTranslations } from "next-intl";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";

export default function TermsConditionsPage() {
    const t = useTranslations();

    return (
        <main>
            <Header />

            <div className="w-full">
                <div className="text-center page-head-wrapper">
                    <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                        {t("termsConditions") || "Terms & Conditions"}
                    </h1>
                    <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
                        {t("termsConditionsSubtitle") || "Terms of Service"}
                    </p>
                </div>

                <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
                    <div className="prose prose-lg max-w-none">
                        <div className="space-y-6 text-[#2f2f2f]">
                            <section>
                                <h2 className="text-2xl font-bold mb-4 uppercase">
                                    {t("termsTitle1") || "Acceptance of Terms"}
                                </h2>
                                <p className="text-base leading-relaxed text-[#797979] mb-4">
                                    {t("termsText1") || "By accessing and using Don Rifa's platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services."}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 uppercase">
                                    {t("termsTitle2") || "Eligibility"}
                                </h2>
                                <p className="text-base leading-relaxed text-[#797979] mb-4">
                                    {t("termsText2") || "You must be at least 18 years old to participate in raffles on our platform. By using our services, you represent and warrant that you meet this age requirement."}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 uppercase">
                                    {t("termsTitle3") || "Raffle Participation"}
                                </h2>
                                <ul className="list-disc list-inside space-y-2 text-base leading-relaxed text-[#797979]">
                                    <li>{t("termsParticipation1") || "All raffle ticket purchases are final and non-refundable"}</li>
                                    <li>{t("termsParticipation2") || "Winners are selected through a random, transparent drawing process"}</li>
                                    <li>{t("termsParticipation3") || "Results are final and binding"}</li>
                                    <li>{t("termsParticipation4") || "Participants are responsible for any applicable taxes on prizes"}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 uppercase">
                                    {t("termsTitle4") || "Payment Terms"}
                                </h2>
                                <p className="text-base leading-relaxed text-[#797979] mb-4">
                                    {t("termsText4") || "All payments must be made through our secure payment system. By making a payment, you authorize us to charge your payment method for the amount specified. Prices are subject to change without notice."}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 uppercase">
                                    {t("termsTitle5") || "Limitation of Liability"}
                                </h2>
                                <p className="text-base leading-relaxed text-[#797979] mb-4">
                                    {t("termsText5") || "Don Rifa shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services."}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 uppercase">
                                    {t("termsTitle6") || "Modifications to Terms"}
                                </h2>
                                <p className="text-base leading-relaxed text-[#797979] mb-4">
                                    {t("termsText6") || "We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the modified terms."}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 uppercase">
                                    {t("termsTitle7") || "Contact Information"}
                                </h2>
                                <p className="text-base leading-relaxed text-[#797979]">
                                    {t("termsText7") || "For questions about these Terms and Conditions, please contact us at support@donrifa.com"}
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

