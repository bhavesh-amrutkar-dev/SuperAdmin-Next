"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { AboutService, type AboutUsData } from "@/src/lib/services/about";
import { website_logo } from "@/src/lib/config";

export default function AboutUsPage() {
    const t = useTranslations();
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [aboutData, setAboutData] = useState<AboutUsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        AboutService.getAboutUs()
            .then((response) => {
                const data = (response as any)?.data;
                setAboutData(data || null);
            })
            .catch((err) => {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to load about us data";
                setError(errorMessage);
                console.warn("Error fetching about us:", errorMessage);
            })
            .finally(() => setLoading(false));
    }, [locale]);

    const getGalleryImages = () => {
        if (!aboutData?.gallery?.length) return [];
        return aboutData.gallery
            .map((item) =>
                item.imgUrls?.largeImg ||
                item.imgUrls?.mediumImg ||
                item.imgUrls?.smallImg ||
                ""
            )
            .filter(Boolean);
    };

    const getTeamMembers = () => {
        if (!aboutData?.teamMembers?.length) return [];
        return aboutData.teamMembers.map((member) => ({
            name: member.personName || "",
            title: member.aboutPersonDesignation || "",
            description: member.aboutPerson || "",
            image: member.profilePicIcon || website_logo,
            social: {
                instagram: member.instagramLink || "#",
                facebook: member.facebookLink || "#",
                twitter: member.twitterLink || "#",
                linkedin: member.linkedInLink || "#",
            },
        }));
    };

    const getAboutContent = () => {
        if (!aboutData?.aboutEditor) return null;
        const content =
            locale === "es"
                ? aboutData.aboutEditor.es
                : aboutData.aboutEditor.en;

        return content || aboutData.aboutEditor.en || "";
    };

    if (loading) {
        return (
            <main>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-lg text-[#797979]">Loading...</div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-lg text-red-600">Error: {error}</div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    const galleryImages = getGalleryImages();
    const teamMembers = getTeamMembers();
    const aboutContent = getAboutContent();

    return (
        <main>
            <Header />

            {/* Page Header - Same as Contact */}
            <div className="text-center page-head-wrapper">
                <h1 className="pt-2 pb-2 text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                    {t("aboutUs") || "ABOUT US"}
                </h1>
                <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed">
                    {t("aboutUsSubtitle") || "Learn more about our story and team"}
                </p>
            </div>

            {/* Main Content */}
            <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-12">
                {aboutContent ? (
                    <div
                        className="prose prose-lg max-w-none mb-16"
                        dangerouslySetInnerHTML={{ __html: aboutContent }}
                    />
                ) : (
                    <div className="prose prose-lg max-w-none mb-16">
                        <p>{t("aboutUsParagraph1")}</p>
                        <p>{t("aboutUsParagraph2")}</p>
                        <p>{t("aboutUsParagraph3")}</p>
                        <p>{t("aboutUsParagraph4")}</p>
                        <p>{t("aboutUsParagraph5")}</p>
                    </div>
                )}

                {/* Gallery */}
                {galleryImages.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-[#2f2f2f] mb-8 text-center uppercase">
                            {t("gallery")}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {galleryImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 hover:scale-105 transition-transform duration-300"
                                >
                                    <Image
                                        src={image}
                                        alt={`Gallery image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team */}
                {teamMembers.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-[#2f2f2f] mb-12 text-center uppercase">
                            {t("teamMembers")}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="text-center">
                                    <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden bg-gray-200">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>

                                    <h3 className="text-2xl font-bold text-[#2f2f2f] mb-2">
                                        {member.name}
                                    </h3>
                                    <p className="text-lg text-[#797979] mb-2">
                                        {member.title}
                                    </p>

                                    {member.description && (
                                        <p className="text-sm text-[#797979] mb-6 line-clamp-3">
                                            {member.description}
                                        </p>
                                    )}

                                    <div className="flex justify-center gap-4">
                                        {member.social.instagram !== "#" && (
                                            <a href={member.social.instagram} target="_blank" rel="noopener noreferrer" className="social-btn">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.social.facebook !== "#" && (
                                            <a href={member.social.facebook} target="_blank" rel="noopener noreferrer" className="social-btn">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.social.twitter !== "#" && (
                                            <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="social-btn">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.social.linkedin !== "#" && (
                                            <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}