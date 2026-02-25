"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function FallbackUI({ message, onRetry }: Props) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      {/* SVG Illustration */}
      <svg
        width="240"
        height="240"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6"
      >
        <circle cx="256" cy="256" r="256" fill="#FDE68A" />
        <path
          d="M184 200h144v40H184v-40zM184 280h144v40H184v-40z"
          fill="#F59E0B"
        />
        <circle cx="200" cy="152" r="16" fill="#B45309" />
        <circle cx="312" cy="152" r="16" fill="#B45309" />
        <path
          d="M256 360c48 0 88-32 88-72H168c0 40 40 72 88 72z"
          fill="#B45309"
        />
      </svg>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        {t("serviceDownTitle") ?? "Oops! Services are down"}
      </h2>

      <p className="text-gray-600 mb-6 max-w-sm">
        {message ??
          t(
            "serviceDownMessage"
          ) ??
          "Our backend services are temporarily unavailable. Please try again later."}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 font-medium rounded-lg"
        >
          {t("retry") ?? "Retry"}
        </Button>
      )}
    </div>
  );
}