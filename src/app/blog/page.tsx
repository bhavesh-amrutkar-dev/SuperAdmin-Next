"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Share2, Calendar } from "lucide-react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PreFooterIconModule from "@/src/components/layout/PreFooterIconModule";
import { BlogService, type BlogPost, type BlogPagination } from "@/src/lib/services/blog";
import { PRODUCT_CART } from "@/src/lib/config";

export default function BlogPage() {
    const t = useTranslations();
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [pagination, setPagination] = useState<BlogPagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const fetchBlogs = async (page: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const response = await BlogService.getAllBlogs(page, 12);
            const data = response.data;
            setPosts(data.posts || []);
            setPagination(data.meta?.pagination || null);
            setCurrentPage(page);
        } catch (err) {
            try {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : err && typeof err === "object" && "message" in err
                            ? String(err.message)
                            : "Failed to load blog posts";
                setError(errorMessage);
                // eslint-disable-next-line no-console
                console.error("Error fetching blogs:", errorMessage);
            } catch {
                setError("Unknown error occurred");
            }
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs(1);
    }, [locale]);

    const handlePageChange = (page: number) => {
        fetchBlogs(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleShare = (post: BlogPost) => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.excerpt || "",
                url: typeof window !== "undefined" ? window.location.href : "",
            });
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "";
        }
    };

    const slugifyTitle = (title: string) => {
        return title.replace(/\s+/g, "-").toLowerCase();
    };

    if (loading && posts.length === 0) {
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

    return (
        <main>
            <Header />

            {/* Blog Banner */}
            <div className="w-full">
                <div className="text-center page-head-wrapper">
                    <h1 className="pt-2 pb-2 text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase tracking-[1px] leading-[1.35] text-white overflow-hidden text-ellipsis">
                        {t("blogs") || "Blogs"}
                    </h1>
                    <p className="text-[13px] md:text-[16px] uppercase text-white leading-relaxed mt-2">
                        {t("discoverStories") || "Discover Stories & Insights"}
                    </p>
                </div>

                {/* Main Content */}
                <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-12">
                    {error ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <div className="text-lg text-red-600">Error: {error}</div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <p className="text-lg text-[#797979]">
                                {t("noBlogsFound") || "No blog posts available"}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Blog Posts Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {posts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
                                    >
                                        <Link
                                            href={`/blog/${slugifyTitle(post.title)}?bid=${post.id}`}
                                            className="block"
                                        >
                                            <div className="relative w-full h-48 overflow-hidden bg-gray-200">
                                                <Image
                                                    src={post.feature_image || PRODUCT_CART}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                    unoptimized
                                                />
                                            </div>
                                        </Link>

                                        <div className="p-6 flex-grow flex flex-col">
                                            {/* Tags */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {post.tags.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 text-xs font-semibold uppercase bg-[#f3c200] text-[#2f2f2f] rounded-full"
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Title */}
                                            <Link
                                                href={`/blog/${slugifyTitle(post.title)}?bid=${post.id}`}
                                                className="block mb-3"
                                            >
                                                <h2 className="text-xl font-bold text-[#2f2f2f] uppercase tracking-tight line-clamp-2 hover:text-[#f3c200] transition-colors">
                                                    {post.title}
                                                </h2>
                                            </Link>

                                            {/* Excerpt */}
                                            {post.excerpt && (
                                                <p className="text-[#797979] text-sm mb-4 line-clamp-3 flex-grow">
                                                    {post.excerpt}
                                                </p>
                                            )}

                                            {/* Footer */}
                                            <div className="mt-auto pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-[#797979]">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{formatDate(post.published_at)}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleShare(post)}
                                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                            aria-label="Share"
                                                        >
                                                            <Share2 className="w-4 h-4 text-[#2f2f2f]" />
                                                        </button>
                                                        <button
                                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                            aria-label="Bookmark"
                                                        >
                                                            <Bookmark className="w-4 h-4 text-[#2f2f2f]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-[#2f2f2f] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f3c200] hover:text-[#2f2f2f] transition-colors"
                                    >
                                        {t("previous")}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                            .filter((page) => {
                                                // Show first page, last page, current page, and pages around current
                                                if (
                                                    page === 1 ||
                                                    page === pagination.pages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                ) {
                                                    return true;
                                                }
                                                return false;
                                            })
                                            .map((page, index, array) => {
                                                // Add ellipsis if there's a gap
                                                const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                                                return (
                                                    <div key={page} className="flex items-center gap-2">
                                                        {showEllipsisBefore && (
                                                            <span className="text-[#797979]">...</span>
                                                        )}
                                                        <button
                                                            onClick={() => handlePageChange(page)}
                                                            className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                                                                ? "bg-[#f3c200] text-[#2f2f2f] font-bold"
                                                                : "bg-gray-200 text-[#2f2f2f] hover:bg-[#f3c200]"
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === pagination.pages}
                                        className="px-4 py-2 bg-[#2f2f2f] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f3c200] hover:text-[#2f2f2f] transition-colors"
                                    >
                                        {t("next")}
                                    </button>
                                </div>
                            )}

                            {/* Results Count */}
                            {pagination && (
                                <div className="text-center mt-6 text-sm text-[#797979]">
                                    Showing page {currentPage} of {pagination.pages} ({pagination.total}{" "}
                                    {t("items") || "items"})
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <PreFooterIconModule />
            <Footer />
        </main>
    );
}

