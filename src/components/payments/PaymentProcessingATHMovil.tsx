"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

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

  const [confirmingCancel, setConfirmingCancel] =
    useState(false);

  // ✅ Countdown
  // const [autoRedirectSeconds, setAutoRedirectSeconds] =
  //   useState(30);

  // ✅ Prevent multiple redirects
  // const hasRedirectedRef = useRef(false);

  // ✅ Track visibility changes
  const pageHiddenAtRef = useRef<number | null>(
    null
  );

  // ✅ Track redirect attempts
  const redirectAttemptRef = useRef(0);

  // ===============================
  // DEBUG LOGGER
  // ===============================
  const debugLog = (
    event: string,
    data?: Record<string, any>
  ) => {
    console.log(
      `[ATH-DEEPLINK] ${event}`,
      {
        timestamp:
          new Date().toISOString(),
        ...data,
      }
    );
  };

  // ===============================
  // DEVICE DETECTION
  // ===============================
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;

    const isIOS =
      /iPad|iPhone|iPod/.test(ua);

    const isAndroid =
      /Android/.test(ua);

    const isSafari =
      /^((?!chrome|android).)*safari/i.test(
        ua
      );

    const isChrome =
      /Chrome/i.test(ua);

    const isWebView =
      /(wv|WebView)/i.test(ua) ||
      (/iPhone|iPod|iPad/.test(ua) &&
        !/Safari/i.test(ua));

    const isMobile =
      isIOS || isAndroid;

    return {
      ua,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isWebView,
      isMobile,
    };
  };

  const steps = [
    {
      num: 1,
      label: t("athMovilStep1"),
    },
    {
      num: 2,
      label: t(
        "athMovilStep2",
        {
          merchant: merchantName,
        }
      ),
    },
    {
      num: 3,
      label: t("athMovilStep3"),
    },
  ];

  const handleCancelClick = () => {
    debugLog("CANCEL_CLICKED", {
      confirmingCancel,
    });

    if (confirmingCancel) {
      debugLog(
        "PAYMENT_CANCEL_CONFIRMED"
      );

      onCancel?.();
    } else {
      setConfirmingCancel(true);
    }
  };

  // ===============================
  // OPEN APP
  // ===============================
  const openApp = useCallback(() => {
    debugLog(
      "OPEN_APP_TRIGGERED",
      {
        deepLinkUrl,
      }
    );

    if (!deepLinkUrl) {
      debugLog(
        "OPEN_APP_ABORT_NO_URL"
      );

      return;
    }

    // if (
    //   hasRedirectedRef.current
    // ) {
    //   debugLog(
    //     "OPEN_APP_ABORT_ALREADY_REDIRECTED"
    //   );

    //   return;
    // }

    // hasRedirectedRef.current =
    //   true;

    redirectAttemptRef.current += 1;

    try {
      const device =
        getDeviceInfo();

      debugLog(
        "DEVICE_INFO",
        device
      );

      // ============================
      // MOBILE
      // ============================
      if (device.isMobile) {
        debugLog(
          "USING_WINDOW_LOCATION",
          {
            platform:
              device.isIOS
                ? "iOS"
                : "Android",
          }
        );

        /**
         * iOS Safari:
         * window.location.href works best
         *
         * Android Chrome:
         * Also supported
         */
        window.location.href =
          deepLinkUrl;

        debugLog(
          "WINDOW_LOCATION_EXECUTED",
          {
            url: deepLinkUrl,
          }
        );
      }

      // ============================
      // DESKTOP
      // ============================
      else {
        debugLog(
          "USING_WINDOW_OPEN_DESKTOP"
        );

        const popup =
          window.open(
            deepLinkUrl,
            "_blank",
            "noopener,noreferrer"
          );

        debugLog(
          "WINDOW_OPEN_RESULT",
          {
            popupBlocked:
              !popup,
            popupExists:
              !!popup,
          }
        );
      }

      // ============================
      // CHECK APP OPEN STATUS
      // ============================
      setTimeout(() => {
        debugLog(
          "POST_REDIRECT_CHECK",
          {
            documentHidden:
              document.hidden,
            visibilityState:
              document.visibilityState,
          }
        );
      }, 2000);
    } catch (err) {
      debugLog(
        "DEEPLINK_EXCEPTION",
        {
          error: err,
        }
      );

      console.warn(
        "ATH deeplink failed:",
        err
      );
    }
  }, [deepLinkUrl]);

  // ===============================
  // PAGE VISIBILITY EVENTS
  // ===============================
  useEffect(() => {
    const handleVisibilityChange =
      () => {
        debugLog(
          "VISIBILITY_CHANGED",
          {
            hidden:
              document.hidden,
            visibilityState:
              document.visibilityState,
          }
        );

        if (document.hidden) {
          pageHiddenAtRef.current =
            Date.now();

          debugLog(
            "APP_SWITCH_DETECTED"
          );
        } else {
          if (
            pageHiddenAtRef.current
          ) {
            const duration =
              Date.now() -
              pageHiddenAtRef.current;

            debugLog(
              "RETURNED_FROM_APP",
              {
                hiddenDurationMs:
                  duration,
              }
            );
          }
        }
      };

    const handlePageHide =
      () => {
        debugLog(
          "PAGE_HIDE_EVENT"
        );
      };

    const handlePageShow =
      () => {
        debugLog(
          "PAGE_SHOW_EVENT"
        );
      };

    const handleBlur = () => {
      debugLog("WINDOW_BLUR");
    };

    const handleFocus = () => {
      debugLog("WINDOW_FOCUS");
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "pagehide",
      handlePageHide
    );

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "pagehide",
        handlePageHide
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  // ===============================
  // COUNTDOWN TIMER
  // ===============================
  // useEffect(() => {
  //   if (!deepLinkUrl) return;

  //   debugLog(
  //     "COUNTDOWN_STARTED",
  //     {
  //       initialSeconds: 30,
  //     }
  //   );

  //   const interval =
  //     setInterval(() => {
  //       setAutoRedirectSeconds(
  //         (prev) => {
  //           debugLog(
  //             "COUNTDOWN_TICK",
  //             {
  //               secondsRemaining:
  //                 prev,
  //             }
  //           );

  //           if (prev <= 1) {
  //             clearInterval(
  //               interval
  //             );

  //             debugLog(
  //               "COUNTDOWN_FINISHED"
  //             );

  //             return 0;
  //           }

  //           return prev - 1;
  //         }
  //       );
  //     }, 1000);

  //   return () => {
  //     debugLog(
  //       "COUNTDOWN_CLEANUP"
  //     );

  //     clearInterval(interval);
  //   };
  // }, [deepLinkUrl]);

  // ===============================
  // AUTO REDIRECT
  // ===============================
  // useEffect(() => {
  //   if (!deepLinkUrl) return;

  //   debugLog(
  //     "AUTO_REDIRECT_TIMER_STARTED",
  //     {
  //       delayMs: 30000,
  //     }
  //   );

  //   const timer = setTimeout(() => {
  //     debugLog(
  //       "AUTO_REDIRECT_TRIGGERED"
  //     );

  //     openApp();
  //   }, 30000);

  //   return () => {
  //     debugLog(
  //       "AUTO_REDIRECT_TIMER_CLEANUP"
  //     );

  //     clearTimeout(timer);
  //   };
  // }, [deepLinkUrl, openApp]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(
        "athMovilCompletePayment"
      )}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
    >
      <div className="bg-white w-full max-w-[460px] rounded-3xl shadow-2xl overflow-hidden">
        {/* HEADER */}
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
            {t(
              "athMovilCompletePayment"
            )}
          </h2>
        </div>

        {/* BODY */}
        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* STEPS */}
          <ol className="space-y-3">
            {steps.map(
              ({ num, label }) => (
                <li
                  key={num}
                  className="flex items-start gap-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f3c200] text-white text-[11px] font-bold flex items-center justify-center mt-0.5 shadow-sm">
                    {num}
                  </span>

                  <span className="text-sm text-gray-700 leading-snug pt-0.5">
                    {label}
                  </span>
                </li>
              )
            )}
          </ol>

          {/* OPEN APP BUTTON */}
          {deepLinkUrl && (
            <div className="space-y-2">
              <a
                href={deepLinkUrl}
                onClick={(e) => {
                  e.preventDefault();

                  debugLog(
                    "MANUAL_OPEN_CLICKED"
                  );

                  openApp();
                }}
                className="
                  group w-full flex items-center justify-center gap-2.5
                  h-12 rounded-2xl
                  bg-[#f3c200] hover:bg-[#e6b400]
                  active:scale-[0.98]
                  shadow-md shadow-yellow-200
                  text-white font-bold text-[15px]
                  transition-all duration-150
                  cursor-pointer
                "
              >
                <Smartphone className="w-5 h-5" />

                {t(
                  "athMovilOpenApp"
                )}

                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
{/* 
              <p className="text-xs text-center text-gray-400">
                Opening ATH
                Móvil app in{" "}
                {
                  autoRedirectSeconds
                }
                s
              </p> */}
            </div>
          )}

          {/* TIMER */}
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

              <div className="absolute inset-0 rounded-full border-4 border-[#f3c200] border-t-transparent animate-spin" />
            </div>

            {formattedTimer && (
              <span className="text-sm font-semibold text-[#D4AF37] tabular-nums">
                {formattedTimer}
              </span>
            )}
          </div>

          {/* WARNING */}
          <div className="space-y-4 pt-1">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3.5 shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </span>

              <div>
                <p className="text-sm font-bold text-amber-800 leading-snug">
                  {t(
                    "athMovilDoNotClose"
                  )}
                </p>

                <p className="text-xs text-amber-600 mt-0.5 leading-snug">
                  {t(
                    "athMovilClosingWarning"
                  )}
                </p>
              </div>
            </div>

            {/* MANUAL OPEN */}
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              {t(
                "athMovilNoNotification"
              )}{" "}
              <button
                type="button"
                onClick={() => {
                  debugLog(
                    "OPEN_MANUALLY_CLICKED"
                  );

                  openApp();
                }}
                className="font-semibold underline underline-offset-2 transition-colors text-[#D4AF37] hover:text-[#b8940f] cursor-pointer"
              >
                {t(
                  "athMovilOpenManually"
                )}
              </button>
            </p>

            {/* CANCEL */}
            {onCancel && (
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={
                    handleCancelClick
                  }
                  className={`
                    w-full flex items-center justify-center gap-2
                    h-11 rounded-xl border-2 text-sm font-semibold
                    transition-all duration-150 cursor-pointer
                    ${
                      confirmingCancel
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-red-200 bg-red-50 text-red-500"
                    }
                  `}
                >
                  <XCircle className="w-4 h-4" />

                  {confirmingCancel
                    ? t(
                        "athMovilYesCancelPayment"
                      )
                    : t(
                        "cancelTransaction"
                      )}
                </button>

                {confirmingCancel && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmingCancel(
                        false
                      )
                    }
                    className="w-full text-xs text-gray-400 hover:text-gray-600 font-medium py-1 transition-colors cursor-pointer"
                  >
                    {t(
                      "athMovilKeepWaiting"
                    )}
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