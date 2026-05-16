// src/lib/models/home.ts

export interface HomeApiResponse {
    success: boolean;
    data: HomePageData;
}

export interface HomePageData {
    banners: Banner[];
    raffles: Raffle[];
    categories: Category[];
    winners: Winner[];
}

export interface Banner {
    id: string;
    title: string;
    image: string;
    redirectUrl?: string;
}

export interface Raffle {
    id: string;
    name: string;
    price: number;
    image: string;
    drawDate: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
}

export interface Winner {
    id: string;
    name: string;
    prize: string;
    image: string;
}
export interface HomeBanner {
    imageWeb: string;
    imageMobile: string;
    title: string;
    categories: {
        id: string;
        label: string;
    }[];
}


export interface BannerCategory {
    id: string;
    name: Record<string, string>; // en, es, etc
}

export interface BannerImage {
    image_web: string;
    image_mobile: string;
    data: BannerCategory[];
    linkWith: "Category" | string;
    city?: {
        cityId: string;
        cityName: string;
    };
}

export interface HomeSection {
    _id?: string;
    title?: string;
    description?: string;
    type?: number;
    sectionType?: number;
    visible?: boolean;
    banner_image?: BannerImage[];
    buttonText?: string;
    entity?: any[];
    cellType?: number;
}


export interface RaffleItem {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    currencySymbol?: string;
    image: string;
}

export interface RaffleSection {
    id: string;
    title: string;
    description?: string;
    cellType: number;
    items: RaffleItem[];
}

export type HomeApiResponseV2 = {
  homePageSeo: {
    metatags: string;
    metatagsdesc: string;
    title: string;
    copyRight: string;
  };
  banner_images: BannerImage[];
};
