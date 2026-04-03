import axios from "axios";
import { BLOG_URL, BLOG_STORIES_URL, STORE_CATEGORY_ID } from "../config";
import { getCookie, setCookie } from "cookies-next";

const getBlogToken = async (): Promise<string> => {
    try {
        const existingToken = getCookie("BlogToken") as string | undefined;
        if (existingToken) {
            return existingToken;
        }

        // Check if BLOG_URL is defined and not empty
        if (!BLOG_URL || BLOG_URL.trim() === "") {
            // eslint-disable-next-line no-console
            console.warn("BLOG_URL environment variable is not configured. Please set NEXT_PUBLIC_BLOG_URL in your .env file.");
            return "";
        }

        const response = await axios.get(BLOG_URL);
        const token = response?.data?.token || "";
        if (token && typeof window !== "undefined") {
            setCookie("BlogToken", token, {
                path: "/",
                sameSite: "none",
                secure: true,
                maxAge: 60 * 60 * 24 * 365,
            });
        }
        return token;
    } catch (error) {
        // eslint-disable-next-line no-console
        // console.warn("Error fetching blog token:", error);
        console.warn("Error fetching blog token:", error);
        return "";
    }
};

export type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    feature_image?: string;
    published_at?: string;
    updated_at?: string;
    tags?: Array<{ name: string; slug: string }>;
    authors?: Array<{ name: string; slug: string }>;
    html?: string;
};

export type BlogPagination = {
    page: number;
    limit: number;
    pages: number;
    total: number;
    next?: number | null;
    prev?: number | null;
};

export type BlogResponse = {
    posts: BlogPost[];
    meta: {
        pagination: BlogPagination;
    };
};

export const BlogService = {
    getAllBlogs: async (page: number = 1, limit: number = 12) => {
        // Check if BLOG_STORIES_URL is configured
        if (!BLOG_STORIES_URL || BLOG_STORIES_URL.trim() === "") {
            throw new Error("BLOG_STORIES_URL is not configured");
        }

        const token = await getBlogToken();
        const filter = STORE_CATEGORY_ID
            ? `filter=store_category_id:${STORE_CATEGORY_ID}`
            : "";
        const url = `${BLOG_STORIES_URL}?${filter}&limit=${limit}&page=${page}`;

        return axios.get<BlogResponse>(url, {
            headers: {
                Authorization: `Ghost ${token}`,
            },
        });
    },

    getBlogById: async (id: string) => {
        // Check if BLOG_STORIES_URL is configured
        if (!BLOG_STORIES_URL || BLOG_STORIES_URL.trim() === "") {
            throw new Error("BLOG_STORIES_URL is not configured");
        }

        const token = await getBlogToken();
        const url = `${BLOG_STORIES_URL}/${id}`;

        return axios.get<{ posts: BlogPost[] }>(url, {
            headers: {
                Authorization: `Ghost ${token}`,
            },
        });
    },
};

