"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowLeft, Search, ChevronDown, ChevronUp, X, Minus, Plus, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { RaffleService } from "@/src/lib/services/raffles";
import { QuestionService, Question, QuestionsResponse } from "@/src/lib/services/question";
import { CartService } from "@/src/lib/services/cart";
import { TicketWalletService } from "@/src/lib/services/ticketWallet";
import { UserAddressService } from "@/src/lib/services/userAddress";
import ComingSoon from "@/src/components/common/ComingSoon";
import LoginModal from "@/src/components/modals/LoginModal";
import FreeTicketConfirmationModal from "@/src/components/modals/FreeTicketConfirmationModal";
import ApplyTicketConfirmationModal from "@/src/components/modals/ApplyTicketConfirmationModal";
import TermsAndConditionsModal from "@/src/components/modals/TermsAndConditionsModal";
import { BASE_URL, PRODUCT_CART, STORE_CATEGORY_ID, ENABLE_BRANCH_IO } from "@/src/lib/config";
import { createProductDeepLink } from "@/src/lib/services/deeplink";
import { getCookie } from "cookies-next";
import { useAuth } from "@/src/context/authContext";
// Raffle Detail Components
import WinProbabilitySection from "@/src/components/raffle-detail/WinProbabilitySection";
import CountdownTimerDisplay from "@/src/components/raffle-detail/CountdownTimerDisplay";
import PriceProgressBar from "@/src/components/raffle-detail/PriceProgressBar";
import Timeline from "@/src/components/raffle-detail/Timeline";
import EntrySelection from "@/src/components/raffle-detail/EntrySelection";
import QuantitySelector from "@/src/components/raffle-detail/QuantitySelector";
import AccordionSection from "@/src/components/raffle-detail/AccordionSection";
import QuestionsSection from "@/src/components/raffle-detail/QuestionsSection";
import HighlightsSection from "@/src/components/raffle-detail/HighlightsSection";

type Ticket = {
    ticketId?: string;
    price?: number;
    numberOfTicket?: number;
};

type TimelineDate = {
    key: string;
    date: number;
    isActive: boolean;
    label?: string;
};

type LegacyRaffleDetail = {
    productName?: string;
    campaignTitle?: string;
    name?: string;
    image?: { medium: string }[];
    currencySymbol?: string;
    ticketPrice?: number;
    price?: number;
    cashAwardAmount?: number;
    goalValue?: number;
    ticketGoalAmount?: number;
    drawDateTimeStemp?: number; // Unix timestamp in seconds
    drawDate?: string;
    startDateTimeStemp?: number;
    firstEndDateTimeStemp?: number;
    secondParticipationDateTimeStemp?: number;
    thirdParticipationDateTimeStemp?: number;
    isSecondParticipation?: boolean;
    isThirdParticipation?: boolean;
    totalEntriesSold?: number;
    totalTickets?: number;
    totalTicketsGenerated?: number;
    sold?: number;
    paidEntries?: number;
    freeEntries?: number;
    myEntries?: number;
    totalPaidTicketsGeneratedUser?: number;
    totalFreeTicketsGeneratedUser?: number;
    paidProbability?: number;
    freeProbability?: number;
    myProbablity?: number;
    description?: string;
    detailDesc?: string;
    raffleRules?: string;
    termsAndConditions?: string;
    sellerName?: string;
    sellerInfo?: string;
    tickets?: Ticket[];
    campaignId?: string;
    childProductId?: string;
    productId?: string;
    userTicketBalance?: number; // User's total available tickets from wallet
    availableTickets?: number;
    unitId?: string;
    storeId?: string;
    highlights?: string[];
    raffleEmailEntry?: boolean;
    raffleEmailEntryDesc?: {
        en?: string;
        es?: string;
    };
};
import { toast } from "sonner";
import { stripHtml } from "@/src/lib/utils/HtmltoText";
import { Button } from "../../../components/ui/button";
import ImageMagnify from "@/src/lib/utils/imageMagnify";


