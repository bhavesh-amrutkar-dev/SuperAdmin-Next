"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

type EmptyStateProps = {
  titleKey?: string;
  descriptionKey?: string;
  buttonKey?: string;
  redirectUrl?: string;
};

export default function EmptyState({
  titleKey = "noWinnerFound",
  descriptionKey = "winnerNotDeclaredYet",
  buttonKey = "backToWinners",
  redirectUrl = "/winners",
}: EmptyStateProps) {
  const t = useTranslations();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      {/* Icon */}
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 text-2xl">
        ⚠️
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {t(titleKey) ?? "No Data Found"}
      </h2>

      {/* Description */}
      <p className="text-gray-500 mb-6 max-w-md">
        {t(descriptionKey) ?? "We couldn’t find the requested data."}
      </p>

      {/* Button */}
      <Link
        href={redirectUrl}
        className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
      >
        {t(buttonKey) ?? "Go Back"}
      </Link>
    </div>
  );
}