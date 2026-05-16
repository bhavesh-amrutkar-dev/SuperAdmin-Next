"use client";

import { useEffect, useRef } from "react";

type PlaceToPayPopupProps = {
  url: string;
  onSuccess?: () => void;
  onError?: () => void;
  onClose?: () => void;
};

export default function PlaceToPayPopup({
  url,
  onSuccess,
  onError,
  onClose,
}: PlaceToPayPopupProps) {
  const popupRef = useRef<Window | null>(null);
  const successRef = useRef(false);

  useEffect(() => {
    if (!url) return;

    const width = 600;
    const height = 800;

    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    popupRef.current = window.open(
      url,
      "placetopay-checkout",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popupRef.current) {
      console.error("Popup blocked");
      return;
    }

    const timer = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(timer);

        // 🔥 Only treat as close if success not triggered
        if (!successRef.current) {
          onClose?.();
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [url, onClose]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin &&
        !event.origin.includes("placetopay.com")
      ) {
        return;
      }

      const { status } = event.data || {};

      if (status === "APPROVED") {
        successRef.current = true;
        popupRef.current?.close();
        onSuccess?.();
      } else if (status === "REJECTED") {
        popupRef.current?.close();
        onError?.();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onError]);

  return null;
}