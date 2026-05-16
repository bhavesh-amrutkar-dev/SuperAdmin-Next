"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!showScrollTop) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 w-12 h-12 bg-white hover:cursor-pointer text-white rounded-full border border-gray-200 shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
            aria-label="Scroll to top"
        >
            <ChevronUp size={24} className="text-black" />
        </button>
    );
}