"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowLeft, Search, ChevronDown, ChevronUp, X, Minus, Plus, Share2 } from "lucide-react";
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
import { BASE_URL, PRODUCT_CART, STORE_CATEGORY_ID } from "@/src/lib/config";
import { getCookie } from "cookies-next";

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
};
import CountdownTimer from "@/src/components/CountdownTimer";
import { createProductDeepLink } from "@/src/lib/services/deeplink";
import { toast } from "sonner";


export default function RefflesDetailPage() {
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
    const [userTicketBalance, setUserTicketBalance] = useState<number>(0);
    const [loadingTicketBalance, setLoadingTicketBalance] = useState(false);
    const [openSections, setOpenSections] = useState<{
        productDescription: boolean;
        rulesOfDraw: boolean;
        termsConditions: boolean;
        sellerInfo: boolean;
        questionsAnswers: boolean;
    }>({
        productDescription: true,
        rulesOfDraw: false,
        termsConditions: false,
        sellerInfo: false,
        questionsAnswers: true,
    });
    const [questionText, setQuestionText] = useState("");
    const [submittingQuestion, setSubmittingQuestion] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [freeTicketError, setFreeTicketError] = useState<string | null>(null);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [showQuantitySelector, setShowQuantitySelector] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingCartData, setPendingCartData] = useState<{
        ticketId: string;
        quantity: number;
    } | null>(null);
    const maxQuestionLength = 1000;
    const [allRaffles, setAllRaffles] = useState<Array<LegacyRaffleDetail & { _id?: string }>>([]);
    const [displayedRafflesCount, setDisplayedRafflesCount] = useState(5);
    const [loadingRaffles, setLoadingRaffles] = useState(false);

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
    const pid = searchParams.get("pid");
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
                    console.error(`Error in animation for ${key}:`, err instanceof Error ? err.message : "Unknown error");
                }
            }, 16);
            return interval;
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`Error setting up animation for ${key}:`, err instanceof Error ? err.message : "Unknown error");
            return null;
        }
    }, []);

    console.log("p.id", pid);
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
            console.error("Invalid pid parameter - must be MongoDB ObjectId (24 hex chars):", {
                pid,
                paramsId: params.id,
                pidLength: pid?.length,
                pidHasHyphens: pid?.includes("-")
            });
            lotteryId = "";
        }

        // DO NOT use params.id as fallback - it's always the slug from URL path
        // If pid is missing or invalid, show not found
        if (!lotteryId) {
            console.error("No valid campaignId found in pid parameter. URL must include ?pid=<campaignId>:", {
                pid,
                paramsId: params.id,
                currentUrl: typeof window !== "undefined" ? window.location.href : "N/A"
            });
            setNotFound(true);
            setLoading(false);
            return;
        }

        setLoading(true);
        console.log("lotteryId ----- 1", lotteryId);

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
                    console.error("Raffle detail parse error:", errorMessage);
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
                console.error("Raffle detail error:", errorMessage);
                setNotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [params.id, pid, locale]);

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
            console.error("Error in number animation effect:", err instanceof Error ? err.message : "Unknown error");
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
                    console.error("Error calculating countdown:", err instanceof Error ? err.message : "Unknown error");
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
            console.error("Error setting up countdown:", err instanceof Error ? err.message : "Unknown error");
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
                parentProductId: lotteryItem.childProductId || lotteryItem.productId || (params.id as string),
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
            console.error("Error fetching questions:", errorMessage);
            setQuestions([]);
            setQuestionsCount(0);
        } finally {
            setQuestionsLoading(false);
        }
    }, [lotteryItem, qaSortBy, qaSearchQuery, params.id, t]);

    // Fetch questions when filters change or lottery item loads
    useEffect(() => {
        if (lotteryItem) {
            fetchQuestions();
        }
    }, [lotteryItem, qaSortBy, qaSearchQuery, fetchQuestions]);

    // Fetch user's ticket balance
    useEffect(() => {
        const fetchTicketBalance = async () => {
            // Check if user is authenticated before making API call
            const token = getCookie("access_token");
            if (!token) {
                setUserTicketBalance(0);
                setLoadingTicketBalance(false);
                return;
            }

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
                console.error("Error fetching ticket balance:", errorMessage);
                setUserTicketBalance(0);
            } finally {
                setLoadingTicketBalance(false);
            }
        };

        fetchTicketBalance();
    }, []);

    // Fetch user addresses (/address API) on detail page load and store default address id
    useEffect(() => {
        const fetchAddresses = async () => {
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
            }
        };

        fetchAddresses();
    }, []);

    // Fetch all raffles for display
    useEffect(() => {
        const fetchAllRaffles = async () => {
            setLoadingRaffles(true);
            try {
                const payload = await RaffleService.getAllRaffles();
                const items = (payload as any)?.data ?? [];
                // Filter out the current raffle from the list
                const currentId = lotteryItem?.campaignId || lotteryItem?.childProductId || lotteryItem?.productId || params.id;
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
                console.error("Error fetching raffles:", errorMessage);
                setAllRaffles([]);
            } finally {
                setLoadingRaffles(false);
            }
        };

        if (lotteryItem) {
            fetchAllRaffles();
        }
    }, [lotteryItem, params.id]);

    // Set default ticket on mount - MUST be before early returns
    useEffect(() => {
        if (lotteryItem?.tickets && lotteryItem.tickets.length > 0 && !selectedTicket) {
            setSelectedTicket(lotteryItem.tickets[0].ticketId || null);
        }
    }, [lotteryItem, selectedTicket]);

    // Reset quantity and hide quantity selector when ticket selection changes
    useEffect(() => {
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
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#797979] hover:text-[#5a5a5a] mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span>{t("goBack")}</span>
                    </button>
                    <div className="flex items-center justify-center min-h-[40vh]">
                        <div className="text-center">
                            <p className="text-lg text-[#797979] mb-4">{t("raffleNotFound")}</p>
                            <button
                                onClick={() => router.push("/reffles")}
                                className="px-6 py-2 text-sm font-medium text-white bg-[#797979] hover:bg-[#5a5a5a] rounded-md transition-colors"
                            >
                                {t("viewAllRaffles")}
                            </button>
                        </div>
                    </div>
                </div>
                <PreFooterIconModule />
                <Footer />
            </main>
        );
    }

    if (!lotteryItem) return null;

    // Helper function to calculate progress percentage
    // Based on old code: CountPercentage(ProductData?.goalValue, ProductData?.ticketGoalAmount)
    const calculateProgress = (goalValue: number | undefined, ticketGoalAmount: number | undefined): number => {
        if (!goalValue || !ticketGoalAmount || ticketGoalAmount === 0) return 0;
        const percentage = (goalValue / ticketGoalAmount) * 100;
        return Math.min(100, Math.max(0, Math.round(percentage)));
    };

    // Helper function to format date
    const formatDate = (timestamp: number | undefined): string => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }).toUpperCase();
        } catch {
            return "";
        }
    };

    // Helper function to slugify name for URL
    const slugifyName = (name: string) =>
        name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    // Helper function to calculate progress percentage
    const getProgressPercentage = (total?: number, goal?: number): number => {
        if (!total || !goal || total <= 0) return 0;
        const percentage = (goal / total) * 100;
        if (percentage > 100) return 100;
        return Math.round(percentage);
    };

    // Handle load more raffles
    const handleLoadMore = () => {
        setDisplayedRafflesCount((prev) => Math.min(prev + 5, allRaffles.length));
    };

    // Handle paid ticket purchase
    const handlePaidTicketPurchase = async (ticketId: string, quantity: number) => {
        if (!lotteryItem || applyingTicket || quantity <= 0) return;

        setApplyingTicket(true);
        try {
            await TicketWalletService.purchasePaidTicket({
                lotteryItem,
                ticketId,
                quantity,
                productId: params.id as string,
                defaultAddressId,
            });

            router.push("/thank-you");
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : err && typeof err === "object" && "message" in err
                            ? String((err as any).message)
                            : "Failed to place order";
            // eslint-disable-next-line no-console
            console.warn("Order placement failed:", errorMessage);
        } finally {
            setApplyingTicket(false);
        }
    };

    // Check if user is authenticated
    const isAuthenticated = (): boolean => {
        const token = getCookie("access_token");
        return !!token;
    };

    // Handle add to cart
    const handleAddToCart = async (ticketId: string, quantity: number) => {
        if (!lotteryItem || applyingTicket || quantity <= 0) return;

        setApplyingTicket(true);
        try {
            await CartService.addToCart({
                centralProductId: lotteryItem.childProductId || lotteryItem.productId || (params.id as string),
                productId: lotteryItem.childProductId || lotteryItem.productId || (params.id as string),
                unitId: lotteryItem.unitId || "",
                userType: 1,
                storeId: lotteryItem.storeId || "",
                ticketId: ticketId || null,
                campaignId: lotteryItem.campaignId,
                countryId: (getCookie("C_id") as string) || "633a6c3dd17f0000ea00102e",
                newQuantity: quantity,
                action: 1,
                cartType: 2,
                offers: {},
                storeTypeId: 8,
                deliveryAddress: {
                    latitude: (getCookie("lat") as string) || "0",
                    longitude: (getCookie("long") as string) || "0",
                },
                storeCategoryId: STORE_CATEGORY_ID,
            });

            // Redirect to cart page
            router.push("/cart");
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
                await handleAddToCart(pendingCartData.ticketId, pendingCartData.quantity);
                setPendingCartData(null);
            }, 500);
        }
    };

    // Handle continue button click - check auth first
    const handleContinueClick = (ticketId: string, quantity: number) => {
        if (!isAuthenticated()) {
            // Store cart data and show login modal
            setPendingCartData({ ticketId, quantity });
            setShowLoginModal(true);
        } else {
            // User is authenticated, add to cart directly
            handleAddToCart(ticketId, quantity);
        }
    };

    // Get displayed raffles
    const displayedRaffles = allRaffles.slice(0, displayedRafflesCount);

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

    const displayName = lotteryItem.campaignTitle || lotteryItem.productName || lotteryItem.name || "";
    const displayImage =
        lotteryItem.image?.[0]?.medium ?? PRODUCT_CART;
    const displayPrice = lotteryItem.goalValue ?? lotteryItem.ticketPrice ?? lotteryItem.price;
    const displayCurrency = lotteryItem.currencySymbol ?? "USD";
    const progressPercentage = calculateProgress(
        lotteryItem.goalValue,
        lotteryItem.ticketGoalAmount
    );
    const timelineData = getTimelineData();

    // Calculate probabilities - use API values if available, otherwise calculate
    const totalEntries = lotteryItem.totalTicketsGenerated ?? lotteryItem.totalEntriesSold ?? 0;
    // Paid probability: use API value or calculate
    const paidProbability = lotteryItem.paidProbability !== undefined
        ? Math.round(lotteryItem.paidProbability)
        : totalEntries > 0
            ? Math.round(((lotteryItem.paidEntries ?? lotteryItem.sold ?? 0) / totalEntries) * 100)
            : 0;
    // Free probability: use API value or calculate
    const freeProbability = lotteryItem.freeProbability !== undefined
        ? Math.round(lotteryItem.freeProbability)
        : totalEntries > 0
            ? Math.round(((lotteryItem.freeEntries ?? 0) / totalEntries) * 100)
            : 0;
    // My probability: use API value or calculate
    const myTotalEntries = (lotteryItem.totalPaidTicketsGeneratedUser ?? 0) + (lotteryItem.totalFreeTicketsGeneratedUser ?? 0);
    const myProbability = lotteryItem.myProbablity !== undefined
        ? Math.round(lotteryItem.myProbablity)
        : totalEntries > 0
            ? Math.round((myTotalEntries / totalEntries) * 100)
            : 0;

    // User's available tickets (total wallet balance, not raffle-specific)
    // Use the fetched ticket balance from the API
    const userTickets = userTicketBalance;

    // Circular Progress Bar Component
    const CircularProgressBar = ({ percentage }: { percentage: number }) => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#797979]">{percentage}%</span>
                </div>
            </div>
        );
    };

    // const handleShare = async () => {
    //     if (!lotteryItem) return
    //     console.log("lotteryItem", lotteryItem);

    //     try {
    //         setSharing(true)

    //         const link = await createProductDeepLink({
    //             id: pid as string,
    //             name: displayName || "Product",
    //             description:

    //                 lotteryItem.description ||
    //                 lotteryItem.detailDesc ||
    //                 "Check this out on Donrifa!",
    //             image: displayImage,
    //         })

    //         // Mobile native share
    //         if (navigator.share) {
    //             await navigator.share({
    //                 title: displayName,
    //                 text: "Check this out!",
    //                 url: link,
    //             })
    //         } else {
    //             // Desktop fallback → copy link
    //             await navigator.clipboard.writeText(link)
    //             alert("Link copied to clipboard")
    //         }
    //     } catch (err) {
    //         console.error("Share failed:", err)
    //     } finally {
    //         setSharing(false)
    //     }
    // }

    const handleShare = async () => {
        const url = `${BASE_URL}raffles/${pid}`

        if (navigator.share) {
            try {
                await navigator.share({ title: displayName, url })
            } catch (err) {
                console.warn("Share failed:", err)
            }
        } else {
            await navigator.clipboard.writeText(url)
            toast.success("Link copied to clipboard!")
        }
    }



    return (
        <main className="bg-gray-50 min-h-screen">
            <Header />

            <div className="w-full px-4 py-4 md:py-6">
                {/* Campaign Title and Product Name - Full Width */}
                <div className="mx-auto mb-6">
                    <div className="bg-white rounded-lg shadow-lg p-4 flex items-start justify-between">
                        <div>
                            {lotteryItem.campaignTitle && (
                                <h3 className="text-lg font-bold text-[#2f2f2f] uppercase mb-2">
                                    {lotteryItem.campaignTitle}
                                </h3>
                            )}
                        </div>

                        <button
                            onClick={handleShare}
                            disabled={sharing}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#2f2f2f] border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        >
                            <Share2 size={18} />
                            {sharing ? "Sharing..." : "Share"}
                        </button>
                    </div>

                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-6 mb-6 mx-auto items-start">
                    {/* Left Side - Product Image and Win Probability */}
                    <div className="w-full lg:w-2/5 space-y-6">

                        {/* Product Image Area */}
                        <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 min-h-[250px] flex items-center justify-center">
                            <div className="relative w-full max-w-xs aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                                <Image
                                    src={displayImage}
                                    alt={displayName}
                                    fill
                                    unoptimized
                                    className="object-contain p-3 md:p-4"
                                />
                            </div>
                        </div>

                        {/* Win Probability Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                            {/* Row 1: Title */}
                            <h2 className="text-lg md:text-xl font-bold text-[#2f2f2f] mb-6 uppercase text-center">
                                {t("winProbability")}
                            </h2>

                            {/* Row 2: Statistics */}
                            <div className="mb-6">
                                <div className="flex flex-col md:flex-row md:justify-center gap-4 md:gap-6">
                                    <div className="text-center">
                                        <div className="text-sm md:text-base text-[#2f2f2f]">
                                            <span className="font-semibold">{t("totalEntriesSold")}:</span>
                                            <br />
                                            <span className="text-[#797979]">{totalEntries.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm md:text-base text-[#2f2f2f]">
                                            <span className="font-semibold">{t("myPaidEntries")}:</span>
                                            <br />
                                            <span className="text-[#797979]">
                                                {(lotteryItem.totalPaidTicketsGeneratedUser ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm md:text-base text-[#2f2f2f]">
                                            <span className="font-semibold">{t("myFreeEntries")}:</span>
                                            <br />
                                            <span className="text-[#797979]">
                                                {(lotteryItem.totalFreeTicketsGeneratedUser ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Progress Bars */}
                            <div className="mb-6">
                                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                                    <div className="flex flex-col items-center">
                                        <CircularProgressBar percentage={paidProbability} />
                                        <p className="SubProgress text-xs md:text-sm font-medium text-[#797979] mt-3 whitespace-nowrap">
                                            {t("paid")}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <CircularProgressBar percentage={freeProbability} />
                                        <p className="SubProgress text-xs md:text-sm font-medium text-[#797979] mt-3 whitespace-nowrap">
                                            {t("free")}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <CircularProgressBar percentage={myProbability} />
                                        <p className="SubProgress text-xs md:text-sm font-medium text-[#797979] mt-3 whitespace-nowrap">
                                            {t("myProbability")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <p className="text-xs md:text-sm text-[#797979] leading-relaxed text-center">
                                {t("probabilityDisclaimer")}
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Sidebar */}
                    <div className="w-full lg:w-3/5 space-y-6">
                        {/* Countdown Timer */}
                        <div className="bg-black rounded-lg p-4">
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-[#D4AF37] rounded p-3 text-center">
                                    <div className="text-2xl font-bold text-black">{countdown.days}</div>
                                    <div className="text-xs font-medium text-black mt-1">{t("days")}</div>
                                </div>
                                <div className="bg-[#D4AF37] rounded p-3 text-center">
                                    <div className="text-2xl font-bold text-black">{countdown.hours}</div>
                                    <div className="text-xs font-medium text-black mt-1">{t("hrs")}</div>
                                </div>
                                <div className="bg-[#D4AF37] rounded p-3 text-center">
                                    <div className="text-2xl font-bold text-black">{countdown.minutes}</div>
                                    <div className="text-xs font-medium text-black mt-1">{t("mins")}</div>
                                </div>
                                <div className="bg-[#D4AF37] rounded p-3 text-center">
                                    <div className="text-2xl font-bold text-black">{countdown.seconds}</div>
                                    <div className="text-xs font-medium text-black mt-1">{t("sec")}</div>
                                </div>
                            </div>
                        </div>

                        {/* Price and Progress Bar */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-semibold text-[#797979]">
                                    {displayCurrency} {displayPrice ?? "0"}
                                </span>
                                <span className="text-lg font-semibold text-[#797979]">
                                    {progressPercentage}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#D4AF37] transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Timeline */}
                        {timelineData.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-4">
                                <div className="relative flex items-start justify-between">
                                    {/* Connecting line */}
                                    <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-[#D4AF37] z-0"></div>

                                    {timelineData.map((item, index) => (
                                        <div key={item.key} className="flex flex-col items-center flex-1 relative z-10">
                                            <div
                                                className={`w-3 h-3 rounded-full ${item.isActive ? "bg-[#D4AF37]" : "bg-gray-300"
                                                    } mb-2`}
                                            ></div>
                                            <div className="text-center">
                                                <p className="text-xs font-medium text-[#797979]">
                                                    {formatDate(item.date)}
                                                </p>
                                                <p className="text-xs text-[#797979] mt-1">
                                                    {item.label}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Entry Selection */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <p className="text-sm font-semibold text-[#797979] mb-1">{t("selectEntries")}</p>
                            {freeTicketError && (
                                <p className="mb-2 text-xs text-red-500">
                                    {freeTicketError}
                                </p>
                            )}
                            <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100">
                                {(() => {
                                    // Check multiple possible ticket field names
                                    const tickets =
                                        lotteryItem.tickets ||
                                        (lotteryItem as any).ticketPackages ||
                                        (lotteryItem as any).ticketOptions ||
                                        (lotteryItem as any).entryOptions ||
                                        [];

                                    // eslint-disable-next-line no-console
                                    console.log("Tickets check:", {
                                        tickets: lotteryItem.tickets,
                                        ticketPackages: (lotteryItem as any).ticketPackages,
                                        ticketOptions: (lotteryItem as any).ticketOptions,
                                        allKeys: Object.keys(lotteryItem || {})
                                    });

                                    if (tickets && Array.isArray(tickets) && tickets.length > 0) {
                                        return (
                                            <>
                                                {tickets.map((ticket: any, index: number) => {
                                                    // Handle different ticket structures
                                                    const ticketId = ticket.ticketId || ticket.id || ticket._id || index.toString();
                                                    const ticketPrice = ticket.price || ticket.ticketPrice || 0;
                                                    const numberOfTickets = ticket.numberOfTicket || ticket.numberOfTickets || ticket.quantity || 0;

                                                    return (
                                                        <button
                                                            key={ticketId}
                                                            onClick={() => setSelectedTicket(ticketId)}
                                                            className={`shrink-0 min-w-[220px] p-3 rounded-lg border-2 transition-all ${selectedTicket === ticketId
                                                                ? "border-[#D4AF37] bg-[#FFF8E7]"
                                                                : "border-gray-200 hover:border-[#D4AF37]"
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium text-[#797979]">
                                                                    {displayCurrency} {ticketPrice?.toFixed(2) || "0.00"}
                                                                </span>
                                                                <span className="text-xs text-[#797979]">
                                                                    ({numberOfTickets || 0} {t("tickets") || "Tickets"})
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </>
                                        );
                                    } else {
                                        return (
                                            <div className="text-sm text-[#797979] text-center py-4 w-full">
                                                {t("noTicketsAvailable") || "No tickets available"}
                                            </div>
                                        );
                                    }
                                })()}
                            </div>

                            {/* Special Ticket Entry Box */}
                            <div className="mt-4 p-4 bg-[#2f2f2f] rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-semibold text-white uppercase">{t("tickets") || "TICKETS"}</span>
                                    <button className="text-xs px-3 py-1 bg-transparent border border-white text-white rounded hover:bg-white hover:text-[#2f2f2f] transition-colors">
                                        {t("useWithRestrictions") || "Use with Restrictions"}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">⭐</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-2xl font-bold text-[#D4AF37] uppercase">
                                                {userTickets} {t("tickets") || "TICKETS"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label htmlFor="ticketQuantity" className="mr-2 text-white">
                                            Tickets
                                        </label>

                                        <input
                                            id="ticketQuantity"
                                            type="number"
                                            min="0"
                                            max={userTickets}
                                            value={ticketQuantity}
                                            onChange={(e) => {
                                                const val = Math.max(0, Math.min(userTickets, parseInt(e.target.value) || 0));
                                                setTicketQuantity(val);
                                            }}
                                            className="ticket-quantity w-16 h-12 bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold rounded text-center focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                                        />
                                    </div>
                                </div>
                                {/* How to earn text and Apply button in one row */}
                                <div className="mt-4 mb-1 flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <button className="text-sm text-white hover:text-[#D4AF37] font-semibold transition-colors">
                                            {t("howToEarn") || "How to Earn?"}
                                        </button>
                                        <p className="mt-2 text-xs text-white italic">
                                            {t("ticketPurchaseNote") || "NOTE: Please click on Request purchase with ticket"}
                                        </p>
                                    </div>
                                    {ticketQuantity > 0 && (
                                        <button
                                            onClick={async () => {
                                                if (ticketQuantity <= 0 || ticketQuantity > userTickets || !lotteryItem) {
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

                                                    // Show success message
                                                    // eslint-disable-next-line no-console
                                                    console.log("Order placed successfully with tickets");

                                                    // Reset quantity after successful apply
                                                    setTicketQuantity(0);

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
                                            }}
                                            disabled={ticketQuantity <= 0 || ticketQuantity > userTickets || applyingTicket || !lotteryItem}
                                            className="px-8 py-2 bg-[#D4AF37] hover:bg-[#B8860B] disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded transition-colors uppercase whitespace-nowrap"
                                        >
                                            {applyingTicket ? (t("applying") || "APPLYING...") : (t("apply") || "APPLY")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Participate/Continue Button */}
                        {showQuantitySelector ? (
                            // Show quantity selector + CONTINUE button together in one row
                            <div className="flex items-center gap-4">
                                {/* Quantity Selector */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentQty = Number(selectedQuantity) || 1;
                                            if (currentQty > 1) {
                                                setSelectedQuantity(currentQty - 1);
                                            }
                                        }}
                                        disabled={Number(selectedQuantity) <= 1}
                                        className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-[#797979] transition-all duration-200"
                                    >
                                        <Minus size={22} className="text-[#797979]" />
                                    </button>

                                    <input
                                        type="number"
                                        min="1"
                                        value={selectedQuantity}
                                        onChange={(e) => {
                                            const val = Math.max(1, parseInt(e.target.value) || 1);
                                            setSelectedQuantity(val);
                                        }}
                                        className="w-20 h-12 text-center text-xl font-bold text-[#797979] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-opacity-50 ticket-quantity bg-gray-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentQty = Number(selectedQuantity) || 1;
                                            setSelectedQuantity(currentQty + 1);
                                        }}
                                        className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-[#D4AF37] hover:text-white transition-all duration-200"
                                    >
                                        <Plus size={22} className="text-[#797979]" />
                                    </button>
                                </div>

                                {/* Continue Button */}
                                <button
                                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg"
                                    onClick={() => {
                                        if (!lotteryItem || !selectedTicket) return;

                                        const ticketsSource: any[] =
                                            lotteryItem.tickets ||
                                            (lotteryItem as any).ticketPackages ||
                                            (lotteryItem as any).ticketOptions ||
                                            (lotteryItem as any).entryOptions ||
                                            [];

                                        let selectedTicketData: any = null;
                                        ticketsSource.forEach((ticket: any, index: number) => {
                                            const ticketId = ticket.ticketId || ticket.id || ticket._id || index.toString();
                                            if (selectedTicket === ticketId) {
                                                selectedTicketData = {
                                                    id: ticketId,
                                                    price: ticket.price || ticket.ticketPrice || 0,
                                                };
                                            }
                                        });

                                        if (selectedTicketData && selectedTicketData.price > 0) {
                                            // Use handleContinueClick which checks auth and adds to cart
                                            handleContinueClick(selectedTicketData.id, selectedQuantity);
                                        }
                                    }}
                                    disabled={applyingTicket}
                                >
                                    {t("continue") || "CONTINUE"}
                                </button>
                            </div>
                        ) : (
                            // Show PARTICIPATE button
                            <button
                                className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
                                onClick={() => {
                                    if (!lotteryItem) return;

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

                                    // Free ticket flow - navigate to confirmation page
                                    if (selectedTicketData && selectedTicketData.price === 0) {
                                        router.push(
                                            `/reffles/${pid}/free-ticket-confirmation?ticketId=${selectedTicketData.id}&quantity=${selectedTicketData.quantity}`
                                        );
                                        return;
                                    }

                                    // Paid ticket flow - show quantity selector (PARTICIPATE action)
                                    if (selectedTicketData && selectedTicketData.price > 0) {
                                        setSelectedQuantity(1); // Reset to default quantity
                                        setShowQuantitySelector(true);
                                        return;
                                    }
                                }}
                                disabled={applyingTicket}
                            >
                                {t("participate") || "PARTICIPATE"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Additional Information Sections */}
                <div className="bg-white rounded-xl shadow-lg">
                    {/* Product Description Section */}
                    <div className="border-b border-gray-200">
                        <button
                            onClick={() => toggleSection("productDescription")}
                            className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-[#2f2f2f]">
                                {t("productDescription")}
                            </h2>
                            {openSections.productDescription ? (
                                <ChevronUp className="text-[#2f2f2f] w-5 h-5" />
                            ) : (
                                <ChevronDown className="text-[#2f2f2f] w-5 h-5" />
                            )}
                        </button>
                        {openSections.productDescription && (
                            <div className="px-4 md:px-5 pb-4 md:pb-5">
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
                            </div>
                        )}
                    </div>

                    {/* Rules of the Draw Section */}
                    <div className="border-b border-gray-200">
                        <button
                            onClick={() => toggleSection("rulesOfDraw")}
                            className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-[#2f2f2f]">
                                {t("rulesOfTheDraw")}
                            </h2>
                            {openSections.rulesOfDraw ? (
                                <ChevronUp className="text-[#2f2f2f] w-5 h-5" />
                            ) : (
                                <ChevronDown className="text-[#2f2f2f] w-5 h-5" />
                            )}
                        </button>
                        {openSections.rulesOfDraw && (
                            <div className="px-4 md:px-5 pb-4 md:pb-5">
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
                            </div>
                        )}
                    </div>

                    {/* Terms and Conditions Section */}
                    <div className="border-b border-gray-200">
                        <button
                            onClick={() => toggleSection("termsConditions")}
                            className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-[#2f2f2f]">
                                {t("termsAndConditions")}
                            </h2>
                            {openSections.termsConditions ? (
                                <ChevronUp className="text-[#2f2f2f] w-5 h-5" />
                            ) : (
                                <ChevronDown className="text-[#2f2f2f] w-5 h-5" />
                            )}
                        </button>
                        {openSections.termsConditions && (
                            <div className="px-4 md:px-5 pb-4 md:pb-5">
                                {/* <div className="text-sm md:text-base text-[#797979] mb-3 leading-relaxed">
                                    {lotteryItem.termsAndConditions ? (
                                        <div
                                            className="accordion-content"
                                            dangerouslySetInnerHTML={{ __html: lotteryItem.termsAndConditions }}
                                        />
                                    ) : (
                                        <p className="text-sm text-[#797979]">{t("noDataAvailable")}</p>
                                    )}
                                </div> */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[#797979]">-</span>
                                    <button
                                        onClick={() => router.push(`/reffles/${pid}/terms`)}
                                        className="text-xs md:text-sm font-bold text-[#D4AF37] hover:text-[#B8860B] transition-colors uppercase"
                                    >
                                        {t("allDetails")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Questions & Answers Section */}
                    <div className="border-b border-gray-200">
                        <button
                            onClick={() => toggleSection("questionsAnswers")}
                            className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-[#2f2f2f]">
                                {t("questionsAndAnswers")} ({questionsCount})
                            </h2>
                            {openSections.questionsAnswers ? (
                                <ChevronUp className="text-[#2f2f2f] w-5 h-5" />
                            ) : (
                                <ChevronDown className="text-[#2f2f2f] w-5 h-5" />
                            )}
                        </button>
                        {openSections.questionsAnswers && (
                            <div className="px-4 md:px-5 pb-4 md:pb-5">
                                <div className="border-t border-gray-200 mt-2"></div>

                                {/* Questions List */}
                                {questionsLoading ? (
                                    <div className="py-8 text-center">
                                        <p className="text-sm text-[#797979]">{t("loading") || "Loading..."}</p>
                                    </div>
                                ) : questions.length > 0 ? (
                                    <div className="mt-4 space-y-6">
                                        {questions.map((item, index) => (
                                            <div key={item._id || index} className="border-b border-gray-200 pb-6 last:border-b-0">
                                                {/* Question */}
                                                <div className="mb-3">
                                                    <div className="flex gap-3">
                                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-sm font-bold">
                                                            Q
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm md:text-base font-medium text-[#2f2f2f] mb-2">
                                                                {item.question}
                                                            </p>
                                                            <p className="text-xs text-[#797979]">
                                                                {t("asked") || "Asked"} {getRelativeTime(item.postedOn)} {t("by") || "by"} {item.userName || t("anonymous") || "Anonymous"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Answer */}
                                                <div className="ml-9">
                                                    {item.answer && item.answer.length > 0 ? (
                                                        <div>
                                                            <div className="flex gap-3 mb-2">
                                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-[#2f2f2f] flex items-center justify-center text-sm font-bold">
                                                                    A
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-[#797979] mb-2">
                                                                        {item.answer[0].answer}
                                                                    </p>
                                                                    <p className="text-xs text-[#797979] mb-2">
                                                                        {t("answered") || "Answered"} {getRelativeTime(item.answer[0].postedOn)} {t("by") || "by"} {item.answer[0].userName || t("anonymous") || "Anonymous"}
                                                                    </p>
                                                                    <div className="flex items-center gap-4 text-xs text-[#797979]">
                                                                        <span>
                                                                            👍 {item.answer[0].upVoteCount || 0}
                                                                        </span>
                                                                        <span>
                                                                            👎 {item.answer[0].downVoteCount || 0}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {item.answer.length > 1 && (
                                                                <button className="text-xs text-[#D4AF37] hover:text-[#B8860B] font-medium mt-2">
                                                                    {t("readMoreAnswers") || "Read more answers"} ({item.answer.length - 1})
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-[#2f2f2f] flex items-center justify-center text-sm font-bold">
                                                                A
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-[#797979]">
                                                                    {t("noAnswerFound") || "No answer found"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-sm text-[#797979]">{t("noQuestionsFound") || "No questions found"}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Seller Information Section */}
                    <div>
                        <button
                            onClick={() => toggleSection("sellerInfo")}
                            className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-[#2f2f2f] uppercase">
                                {t("sellerInformation")}
                            </h2>
                            {openSections.sellerInfo ? (
                                <ChevronUp className="text-[#2f2f2f] w-5 h-5" />
                            ) : (
                                <ChevronDown className="text-[#2f2f2f] w-5 h-5" />
                            )}
                        </button>
                        {openSections.sellerInfo && (
                            <div className="px-4 md:px-5 pb-4 md:pb-5">
                                <div className="text-sm md:text-base text-[#797979] leading-relaxed">
                                    {lotteryItem.sellerInfo || lotteryItem.sellerName ? (
                                        <p className="text-sm text-[#797979]">
                                            {lotteryItem.sellerInfo || lotteryItem.sellerName || t("noDataAvailable")}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-[#797979]">{t("noDataAvailable")}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-8 right-8 w-12 h-12 bg-[#797979] hover:bg-[#5a5a5a] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
                    aria-label={t("scrollToTop")}
                >
                    <ChevronUp size={24} />
                </button>
            )}

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setPendingCartData(null);
                }}
                onLoginSuccess={handleLoginSuccess}
            />

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}


