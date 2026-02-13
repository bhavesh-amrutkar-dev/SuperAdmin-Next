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
                try {
                    const errorMessage =
                        err instanceof Error
                            ? err.message
                            : err && typeof err === "object" && "message" in err
                                ? String(err.message)
                                : "Failed to load about us data";
                    setError(errorMessage);
                    // eslint-disable-next-line no-console
                    console.warn("Error fetching about us:", errorMessage);
                } catch {
                    setError("Unknown error occurred");
                }
            })
            .finally(() => setLoading(false));
    }, [locale]);


    // Get gallery images from API
    const getGalleryImages = () => {
        if (!aboutData?.gallery || aboutData.gallery.length === 0) return [];
        return aboutData.gallery.map((item) => {
            const imgUrls = item.imgUrls;
            return (
                imgUrls?.largeImg ||
                imgUrls?.mediumImg ||
                imgUrls?.smallImg ||
                ""
            );
        }).filter(Boolean);
    };

    // Get team members from API
    const getTeamMembers = () => {
        if (!aboutData?.teamMembers || aboutData.teamMembers.length === 0) return [];
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

    // Get about text content
    const getAboutContent = () => {
        if (!aboutData?.aboutEditor) return null;
        const content = locale === "es" ? aboutData.aboutEditor.es : aboutData.aboutEditor.en;
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

    const mobileBannerUrl = aboutData?.bannerImages?.mobileUrl;
    const webBannerUrl = aboutData?.bannerImages?.webUrl;
    const bannerUrl = mobileBannerUrl || webBannerUrl; // Fallback to either if one is missing
    const hasBanner = !!bannerUrl;

    return (
        <main>
            <Header />

            {/* About Us Banner */}
            <div className="w-full">
                {hasBanner ? (
                    <div className="relative w-full h-[350px] md:h-[400px] overflow-hidden">
                        {/* Mobile Banner - visible on mobile (< 768px), hidden on desktop */}
                        {mobileBannerUrl && (
                            <Image
                                src={mobileBannerUrl}
                                alt="About Us Banner"
                                fill
                                className="object-cover block md:hidden"
                                priority
                                unoptimized
                            />
                        )}
                        {/* Web Banner - hidden on mobile, visible on desktop (>= 768px) */}
                        {webBannerUrl && (
                            <Image
                                src={webBannerUrl}
                                alt="About Us Banner"
                                fill
                                className="object-cover hidden md:block"
                                priority
                                unoptimized
                            />
                        )}
                        {/* Fallback: if only one image exists, show it for both views */}
                        {!mobileBannerUrl && webBannerUrl && (
                            <Image
                                src={webBannerUrl}
                                alt="About Us Banner"
                                fill
                                className="object-cover block md:hidden"
                                priority
                                unoptimized
                            />
                        )}
                        {!webBannerUrl && mobileBannerUrl && (
                            <Image
                                src={mobileBannerUrl}
                                alt="About Us Banner"
                                fill
                                className="object-cover hidden md:block"
                                priority
                                unoptimized
                            />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-[1px] text-white">
                                {t("aboutUs")}
                            </h1>
                        </div>
                    </div>
                ) : (
                    <div className="text-center page-head-wrapper">
                        <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                            {t("aboutUs")}
                        </h1>
                    </div>
                )}

                {/* Main Content */}
                <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-12">
                    {/* About Text Section */}
                    {aboutContent ? (
                        <div
                            className="prose prose-lg max-w-none mb-16"
                            dangerouslySetInnerHTML={{ __html: aboutContent }}
                        />
                    ) : (
                        <div className="prose prose-lg max-w-none mb-16">
                            <p className="text-[#2f2f2f] text-base md:text-lg leading-relaxed mb-4">
                                {t("aboutUsParagraph1")}
                            </p>
                            <p className="text-[#2f2f2f] text-base md:text-lg leading-relaxed mb-4">
                                {t("aboutUsParagraph2")}
                            </p>
                            <p className="text-[#2f2f2f] text-base md:text-lg leading-relaxed mb-4">
                                {t("aboutUsParagraph3")}
                            </p>
                            <p className="text-[#2f2f2f] text-base md:text-lg leading-relaxed mb-4">
                                {t("aboutUsParagraph4")}
                            </p>
                            <p className="text-[#2f2f2f] text-base md:text-lg leading-relaxed">
                                {t("aboutUsParagraph5")}
                            </p>
                        </div>
                    )}

                    {/* Gallery Section */}
                    {galleryImages.length > 0 && (
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold text-[#2f2f2f] mb-8 text-center uppercase">
                                {t("gallery")}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {galleryImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 cursor-pointer hover:scale-105 transition-transform duration-300"
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

                    {/* Team Members Section */}
                    {teamMembers.length > 0 && (
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold text-[#2f2f2f] mb-12 text-center uppercase">
                                {t("teamMembers")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                                {teamMembers.map((member, index) => (
                                    <div
                                        key={index}
                                        className="text-center"
                                    >
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
                                                <a
                                                    href={member.social.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-full bg-[#2f2f2f] flex items-center justify-center text-white hover:bg-[#FECB02] hover:text-[#2f2f2f] transition-colors"
                                                    aria-label={`${member.name} Instagram`}
                                                >
                                                    <Instagram className="w-5 h-5" />
                                                </a>
                                            )}
                                            {member.social.facebook !== "#" && (
                                                <a
                                                    href={member.social.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-full bg-[#2f2f2f] flex items-center justify-center text-white hover:bg-[#FECB02] hover:text-[#2f2f2f] transition-colors"
                                                    aria-label={`${member.name} Facebook`}
                                                >
                                                    <Facebook className="w-5 h-5" />
                                                </a>
                                            )}
                                            {member.social.twitter !== "#" && (
                                                <a
                                                    href={member.social.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-full bg-[#2f2f2f] flex items-center justify-center text-white hover:bg-[#FECB02] hover:text-[#2f2f2f] transition-colors"
                                                    aria-label={`${member.name} Twitter`}
                                                >
                                                    <Twitter className="w-5 h-5" />
                                                </a>
                                            )}
                                            {member.social.linkedin !== "#" && (
                                                <a
                                                    href={member.social.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-full bg-[#2f2f2f] flex items-center justify-center text-white hover:bg-[#FECB02] hover:text-[#2f2f2f] transition-colors"
                                                    aria-label={`${member.name} LinkedIn`}
                                                >
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
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