export default function RafflesDetailPage() {
    const { user } = useAuth();
    const [sharing, setSharing] = useState(false)
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [lotteryItem, setLotteryItem] = useState<LegacyRaffleDetail | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [qaSearchQuery, setQaSearchQuery] = useState<string>("");
    const [qaSortBy, setQaSortBy] = useState<string>("recent");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [defaultAddressId, setDefaultAddressId] = useState<string>("");
    const [selectedEntries, setSelectedEntries] = useState<number>(0);
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [ticketQuantity, setTicketQuantity] = useState<number>(0);
    const [applyingTicket, setApplyingTicket] = useState(false);
    const [continuing, setContinuing] = useState(false);
    const [showApplyConfirmationModal, setShowApplyConfirmationModal] = useState(false);
    const [userTicketBalance, setUserTicketBalance] = useState<number>(0);
    const [loadingTicketBalance, setLoadingTicketBalance] = useState(false);
    const [openSections, setOpenSections] = useState<{
        productDescription: boolean;
        rulesOfDraw: boolean;
        termsConditions: boolean;
        sellerInfo: boolean;
        questionsAnswers: boolean;
    }>({
        productDescription: false,
        rulesOfDraw: false,
        termsConditions: false,
        sellerInfo: false,
        questionsAnswers: false,
    });
    const [questionText, setQuestionText] = useState("");
    const [submittingQuestion, setSubmittingQuestion] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showEmailEntryModal, setShowEmailEntryModal] = useState(false);
    const [freeTicketError, setFreeTicketError] = useState<string | null>(null);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [showQuantitySelector, setShowQuantitySelector] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingCartData, setPendingCartData] = useState<{
        ticketId: string;
        quantity: number;
    } | null>(null);
    const [showFreeTicketModal, setShowFreeTicketModal] = useState(false);
    const [pendingFreeTicket, setPendingFreeTicket] = useState<{
        id: string;
        quantity: number;
    } | null>(null);
    const [participating, setParticipating] = useState(false);
    const maxQuestionLength = 1000;
    const [allRaffles, setAllRaffles] = useState<Array<LegacyRaffleDetail & { _id?: string }>>([]);
    const [displayedRafflesCount, setDisplayedRafflesCount] = useState(5);
    const [loadingRaffles, setLoadingRaffles] = useState(false);

    // Refs to prevent duplicate API calls
    const fetchingRaffleRef = useRef(false);
    const lastFetchedPidRef = useRef<string | null>(null);
    const fetchingTicketBalanceRef = useRef(false);
    const fetchingAddressesRef = useRef(false);
    const fetchingAllRafflesRef = useRef(false);
    const lastFetchedLotteryIdRef = useRef<string | null>(null);
    const lastFetchedLocaleRef = useRef<string | null>(null);
    const hasRestoredFromCartRef = useRef(false);
    const restoringFromCartRef = useRef(false);

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [animatedNumbers, setAnimatedNumbers] = useState({
        paid: 0,
        free: 0,
        mine: 0,
    });

    // Extract pid from searchParams outside useEffect for stable dependency
    const pid = searchParams?.get("pid");
    // Number animation effect
    const animateNumber = useCallback((target: number, key: "paid" | "free" | "mine") => {
        try {
            // Ensure target is a valid number
            const safeTarget = typeof target === "number" && !isNaN(target) && isFinite(target) ? Math.max(0, target) : 0;
            let current = 0;
            const increment = Math.ceil(safeTarget / 30) || 1;
            const interval = setInterval(() => {
                try {
                    current += increment;
                    if (current >= safeTarget) {
                        setAnimatedNumbers((prev) => ({ ...prev, [key]: safeTarget }));
                        clearInterval(interval);
                    } else {
                        setAnimatedNumbers((prev) => ({ ...prev, [key]: current }));
                    }
                } catch (err) {
                    clearInterval(interval);
                    // eslint-disable-next-line no-console
                    console.warn(`Error in animation for ${key}:`, err instanceof Error ? err.message : "Unknown error");
                }
            }, 16);
            return interval;
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(`Error setting up animation for ${key}:`, err instanceof Error ? err.message : "Unknown error");
            return null;
        }
    }, []);

    useEffect(() => {
        // Validate MongoDB ObjectId format (24 hex characters)
        const isValidObjectId = (id: string | null | undefined): id is string => {
            if (!id || typeof id !== "string") return false;
            // MongoDB ObjectId: 24 hex characters, no hyphens
            return /^[a-f0-9]{24}$/i.test(id);
        };

        // Read campaignId from query param 'pid' - it should always be a valid ObjectId
        // NEVER use params.id as fallback - it's always a slug from the URL path
        let lotteryId = pid || "";

        // Validate that pid is a valid ObjectId, not a slug
        if (lotteryId && !isValidObjectId(lotteryId)) {
            // If pid is a slug or invalid, log error
            console.warn("Invalid pid parameter - must be MongoDB ObjectId (24 hex chars):", {
                pid,
                paramsId: params?.id,
                pidLength: pid?.length,
                pidHasHyphens: pid?.includes("-")
            });
            lotteryId = "";
        }

        // DO NOT use params.id as fallback - it's always the slug from URL path
        // If pid is missing or invalid, show not found
        if (!lotteryId) {
            console.warn("No valid campaignId found in pid parameter. URL must include ?pid=<campaignId>:", {
                pid,
                paramsId: params?.id,
                currentUrl: typeof window !== "undefined" ? window.location.href : "N/A"
            });
            setNotFound(true);
            setLoading(false);
            return;
        }

        // Prevent duplicate calls for the same pid AND locale
        if (fetchingRaffleRef.current || (lastFetchedPidRef.current === lotteryId && lastFetchedLocaleRef.current === locale)) {
            return;
        }

        fetchingRaffleRef.current = true;
        lastFetchedPidRef.current = lotteryId;
        lastFetchedLocaleRef.current = locale;
        setLoading(true);

        RaffleService.getRaffleDetails(lotteryId)
            .then((payload) => {

                try {
                    const raw = payload as any;
                    let data: LegacyRaffleDetail | undefined = raw?.data;

                    // Some APIs return an array in `data`; take the first element
                    if (Array.isArray(data) && data.length > 0) {
                        data = data[0] as LegacyRaffleDetail;
                    }

                    if (data) {
                        setLotteryItem(data);
                        setNotFound(false);
                        // eslint-disable-next-line no-console
                    } else {
                        setNotFound(true);
                    }
                } catch (parseError) {
                    // Safely handle parsing errors
                    const errorMessage =
                        parseError instanceof Error
                            ? parseError.message
                            : typeof parseError === "string"
                                ? parseError
                                : parseError && typeof parseError === "object" && "message" in parseError
                                    ? String(parseError.message)
                                    : "Failed to parse raffle data";
                    // eslint-disable-next-line no-console
                    console.warn("Raffle detail parse error:", errorMessage);
                    setNotFound(true);
                }
            })
            .catch((err) => {
                // Safely serialize error for logging
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : typeof err === "string"
                            ? err
                            : err && typeof err === "object" && "message" in err
                                ? String(err.message)
                                : "Unknown error occurred";
                // eslint-disable-next-line no-console
                console.warn("Raffle detail error:", errorMessage);
                setNotFound(true);
            })
            .finally(() => {
                setLoading(false);
                fetchingRaffleRef.current = false;
            });
    }, [params?.id, pid, locale]); // Include locale to trigger refetch when language changes

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Animate numbers when lotteryItem loads
    useEffect(() => {
        if (!lotteryItem) return;

        try {
            const total = (lotteryItem.totalEntriesSold ?? lotteryItem.sold ?? 0) || 1;
            const paid = Math.round(((lotteryItem.paidEntries ?? lotteryItem.sold ?? 0) / total) * 100);
            const free = Math.round(((lotteryItem.freeEntries ?? 0) / total) * 100);
            const mine = Math.round(((lotteryItem.myEntries ?? 0) / total) * 100);

            const intervals: (NodeJS.Timeout | null)[] = [];
            intervals.push(animateNumber(paid, "paid"));
            intervals.push(animateNumber(free, "free"));
            intervals.push(animateNumber(mine, "mine"));

            // Cleanup function to clear all intervals
            return () => {
                intervals.forEach((interval) => {
                    if (interval) clearInterval(interval);
                });
            };
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn("Error in number animation effect:", err instanceof Error ? err.message : "Unknown error");
        }
    }, [lotteryItem, animateNumber]);

    // Countdown timer effect (placeholder - replace with actual end date from lotteryItem)
    useEffect(() => {
        if (!lotteryItem?.drawDateTimeStemp) {
            return;
        }

        try {
            // Extract timestamp value to avoid closure issues
            const drawTimestamp = lotteryItem.drawDateTimeStemp;

            // Validate timestamp
            if (typeof drawTimestamp !== "number" || isNaN(drawTimestamp) || !isFinite(drawTimestamp)) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const endDate = new Date(drawTimestamp * 1000); // Convert Unix timestamp (seconds) to milliseconds

            // Validate date
            if (isNaN(endDate.getTime())) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const calculateCountdown = () => {
                try {
                    const now = new Date().getTime();
                    const distance = endDate.getTime() - now;

                    if (distance > 0) {
                        setCountdown({
                            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                            seconds: Math.floor((distance % (1000 * 60)) / 1000),
                        });
                    } else {
                        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.warn("Error calculating countdown:", err instanceof Error ? err.message : "Unknown error");
                    setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                }
            };

            // Calculate immediately
            calculateCountdown();

            // Update every second for real-time countdown
            const interval = setInterval(calculateCountdown, 1000);

            return () => clearInterval(interval);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn("Error setting up countdown:", err instanceof Error ? err.message : "Unknown error");
            setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
    }, [lotteryItem?.drawDateTimeStemp]);

    // Helper function to get relative time
    const getRelativeTime = (timestamp: number): string => {
        const currentTime = Math.floor(Date.now() / 1000);
        const diff = currentTime - timestamp;
        const seconds = diff;
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const years = Math.floor(days / 365);

        if (seconds < 60) {
            return `${Math.round(seconds)} ${t("secondsAgo") || "seconds ago"}`;
        } else if (minutes < 60) {
            return `${Math.round(minutes)} ${t("minutesAgo") || "minutes ago"}`;
        } else if (hours < 24) {
            return `${Math.round(hours)} ${t("hoursAgo") || "hours ago"}`;
        } else if (days < 365) {
            return `${Math.round(days)} ${t("daysAgo") || "days ago"}`;
        } else {
            return `${Math.round(years)} ${t("yearsAgo") || "years ago"}`;
        }
    };

    // Fetch questions
    const fetchQuestions = useCallback(async () => {
        if (!lotteryItem) return;

        setQuestionsLoading(true);
        try {
            const triggerMap: Record<string, number> = {
                recent: 2, // Most Recent Questions
                oldest: 4, // Oldest Questions
                mostHelpful: 1, // Most Answers
            };

            const response = await QuestionService.getQuestions({
                skip: 0,
                limit: 10,
                parentProductId: lotteryItem.childProductId || lotteryItem.productId || (params?.id as string),
                trigger: triggerMap[qaSortBy] || 2,
                searchName: qaSearchQuery || undefined,
                raffleId: lotteryItem.campaignId,
            }) as QuestionsResponse;

            if (response && Array.isArray(response.data)) {
                setQuestions(response.data);
                setQuestionsCount(response.count || response.totalCount || response.data.length);
            } else if (Array.isArray(response)) {
                setQuestions(response);
                setQuestionsCount(response.length);
            } else {
                setQuestions([]);
                setQuestionsCount(0);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : err && typeof err === "object" && "message" in err
                            ? String(err.message)
                            : "Failed to fetch questions";
            // eslint-disable-next-line no-console
            console.warn("Error fetching questions:", errorMessage);
            setQuestions([]);
            setQuestionsCount(0);
        } finally {
            setQuestionsLoading(false);
        }
    }, [lotteryItem, qaSortBy, qaSearchQuery, params?.id, t]);

    // Fetch questions when filters change or lottery item loads
    useEffect(() => {
        if (lotteryItem) {
            fetchQuestions();
        }
    }, [lotteryItem, qaSortBy, qaSearchQuery, fetchQuestions]);

    // Fetch user's ticket balance
    useEffect(() => {
        const fetchTicketBalance = async () => {
            // Prevent duplicate calls
            if (fetchingTicketBalanceRef.current) return;

            // Check if user is authenticated before making API call
            const token = getCookie("access_token");
            if (!token) {
                setUserTicketBalance(0);
                setLoadingTicketBalance(false);
                return;
            }

            fetchingTicketBalanceRef.current = true;
            setLoadingTicketBalance(true);
            try {
                const response = await TicketWalletService.getTicketBalance();
                const balance =
                    // Most common
                    (typeof response === "object" && response && "data" in response && response.data && "ticketbalance" in response.data
                        ? (response.data as { ticketbalance?: number }).ticketbalance
                        : undefined) ??
                    // Some environments return nested `data.data.ticketbalance`
                    (typeof response === "object" && response && "data" in response && response.data && "data" in response.data
                        ? (response.data as { data?: { ticketbalance?: number } }).data?.ticketbalance
                        : undefined) ??
                    // Fallback: top-level `ticketbalance`
                    (typeof response === "object" && response && "ticketbalance" in response
                        ? (response as { ticketbalance?: number }).ticketbalance
                        : undefined);

                setUserTicketBalance(typeof balance === "number" && Number.isFinite(balance) ? balance : 0);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : typeof err === "string"
                            ? err
                            : err && typeof err === "object" && "message" in err
                                ? String(err.message)
                                : "Failed to fetch ticket balance";
                // eslint-disable-next-line no-console
                console.warn("Error fetching ticket balance:", errorMessage);
                setUserTicketBalance(0);
            } finally {
                setLoadingTicketBalance(false);
                fetchingTicketBalanceRef.current = false;
            }
        };

        fetchTicketBalance();
    }, []);

    // Fetch user addresses (/address API) on detail page load and store default address id
    useEffect(() => {
        const fetchAddresses = async () => {
            // Prevent duplicate calls
            if (fetchingAddressesRef.current) return;

            fetchingAddressesRef.current = true;
            try {
                const response = await UserAddressService.getAddresses();
                const addresses = response?.data || [];
                const defaultAddress = addresses.find((addr: any) => addr?.default === true);
                if (defaultAddress?._id) {
                    setDefaultAddressId(defaultAddress._id);
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.warn("Error fetching addresses (non-blocking):", err);
            } finally {
                fetchingAddressesRef.current = false;
            }
        };

        fetchAddresses();
    }, []);

    // Fetch all raffles for display
    useEffect(() => {
        const fetchAllRaffles = async () => {
            if (!lotteryItem) return;

            const currentId = lotteryItem?.campaignId || lotteryItem?.childProductId || lotteryItem?.productId || (typeof params?.id === 'string' ? params?.id : null);

            // Prevent duplicate calls for the same lottery item
            if (fetchingAllRafflesRef.current || lastFetchedLotteryIdRef.current === currentId) {
                return;
            }

            fetchingAllRafflesRef.current = true;
            lastFetchedLotteryIdRef.current = currentId;
            setLoadingRaffles(true);
            try {
                const payload = await RaffleService.getAllRaffles();
                const items = (payload as any)?.data ?? [];
                // Filter out the current raffle from the list
                const filteredItems = items.filter((item: any) => {
                    const itemId = item.campaignId || item.childProductId || item.productId || item._id;
                    return itemId !== currentId;
                });
                setAllRaffles(filteredItems);
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : typeof err === "string"
                            ? err
                            : err && typeof err === "object" && "message" in err
                                ? String(err.message)
                                : "Failed to fetch raffles";
                // eslint-disable-next-line no-console
                console.warn("Error fetching raffles:", errorMessage);
                setAllRaffles([]);
            } finally {
                setLoadingRaffles(false);
                fetchingAllRafflesRef.current = false;
            }
        };

        fetchAllRaffles();
    }, [lotteryItem, params?.id, locale]);

    // Set default ticket on mount - MUST be before early returns
    useEffect(() => {
        if (lotteryItem?.tickets && lotteryItem.tickets.length > 0 && !selectedTicket) {

            setSelectedTicket(lotteryItem.tickets[0].ticketId || null);
        }
    }, [lotteryItem, selectedTicket]);

    // Reset quantity and hide quantity selector when ticket selection changes
    // Skip this if we're restoring from cart
    useEffect(() => {
        if (restoringFromCartRef.current) {
            restoringFromCartRef.current = false;
            return; // Skip reset when restoring from cart
        }

        setShowQuantitySelector(false); // Hide quantity selector when ticket changes
        if (selectedTicket) {
            const ticketsSource: any[] =
                lotteryItem?.tickets ||
                (lotteryItem as any)?.ticketPackages ||
                (lotteryItem as any)?.ticketOptions ||
                (lotteryItem as any)?.entryOptions ||
                [];

            ticketsSource.forEach((ticket: any, index: number) => {
                const ticketId = ticket.ticketId || ticket.id || ticket._id || index.toString();
                if (selectedTicket === ticketId) {
                    const numberOfTickets = ticket.numberOfTicket || ticket.numberOfTickets || ticket.quantity || 0;
                    setSelectedQuantity(numberOfTickets || 1);
                }
            });
        }
    }, [selectedTicket, lotteryItem]);

    // Restore quantity from cart when returning to page
    useEffect(() => {
        const restoreFromCart = async () => {
            if (!lotteryItem || !lotteryItem.tickets || lotteryItem.tickets.length === 0) return;

            try {
                restoringFromCartRef.current = true; // Mark that we're restoring from cart

                const cartResponse = await CartService.getCart();
                const cartData = (cartResponse as any)?.data?.data || (cartResponse as any)?.data;
                const productId = lotteryItem.childProductId || lotteryItem.productId || (params?.id as string);

                if (cartData && cartData.sellers) {
                    for (const seller of cartData.sellers) {
                        if (seller.products) {
                            for (const product of seller.products) {
                                const prodId = product.productId || product.centralProductId || product._id;
                                const prodTicketId = product.ticketId || (product.ticketDetails?.ticketId);

                                // Match by productId
                                if (prodId === productId) {
                                    // Get quantity from cart
                                    const cartQuantity = typeof product.quantity === 'object' && product.quantity !== null
                                        ? Number(product.quantity.value) || 0
                                        : Number(product.quantity) || 0;

                                    if (cartQuantity > 0) {
                                        // Restore ticket selection if ticketId matches
                                        if (prodTicketId) {
                                            // Check if this ticketId exists in available tickets
                                            const ticketsSource: any[] =
                                                lotteryItem.tickets ||
                                                (lotteryItem as any)?.ticketPackages ||
                                                (lotteryItem as any)?.ticketOptions ||
                                                (lotteryItem as any)?.entryOptions ||
                                                [];

                                            const ticketExists = ticketsSource.some((ticket: any) => {
                                                const ticketId = ticket.ticketId || ticket.id || ticket._id;
                                                return ticketId === prodTicketId;
                                            });

                                            if (ticketExists) {
                                                // Set ticket first, then quantity
                                                setSelectedTicket(prodTicketId);
                                                // Use setTimeout to ensure ticket is set before quantity
                                                setTimeout(() => {
                                                    setSelectedQuantity(cartQuantity);
                                                    setShowQuantitySelector(true);
                                                    restoringFromCartRef.current = false;
                                                }, 100);
                                            } else {
                                                // Ticket doesn't exist, but restore quantity anyway
                                                setSelectedQuantity(cartQuantity);
                                                setShowQuantitySelector(true);
                                                restoringFromCartRef.current = false;
                                            }
                                        } else {
                                            // No ticketId in cart, restore quantity anyway
                                            setSelectedQuantity(cartQuantity);
                                            setShowQuantitySelector(true);
                                            restoringFromCartRef.current = false;
                                        }
                                        return; // Exit early once found
                                    }
                                }
                            }
                        }
                    }
                }

                // If no cart item found, reset the flag
                restoringFromCartRef.current = false;
            } catch (error) {
                // Silently fail - cart might not be available
                console.warn("Could not restore quantity from cart:", error);
                restoringFromCartRef.current = false;
            }
        };

        // Only restore if we have lotteryItem and tickets, and haven't already restored for this product
        const productId = lotteryItem?.childProductId || lotteryItem?.productId || (params?.id as string);
        if (lotteryItem && lotteryItem.tickets && lotteryItem.tickets.length > 0 && !hasRestoredFromCartRef.current) {
            hasRestoredFromCartRef.current = true;
            restoreFromCart();
        }

        // Reset restore flag when product changes
        return () => {
            hasRestoredFromCartRef.current = false;
        };
    }, [lotteryItem, params?.id]);


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

    if (notFound || (!loading && !lotteryItem)) {
        return (
            <main>
                <Header />
                <div className="container mx-auto px-4 py-12">
                    <Button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#797979] hover:text-[#5a5a5a] mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span>{t("goBack")}</span>
                    </Button>
                    <div className="flex items-center justify-center min-h-[40vh]">
                        <div className="text-center">
                            <p className="text-lg text-[#797979] mb-4">{t("raffleNotFound")}</p>
                            <Button
                                onClick={() => router.push("/raffles")}
                                className="px-6 py-2 text-sm font-medium text-white bg-[#797979] hover:bg-[#5a5a5a] rounded-md transition-colors"
                            >
                                {t("viewAllRaffles")}
                            </Button>
                        </div>
                    </div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    if (!lotteryItem) return null;


    // Check if user is authenticated
    const isAuthenticated = (): boolean => {
        const token = getCookie("access_token");
        return !!token;
    };

    // Handle apply tickets confirmation
    const handleApplyTicketsConfirm = async () => {
        if (ticketQuantity <= 0 || ticketQuantity > userTickets || !lotteryItem) {
            setShowApplyConfirmationModal(false);
            return;
        }

        setApplyingTicket(true);
        try {
            await TicketWalletService.applyWalletTickets({
                lotteryItem,
                selectedTicket,
                ticketQuantity,
                productId: pid as string,
                defaultAddressId,
            });

            // Reset quantity after successful apply
            setTicketQuantity(0);
            setShowApplyConfirmationModal(false);

            // Redirect to thank-you page
            router.push("/thank-you");
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : err && typeof err === "object" && "message" in err
                            ? String(err.message)
                            : "Failed to place order with tickets";
            // eslint-disable-next-line no-console
            console.warn("Order placement failed:", errorMessage);
            // TODO: replace with in-UI toast/notification instead of console output
        } finally {
            setApplyingTicket(false);
        }
    };

    // Handle add to cart
    const handleAddToCart = async (ticketId: string, quantity: number, redirectToCart: boolean = true, setExactQuantity: boolean = false) => {
        if (!lotteryItem || applyingTicket || quantity <= 0) return;

        setApplyingTicket(true);
        try {
            // Check if item already exists in cart
            let existingItemId: string | undefined = undefined;
            let existingQuantity = 0;

            try {
                const cartResponse = await CartService.getCart();
                const cartData = (cartResponse as any)?.data?.data || (cartResponse as any)?.data;

                if (cartData && cartData.sellers) {
                    const productId = lotteryItem.childProductId || lotteryItem.productId || (params?.id as string);

                    for (const seller of cartData.sellers) {
                        if (seller.products) {
                            for (const product of seller.products) {
                                const prodId = product.productId || product.centralProductId || product._id;
                                const prodTicketId = product.ticketId || (product.ticketDetails?.ticketId);

                                // Match by productId and ticketId
                                if (prodId === productId && prodTicketId === (ticketId || null)) {
                                    existingItemId = product.addToCartOnId || product._id;
                                    existingQuantity = typeof product.quantity === 'object' && product.quantity !== null
                                        ? Number(product.quantity.value) || 0
                                        : Number(product.quantity) || 0;
                                    break;
                                }
                            }
                            if (existingItemId) break;
                        }
                    }
                }
            } catch (cartError) {
                // If cart fetch fails, proceed with add action
                console.warn("Could not fetch cart to check for existing items:", cartError);
            }

            // If setExactQuantity is true (for quantity updates), set exact quantity
            // Otherwise, add to existing quantity (for initial add)
            const finalQuantity = existingItemId && setExactQuantity ? quantity : (existingItemId ? existingQuantity + quantity : quantity);
            const action = existingItemId ? 2 : 1; // 2 = update, 1 = add

            await CartService.addToCart({
                centralProductId: lotteryItem.childProductId || lotteryItem.productId || (params?.id as string),
                productId: lotteryItem.childProductId || lotteryItem.productId || (params?.id as string),
                unitId: lotteryItem.unitId || "",
                userType: 1,
                storeId: lotteryItem.storeId || "",
                ticketId: ticketId || null,
                campaignId: lotteryItem.campaignId,
                countryId: (getCookie("C_id") as string) || "633a6c3dd17f0000ea00102e",
                newQuantity: finalQuantity,
                action: action,
                cartType: 2,
                offers: {},
                storeTypeId: 8,
                deliveryAddress: {
                    latitude: (getCookie("lat") as string) || "0",
                    longitude: (getCookie("long") as string) || "0",
                },
                storeCategoryId: STORE_CATEGORY_ID,
                addToCartOnId: existingItemId, // Include addToCartOnId if updating existing item
            });

            // Dispatch event to update header cart count
            window.dispatchEvent(new Event('cartUpdated'));

            // Only redirect if redirectToCart is true
            if (redirectToCart) {
                router.push("/cart");
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : err && typeof err === "object" && "message" in err
                            ? String((err as any).message)
                            : "Failed to add to cart";
            // eslint-disable-next-line no-console
            console.warn("Add to cart failed:", errorMessage);
        } finally {
            setApplyingTicket(false);
        }
    };

    // Handle login success - call add to cart with pending data
    const handleLoginSuccess = async () => {
        if (pendingCartData) {
            // Wait a bit for the token to be set in cookies
            setTimeout(async () => {
                // Add to cart without redirect, then show quantity selector
                await handleAddToCart(pendingCartData.ticketId, pendingCartData.quantity, false);
                setSelectedQuantity(pendingCartData.quantity);
                setShowQuantitySelector(true);
                setPendingCartData(null);
            }, 500);
        }
    };

    // Handle remove from cart
    const handleRemoveFromCart = async (ticketId: string) => {
        if (!lotteryItem || applyingTicket) return;

        setApplyingTicket(true);
        try {
            // Get the cart item's addToCartOnId
            let existingItemId: string | undefined = undefined;

            try {
                const cartResponse = await CartService.getCart();
                const cartData = (cartResponse as any)?.data?.data || (cartResponse as any)?.data;

                if (cartData && cartData.sellers) {
                    const productId = lotteryItem.childProductId || lotteryItem.productId || (params?.id as string);

                    for (const seller of cartData.sellers) {
                        if (seller.products) {
                            for (const product of seller.products) {
                                const prodId = product.productId || product.centralProductId || product._id;
                                const prodTicketId = product.ticketId || (product.ticketDetails?.ticketId);

                                // Match by productId and ticketId
                                if (prodId === productId && prodTicketId === (ticketId || null)) {
                                    existingItemId = product.addToCartOnId || product._id;
                                    break;
                                }
                            }
                            if (existingItemId) break;
                        }
                    }
                }
            } catch (cartError) {
                console.warn("Could not fetch cart to find item to remove:", cartError);
                setApplyingTicket(false);
                return;
            }

            if (!existingItemId) {
                // Item not found in cart, just hide the quantity selector
                setShowQuantitySelector(false);
                setApplyingTicket(false);
                return;
            }

            // Remove from cart using action: 3
            await CartService.addToCart({
                centralProductId: lotteryItem.childProductId || lotteryItem.productId || (params?.id as string),
                productId: lotteryItem.childProductId || lotteryItem.productId || (params?.id as string),
                unitId: lotteryItem.unitId || "",
                userType: 1,
                storeId: lotteryItem.storeId || "",
                ticketId: ticketId || null,
                campaignId: lotteryItem.campaignId,
                countryId: (getCookie("C_id") as string) || "633a6c3dd17f0000ea00102e",
                newQuantity: 0,
                action: 3, // 3 = delete
                cartType: 2,
                typeOfCart: 1,
                storeTypeId: 1,
                offers: {},
                storeCategoryId: STORE_CATEGORY_ID,
                addToCartOnId: existingItemId,
                cartStatus: "removedcart",
                deliveryAddress: {
                    latitude: (getCookie("lat") as string) || "0",
                    longitude: (getCookie("long") as string) || "0",
                },
            });

            // Dispatch event to update header cart count
            window.dispatchEvent(new Event('cartUpdated'));

            // Hide quantity selector after removal
            setShowQuantitySelector(false);
            setSelectedQuantity(1);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : err && typeof err === "object" && "message" in err
                            ? String((err as any).message)
                            : "Failed to remove from cart";
            console.warn("Remove from cart failed:", errorMessage);
        } finally {
            setApplyingTicket(false);
        }
    };

    // Handle participate button click - add to cart without redirect, show quantity selector
    const handleParticipateClick = async (ticketId: string, quantity: number) => {
        if (participating || applyingTicket) return; // Prevent multiple clicks

        setParticipating(true);
        try {
            // Add to cart for both authenticated and guest users
            // Guest users will have items added to their guest cart
            await handleAddToCart(ticketId, quantity, false);
            setSelectedQuantity(quantity);
            setShowQuantitySelector(true);
        } catch (error) {
            // Error is already handled in handleAddToCart
            console.warn("Error in handleParticipateClick:", error);
        } finally {
            setParticipating(false);
        }
    };

    // Get timeline data
    const getTimelineData = (): TimelineDate[] => {
        const timeline: TimelineDate[] = [];

        if (lotteryItem.startDateTimeStemp) {
            timeline.push({
                key: "startDateTimeStemp",
                date: lotteryItem.startDateTimeStemp,
                isActive: true,
                label: t("participation") || "PARTICIPATION",
            });
        }

        if (lotteryItem.firstEndDateTimeStemp) {
            timeline.push({
                key: "firstEndDateTimeStemp",
                date: lotteryItem.firstEndDateTimeStemp,
                isActive: true,
                label: t("extended") || "EXTENDED",
            });
        }

        if (lotteryItem.secondParticipationDateTimeStemp && lotteryItem.isSecondParticipation) {
            timeline.push({
                key: "secondParticipationDateTimeStemp",
                date: lotteryItem.secondParticipationDateTimeStemp,
                isActive: true,
                label: t("extended") || "EXTENDED",
            });
        }

        if (lotteryItem.thirdParticipationDateTimeStemp && lotteryItem.isThirdParticipation) {
            timeline.push({
                key: "thirdParticipationDateTimeStemp",
                date: lotteryItem.thirdParticipationDateTimeStemp,
                isActive: true,
                label: t("extended") || "EXTENDED",
            });
        }

        if (lotteryItem.drawDateTimeStemp) {
            timeline.push({
                key: "drawDateTimeStemp",
                date: lotteryItem.drawDateTimeStemp,
                isActive: true,
                label: t("drawnOn") || "DRAWNON",
            });
        }

        return timeline;
    };

    const displayName = lotteryItem.productName || lotteryItem.campaignTitle || lotteryItem.name || "";
    const displayImage =
        lotteryItem.image?.[0]?.medium ?? PRODUCT_CART;
    const displayCurrency = lotteryItem.currencySymbol ?? "USD";
    const timelineData = getTimelineData();

    // User's available tickets (total wallet balance, not raffle-specific)
    // Use the fetched ticket balance from the API
    const userTickets = userTicketBalance;
    const slugifyName = (name: string) =>
        name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    const handleShare = async () => {
        // console.log("handleShare called");
        if (!lotteryItem) {
            console.warn("lotteryItem is null, aborting share");
            return;
        }

        const displaySlug = slugifyName(displayName || "raffle");
        let shareUrl = new URL(`raffles/${displaySlug}`, window.location.origin).toString();

        // Append params to the base URL for fallback/current behavior
        const urlObj = new URL(shareUrl);
        if (pid) urlObj.searchParams.append("pid", pid);
        if (lotteryItem.childProductId) urlObj.searchParams.append("cpid", lotteryItem.childProductId);
        shareUrl = urlObj.toString();
        // console.log("Initial fallback shareUrl:", shareUrl);

        // console.log("ENABLE_BRANCH_IO:", ENABLE_BRANCH_IO);

        if (ENABLE_BRANCH_IO) {
            try {
                setSharing(true);
                // console.log("Calling createProductDeepLink...");
                const deepLink = await createProductDeepLink({
                    id: typeof params?.id === 'string' ? params?.id : Array.isArray(params?.id) ? params?.id[0] : '',
                    name: displayName || "Raffle",
                    description: stripHtml(lotteryItem.description || lotteryItem.detailDesc || ""),
                    image: displayImage || "",
                    fallbackUrl: shareUrl
                });
                // console.log("createProductDeepLink result:", deepLink);
                if (deepLink) {
                    shareUrl = deepLink;
                    // console.log("Using Branch Deep Link:", shareUrl);
                }
            } catch (error) {
                console.warn("Error creating deep link:", error);
            }
        }

        try {
            setSharing(true);
            // console.log("Triggering navigator.share with URL:", shareUrl);

            if (navigator.share) {
                // Mobile native share (Safari iOS works on HTTPS + user gesture)
                await navigator.share({
                    title: displayName,
                    text: stripHtml(
                        lotteryItem.description ||
                        lotteryItem.detailDesc ||
                        "Check this out on Donrifa!"
                    ),

                    url: shareUrl,
                });
                // console.log("navigator.share completed");
            } else {
                // Clipboard fallback with Safari support
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(shareUrl);
                } else {
                    const textarea = document.createElement("textarea");
                    textarea.value = shareUrl;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                }
                toast.success("Link copied to clipboard!");
                // console.log("Clipboard fallback completed");
            }
        } catch (err) {
            console.warn("Share failed:", err);
        } finally {
            setSharing(false);
        }
    };

    return (
        <main className="bg-gray-50 min-h-screen">
            <Header />

            <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 py-4 md:py-10 pb-0 md:pb-10">
                {/* Full Width Header Title Section */}


                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-6 mb-6 mx-auto items-start">
                    {/* Left Column - Product Image and Win Probability */}
                    <div className="w-full lg:w-1/2 space-y-6 relative lg:sticky lg:top-[100px] xl:me-3">
                        {/* Product Image Area */}
                        <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 min-h-[250px] md:h-[500px] lg:h-[calc(100vh-150px)] flex items-center justify-center">
                            {/* Participate Rule Button - Moved to Left Column per User request */}
                            {lotteryItem?.raffleEmailEntry && (
                                <div className="flex justify-start">
                                    <Button
                                        onClick={() => setShowEmailEntryModal(true)}
                                        className="bg-gray-100 font-bold h-8 w-8 rounded-full transition-all flex items-center justify-center gap-2 tracking-wider absolute top-5 right-5 z-10" title="Participate Rule"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="!w-[18px] !h-[18px] text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                    </Button>
                                </div>
                            )}
                            <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center shadow-inner min-h-[250px] md:h-[500px] lg:h-[calc(100vh-150px)]">
                                <ImageMagnify
                                    largeImage={displayImage}
                                    product={{
                                        images: [
                                            {
                                                altText: displayName,
                                            },
                                        ],
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Selection and Call-to-Action */}
                    <div className="w-full lg:w-1/2 space-y-6 bg-gray-100 p-4 2xl:p-6 rounded-xl">
                        <div className="mx-auto mb-6">
                            <div className="flex items-center justify-between gap-2">
                                <h1 className="text-lg md:text-xl font-black text-[#2f2f2f] uppercase">
                                    {lotteryItem.productName || lotteryItem.name || lotteryItem.campaignTitle}
                                </h1>

                                <Button
                                    onClick={handleShare}
                                    disabled={sharing}
                                    className="relative -mr-px flex items-center justify-center rounded-full transition-colors duration-300 ease-in-out border border-gray-300 bg-white font-semibold transition-all hover:scale-102 hover:border-[#FECB02] px-3 sm:px-4"
                                >
                                    <Share2 size={18} />
                                    {sharing ? "..." : t("share") || "Share"}
                                </Button>
                            </div>
                        </div>
                        {/* Countdown Timer */}
                        <CountdownTimerDisplay countdown={countdown} />

                        {/* Timeline */}
                        <Timeline timelineData={timelineData} />

                        {/* Price and Progress Bar */}
                        <PriceProgressBar lotteryItem={lotteryItem} />

                        {/* Titles and Highlights Card */}
                        {lotteryItem.highlights && lotteryItem.highlights.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-gray-50">
                                <div className="space-y-5">
                                    {/* Campaign Title */}
                                    {lotteryItem.campaignTitle && (
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-[#FECB02]/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm">🏆</span>
                                            </div>
                                            <h3 className="text-lg md:text-xl font-black text-[#2f2f2f] uppercase tracking-wider leading-tight">
                                                {lotteryItem.campaignTitle}
                                            </h3>
                                        </div>
                                    )}

                                    {/* Highlights Content */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-4 w-1 bg-[#FECB02] rounded-full"></div>
                                            <h4 className="text-xs md:text-sm font-black text-amber-600 uppercase tracking-[0.1em]">
                                                {t("highlights") || "HIGHLIGHTS"}
                                            </h4>
                                        </div>

                                        <ul className="space-y-4">
                                            {(() => {
                                                const fullText = lotteryItem.highlights
                                                    .join('\n')
                                                    .replace(/\uFFFD/g, '')
                                                    .trim();

                                                if (!fullText) return [];

                                                const fragments = fullText
                                                    .split(/\n/g)
                                                    .map(f => f.trim())
                                                    .filter(f => f.length > 0);

                                                // 3. Process fragments to ensure icons are attached to content
                                                const processedRows: string[] = [];
                                                for (let i = 0; i < fragments.length; i++) {
                                                    const current = fragments[i];
                                                    const isIconOnly = current.length <= 4 && /[📌📁⚠️🏆]/.test(current);

                                                    if (isIconOnly && i + 1 < fragments.length) {
                                                        processedRows.push(current + " " + fragments[i + 1]);
                                                        i++; // Skip merged text
                                                    } else {
                                                        processedRows.push(current);
                                                    }
                                                }
                                                return processedRows;
                                            })().map((highlight: string, index: number) => {
                                                const hasEmoji = /[📌📁⚠️🏆]/.test(highlight.charAt(0));
                                                return (
                                                    <li key={index} className="flex items-start gap-3 group">
                                                        {!hasEmoji && (
                                                            <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FECB02] group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(254,203,2,0.4)]" />
                                                        )}
                                                        <span className={`text-sm md:text-base text-[#4a4a4a] font-medium leading-[1.6] ${hasEmoji ? 'pl-0' : ''}`}>
                                                            {highlight}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <EntrySelection
                            lotteryItem={lotteryItem}
                            selectedTicket={selectedTicket}
                            onTicketSelect={setSelectedTicket}
                            currencySymbol={displayCurrency}
                            freeTicketError={freeTicketError}
                            userTickets={userTickets}
                            ticketQuantity={ticketQuantity}
                            onTicketQuantityChange={setTicketQuantity}
                            onApplyClick={() => {
                                if (ticketQuantity <= 0 || ticketQuantity > userTickets || !lotteryItem) {
                                    return;
                                }
                                setShowApplyConfirmationModal(true);
                            }}
                            applyingTicket={applyingTicket}
                        />

                        {/* Participate Action Area - Sticky for conversion */}
                        <div className="mt-4 md:mt-6 z-40 border-t border-gray-100/50">
                            {showQuantitySelector ? (
                                <QuantitySelector
                                    selectedQuantity={selectedQuantity}
                                    onQuantityChange={setSelectedQuantity}
                                    onDecrease={async () => {
                                        const currentQty = Number(selectedQuantity) || 1;
                                        if (!applyingTicket && selectedTicket) {
                                            if (currentQty > 1) {
                                                const newQty = currentQty - 1;
                                                setSelectedQuantity(newQty);
                                                await handleAddToCart(selectedTicket, newQty, false, true);
                                            } else if (currentQty === 1) {
                                                await handleRemoveFromCart(selectedTicket);
                                            }
                                        }
                                    }}
                                    onIncrease={async () => {
                                        const currentQty = Number(selectedQuantity) || 1;
                                        const newQty = currentQty + 1;
                                        setSelectedQuantity(newQty);
                                        if (!applyingTicket && selectedTicket) {
                                            await handleAddToCart(selectedTicket, newQty, false, true);
                                        }
                                    }}
                                    onContinue={async () => {
                                        if (continuing || applyingTicket || !selectedTicket) return;
                                        setContinuing(true);
                                        try {
                                            await handleAddToCart(selectedTicket, selectedQuantity, false, true);
                                            await new Promise(resolve => setTimeout(resolve, 100));
                                        } catch (error) {
                                            console.warn("Error updating cart before redirect:", error);
                                        } finally {
                                            router.push("/cart");
                                        }
                                    }}
                                    applyingTicket={applyingTicket}
                                    continuing={continuing}
                                />
                            ) : (
                                <Button
                                    className="w-full btn-primary  disabled:opacity-50 disabled:cursor-not-allowed h-12 transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base transform hover:-translate-y-1 uppercase"
                                    onClick={() => {
                                        if (!lotteryItem || !selectedTicket || participating || applyingTicket) return;

                                        const ticketsSource: any[] =
                                            lotteryItem.tickets ||
                                            (lotteryItem as any).ticketPackages ||
                                            (lotteryItem as any).ticketOptions ||
                                            (lotteryItem as any).entryOptions ||
                                            [];

                                        let selectedTicketData: any = null;

                                        ticketsSource.forEach((ticket: any, index: number) => {
                                            const ticketId = ticket.ticketId || ticket.id || ticket._id || index.toString();
                                            if (selectedTicket && ticketId === selectedTicket) {
                                                const ticketPrice = ticket.price || ticket.ticketPrice || 0;
                                                const numberOfTickets = ticket.numberOfTicket || ticket.numberOfTickets || ticket.quantity || 0;
                                                selectedTicketData = {
                                                    id: ticketId,
                                                    price: ticketPrice,
                                                    quantity: numberOfTickets || 0,
                                                };
                                            }
                                        });

                                        if (selectedTicketData && selectedTicketData.price === 0) {
                                            if (!user) {
                                                setShowLoginModal(true);
                                                return;
                                            }
                                            setPendingFreeTicket({
                                                id: selectedTicketData.id,
                                                quantity: selectedTicketData.quantity || 1,
                                            });
                                            setShowFreeTicketModal(true);
                                            return;
                                        }

                                        if (selectedTicketData && selectedTicketData.price > 0) {
                                            handleParticipateClick(selectedTicketData.id, 1);
                                            return;
                                        }
                                    }}
                                    disabled={participating || applyingTicket || !selectedTicket}
                                >
                                    {participating || applyingTicket ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>{t("processing") || "Processing..."}</span>
                                        </>
                                    ) : (
                                        <span>{t("participate") || "PARTICIPATE"}</span>
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* Win Probability Section */}
                        <WinProbabilitySection lotteryItem={lotteryItem} />

                    </div>
                </div>

                {/* Additional Information Sections - Now properly at the bottom */}
                <div className="border border-gray-200 bg-white rounded-xl mt-6 lg:mt-8 overflow-hidden">
                    {/* Product Description Section */}
                    <AccordionSection
                        title={t("productDescription")}
                        isOpen={openSections.productDescription}
                        onToggle={() => toggleSection("productDescription")}
                    >
                        <div className="text-sm md:text-base text-[#797979] leading-relaxed">
                            {lotteryItem.detailDesc || lotteryItem.description ? (
                                <div
                                    className="accordion-content"
                                    dangerouslySetInnerHTML={{
                                        __html: lotteryItem.detailDesc || lotteryItem.description || ""
                                    }}
                                />
                            ) : (
                                <p className="text-sm text-[#797979]">{t("noDataAvailable")}</p>
                            )}
                        </div>
                    </AccordionSection>

                    {/* Rules of the Draw Section */}
                    <AccordionSection
                        title={t("rulesOfTheDraw")}
                        isOpen={openSections.rulesOfDraw}
                        onToggle={() => toggleSection("rulesOfDraw")}
                    >
                        <div className="text-sm md:text-base text-[#797979] mb-3 leading-relaxed">
                            {lotteryItem.raffleRules ? (
                                <div
                                    className="accordion-content"
                                    dangerouslySetInnerHTML={{ __html: lotteryItem.raffleRules }}
                                />
                            ) : (
                                <p className="text-sm text-[#797979]">{t("noDataAvailable")}</p>
                            )}
                        </div>
                    </AccordionSection>

                    {/* Terms and Conditions Section */}
                    <AccordionSection
                        title={t("termsAndConditions")}
                        isOpen={openSections.termsConditions}
                        onToggle={() => toggleSection("termsConditions")}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#797979]">-</span>
                            <button
                                onClick={() => setShowTermsModal(true)}
                                className="text-xs md:text-sm font-bold text-[#D4AF37] hover:text-[#B8860B] transition-colors uppercase"
                            >
                                {t("allDetails")}
                            </button>
                        </div>
                    </AccordionSection>

                    {/* Questions & Answers Section */}
                    <AccordionSection
                        title={`${t("questionsAndAnswers")} (${questionsCount})`}
                        isOpen={openSections.questionsAnswers}
                        onToggle={() => toggleSection("questionsAnswers")}
                    >
                        <div className="border-t border-gray-200 mt-2"></div>
                        <QuestionsSection
                            questions={questions}
                            questionsLoading={questionsLoading}
                            questionsCount={questionsCount}
                            getRelativeTime={getRelativeTime}
                        />
                    </AccordionSection>

                    {/* Seller Information Section */}
                    <AccordionSection
                        title={t("sellerInformation").toUpperCase()}
                        isOpen={openSections.sellerInfo}
                        onToggle={() => toggleSection("sellerInfo")}
                    >
                        <div className="text-sm md:text-base text-[#797979] leading-relaxed">
                            {lotteryItem.sellerInfo || lotteryItem.sellerName ? (
                                <p className="text-sm text-[#797979]">
                                    {lotteryItem.sellerInfo || lotteryItem.sellerName || t("noDataAvailable")}
                                </p>
                            ) : (
                                <p className="text-sm text-[#797979]">{t("noDataAvailable")}</p>
                            )}
                        </div>
                    </AccordionSection>
                </div>
            </div>

            {/* Scroll to Top Button */}
            {
                showScrollTop && (
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="fixed bottom-8 right-8 w-12 h-12 bg-[#797979] hover:bg-[#5a5a5a] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
                        aria-label={t("scrollToTop")}
                    >
                        <ChevronUp size={24} />
                    </button>
                )
            }

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setPendingCartData(null);
                }}
                onLoginSuccess={handleLoginSuccess}
            />

            {/* Free Ticket Confirmation Modal */}
            {
                lotteryItem && (
                    <FreeTicketConfirmationModal
                        isOpen={showFreeTicketModal}
                        onClose={() => {
                            setShowFreeTicketModal(false);
                            setPendingFreeTicket(null);
                            setFreeTicketError(null);
                        }}
                        pendingFreeTicket={pendingFreeTicket}
                        displayName={displayName}
                        lotteryItem={lotteryItem}
                        productId={params?.id as string}
                        defaultAddressId={defaultAddressId}
                        onError={(error) => {
                            setFreeTicketError(error);
                        }}
                    />
                )
            }

            {/* Participate Rule Modal */}
            {
                lotteryItem && showEmailEntryModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0px_2px_16px_0px_#f3c200b5] overflow-hidden animate-in fade-in zoom-in duration-200">
                            {/* Modal Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h2 className="text-lg font-black text-[#2f2f2f] uppercase tracking-wide">
                                    {t("participateRule") || "Participate Rule"}
                                </h2>
                                <button
                                    onClick={() => setShowEmailEntryModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-black cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div
                                    className="text-sm md:text-base text-[#4a4a4a] leading-relaxed space-y-4"
                                    dangerouslySetInnerHTML={{
                                        __html: typeof lotteryItem.raffleEmailEntryDesc === 'string'
                                            ? lotteryItem.raffleEmailEntryDesc
                                            : (lotteryItem.raffleEmailEntryDesc as any)?.[locale] || (lotteryItem.raffleEmailEntryDesc as any)?.["en"] || ""
                                    }}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-100 flex justify-end">
                                <Button
                                    onClick={() => setShowEmailEntryModal(false)}
                                    className="rounded-lg btn-primary py-3 px-6 font-semibold  hover:bg-yellow-400 hover:text-black transition disabled:opacity-50"
                                >
                                    {t("close") || "Close"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Apply Ticket Confirmation Modal */}
            <ApplyTicketConfirmationModal
                isOpen={showApplyConfirmationModal}
                onClose={() => {
                    setShowApplyConfirmationModal(false);
                }}
                onConfirm={handleApplyTicketsConfirm}
                ticketQuantity={ticketQuantity}
                isApplying={applyingTicket}
            />

            {/* Terms and Conditions Modal */}
            <TermsAndConditionsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                termsAndConditions={lotteryItem.termsAndConditions}
            />

            <PreFooterIconModule />
            <Footer />

        </main>
    );
}
