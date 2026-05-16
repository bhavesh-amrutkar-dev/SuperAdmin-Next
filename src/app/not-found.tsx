// app/not-found.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "../components/ui/button";

export default function NotFoundPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
      {/* SVG Illustration */}
      <svg
        className="w-48 h-48 mb-6 text-yellow-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 9.75L12 12m0 0l2.25 2.25M12 12l-2.25 2.25M12 12l2.25-2.25M12 12v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-6">
        {t("pageNotFound") ?? "Oops! Page not found."}
      </p>

      <Link href="/" className="inline-block">
        <Button className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition">
          {t("goHome") ?? "Go Home"}
        </Button>
      </Link>
    </div>
  );
}