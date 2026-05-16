import { apiClient } from "../api/axios";

export type AboutUsBannerImages = {
    webUrl?: string;
    mobileUrl?: string;
};

export type AboutUsGalleryItem = {
    imgUrls?: {
        largeImg?: string;
        mediumImg?: string;
        smallImg?: string;
    };
};

export type AboutUsTeamMember = {
    personName?: string;
    aboutPerson?: string;
    aboutPersonDesignation?: string;
    profilePicIcon?: string;
    instagramLink?: string;
    facebookLink?: string;
    twitterLink?: string;
    linkedInLink?: string;
    instagramIcon?: string;
    facebookIcon?: string;
    twitterIcon?: string;
    linkedInIcon?: string;
};

export type AboutUsTiming = {
    day?: string;
    time?: string;
};

export type AboutUsData = {
    bannerImages?: AboutUsBannerImages;
    aboutEditor?: {
        en?: string;
        es?: string;
    };
    gallery?: AboutUsGalleryItem[];
    teamMembers?: AboutUsTeamMember[];
    timings?: AboutUsTiming[];
};

export const AboutService = {
    getAboutUs: () => {
        const params = {
            storeId: "0",
        };
        return apiClient.get<{ data: AboutUsData }>("/aboutUs", { params });
    },
};

