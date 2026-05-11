"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Smartphone,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  deepLinkUrl?: string;
  merchantName?: string;
  formattedTimer?: string;
  onCancel?: () => void;
}

export default function PaymentProcessingATHMovil({
  deepLinkUrl,
  merchantName = "Don Rifa",
  formattedTimer,
  onCancel,
}: Props) {
  const t = useTranslations();

  const [confirmingCancel, setConfirmingCancel] = useState(false);

  // ✅ Countdown
  const [autoRedirectSeconds, setAutoRedirectSeconds] = useState(30);

  // ✅ Prevent multiple redirects
  const hasRedirectedRef = useRef(false);

  const steps = [
    { num: 1, label: t("athMovilStep1") },
    { num: 2, label: t("athMovilStep2", { merchant: merchantName }) },
    { num: 3, label: t("athMovilStep3") },
  ];

  const handleCancelClick = () => {
    if (confirmingCancel) {
      onCancel?.();
    } else {
      setConfirmingCancel(true);
    }
  };

  // ✅ Deeplink open
  // IMPORTANT:
  // Do NOT stop polling here
  const openApp = () => {
    if (!deepLinkUrl) return;

    if (hasRedirectedRef.current) return;

    hasRedirectedRef.current = true;

    try {
      const ua = navigator.userAgent;

      const isIOS =
        /iPad|iPhone|iPod/.test(ua);

      const isAndroid =
        /Android/.test(ua);

      const isMobile = isIOS || isAndroid;

      if (isMobile) {
        // ✅ mobile/webview
        window.location.href = deepLinkUrl;
      } else {
        // ✅ desktop
        window.open(
          deepLinkUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (err) {
      console.warn("ATH deeplink failed:", err);
    }
  };
  // ✅ Countdown timer
  useEffect(() => {
    if (!deepLinkUrl) return;

    const interval = setInterval(() => {
      setAutoRedirectSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deepLinkUrl]);

  // ✅ Auto redirect after 30 sec
  // IMPORTANT:
  // polling continues in background
  useEffect(() => {
    if (!deepLinkUrl) return;

    const timer = setTimeout(() => {
      openApp();
    }, 30000);

    return () => clearTimeout(timer);
  }, [deepLinkUrl]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("athMovilCompletePayment")}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
    >
      <div className="bg-white w-full max-w-[460px] rounded-3xl shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-[#f3c200] to-[#d4a017] px-6 pt-8 pb-7 flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/30">
            <Image
              src="/images/icons/authmovil.png"
              alt="ATH Móvil"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>

          <h2 className="text-[17px] sm:text-lg font-bold text-white text-center leading-snug max-w-[300px]">
            {t("athMovilCompletePayment")}
          </h2>
        </div>

        {/* ── Body ── */}
        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* Steps */}
          <ol className="space-y-3" aria-label="Payment steps">
            {steps.map(({ num, label }) => (
              <li key={num} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f3c200] text-white text-[11px] font-bold flex items-center justify-center mt-0.5 shadow-sm"
                >
                  {num}
                </span>

                <span className="text-sm text-gray-700 leading-snug pt-0.5">
                  {label}
                </span>
              </li>
            ))}
          </ol>

          {/* ── Open App Button ── */}
          {deepLinkUrl && (
            <div className="space-y-2">
              {/* 
                IMPORTANT:
                Use anchor tag instead of popup/window.open
                Better iOS support
              */}
              <a
                href={deepLinkUrl}
                onClick={(e) => {
                  e.preventDefault();

                  // ✅ DO NOT stop polling
                  openApp();
                }}
                className="
                  group w-full flex items-center justify-center gap-2.5
                  h-12 rounded-2xl
                  bg-[#f3c200] hover:bg-[#e6b400]
                  active:scale-[0.98] active:bg-[#d4a500]
                  shadow-md shadow-yellow-200
                  text-white font-bold text-[15px]
                  transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[#f3c200]
                  focus-visible:ring-offset-2
                  cursor-pointer
                "
              >
                <Smartphone
                  className="w-5 h-5 transition-transform duration-150 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />

                {t("athMovilOpenApp")}

                <ExternalLink
                  className="w-3.5 h-3.5 opacity-70"
                  aria-hidden="true"
                />
              </a>

              {/* Countdown */}
              <p className="text-xs text-center text-gray-400">
                Opening ATH Móvil app in {autoRedirectSeconds}s
              </p>
            </div>
          )}

          {/* ── Spinner + timer ── */}
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative w-12 h-12" aria-hidden="true">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

              <div className="absolute inset-0 rounded-full border-4 border-[#f3c200] border-t-transparent animate-spin" />
            </div>

            {formattedTimer && (
              <span
                aria-live="polite"
                aria-atomic="true"
                className="text-sm font-semibold text-[#D4AF37] tabular-nums"
              >
                {formattedTimer}
              </span>
            )}
          </div>

          {/* ── Bottom section ── */}
          <div className="space-y-4 pt-1">
            {/* Warning */}
            <div
              role="alert"
              className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3.5 shadow-sm"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center mt-0.5">
                <AlertTriangle
                  className="w-4 h-4 text-amber-500"
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="text-sm font-bold text-amber-800 leading-snug">
                  {t("athMovilDoNotClose")}
                </p>

                <p className="text-xs text-amber-600 mt-0.5 leading-snug">
                  {t("athMovilClosingWarning")}
                </p>
              </div>
            </div>

            {/* Manual helper */}
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              {t("athMovilNoNotification")}{" "}
              <button
                type="button"
                onClick={openApp}
                className="font-semibold underline underline-offset-2 transition-colors text-[#D4AF37] hover:text-[#b8940f] cursor-pointer"
              >
                {t("athMovilOpenManually")}
              </button>
            </p>

            {/* Cancel button */}
            {onCancel && (
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className={`
                    w-full flex items-center justify-center gap-2
                    h-11 rounded-xl border-2 text-sm font-semibold
                    transition-all duration-150 cursor-pointer
                    ${confirmingCancel
                      ? "border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 active:scale-[0.98]"
                      : "border-red-200 bg-red-50 text-red-500 hover:border-red-400 hover:bg-red-100 active:scale-[0.98]"
                    }
                  `}
                >
                  <XCircle className="w-4 h-4" aria-hidden="true" />

                  {confirmingCancel
                    ? t("athMovilYesCancelPayment")
                    : t("cancelTransaction")}
                </button>

                {confirmingCancel && (
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(false)}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 font-medium py-1 transition-colors cursor-pointer"
                  >
                    {t("athMovilKeepWaiting")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}