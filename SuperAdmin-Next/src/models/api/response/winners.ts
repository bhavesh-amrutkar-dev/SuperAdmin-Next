
export interface WinnerResponse {
    message: string;
    data: WinnerItem[];
}

export interface WinnerDetailResponse {
    message: string;
    data: WinnerDetailData;
}

export interface WinnerDetailData {
    campaignDetail: WinnerItem[];
    totalParticipant: number;
    freeParticipant: number;
    paidParticipant: number;
}

export interface WinnerItem {
    _id: string;
    campaignTitle: string;
    campaignType: number;
    campaignTypeText: string;
    status: number;
    statusText: string;
    productName: string;
    image: ImageItem[];
    mobileImage: ImageItem[];
    currency: string;
    currencySymbol: string;
    drawDateTimeStemp: number;
    winnersVideo: WinnerVideo[];
    winnersList: WinnerDetail[];
    alternativeWinner?: WinnerDetail[]; // Added for detail page
    detailDesc: string;
    rulesOfTheDraw?: { [key: string]: string }; // Added for rules
    countryTickets?: CountryTicket[];
    ticketGoalAmount?: number;
    cashAwardAmount?: number;
}

export interface CountryTicket {
    countryId: string;
    countryName: string;
    tickets: Ticket[];
}

export interface Ticket {
    numberOfTicket: string;
    price: number;
    ticketId: string;
}

export interface ImageItem {
    small: string;
    medium: string;
    large: string;
    extraLarge: string;
    filePath: string;
    altText: string;
}

export interface WinnerVideo {
    videoUrl: string;
    winners: VideoWinnerDetail[];
}

export interface VideoWinnerDetail {
    winner_id: string;
    winner_name: string;
    winner: number;
    prizeName: string;
}

export interface WinnerDetail {
    _id: string;
    userId: string;
    userName: string;
    ticketId: number;
    firstName: string;
    lastName: string;
    profilePic: string;
    nameOfPrize?: string;
    nationality?: string;
    wonDate?: string;
    mobile?: string;
    city?: string;
    country?: string;
}
