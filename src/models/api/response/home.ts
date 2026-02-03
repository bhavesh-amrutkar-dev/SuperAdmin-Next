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

// export interface HomeSection {
//   _id: string;
//   title: string;
//   type: number;
//   sectionType: number;
//   visible: boolean;
//   banner_image: BannerImage[];
// }

export interface HomeSection {
    _id: string;
    title: string;
    afterLoginTitle?: string;
    description?: string;
    linkedWith?: number;
    visible: boolean;
    type: number;
    sectionType: number;
    buttonText?: string;
    image?: string[];
    width?: number;
    height?: number;
    cellType?: number;
    numberOfRows?: {
        row: number;
        cellCount: number;
    };
    entity?: any[];
    seqId?: number;
    banner_image: BannerImage[];
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