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
                onClose?.();
            }
        }, 500);

        return () => clearInterval(timer);
    }, [url, onClose]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log(
                "window.location.origin",
                window.location.origin,
                "event.origin",
                event.origin
            );

            if (
                event.origin !== window.location.origin &&
                !event.origin.includes("placetopay.com")
            ) {
                return;
            }

            const { status } = event.data || {};

            if (status === "APPROVED") {
                onSuccess?.();
            } else if (status === "REJECTED") {
                onError?.();
            } else {
                onClose?.();
            }
        };

        window.addEventListener("message", handleMessage);

        return () => window.removeEventListener("message", handleMessage);
    }, [onSuccess, onError, onClose]);

    return null;
}