"use client";

import { useEffect, useRef } from "react";

type PlaceToPayLightboxProps = {
    url: string;
    onSuccess?: () => void;
    onError?: () => void;
    onClose?: () => void;
};

function PlaceToPayLightbox({ url, onSuccess, onError, onClose }: PlaceToPayLightboxProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const onCloseRef = useRef(onClose);
    const onErrorRef = useRef(onError);
    const onSuccessRef = useRef(onSuccess);

    // Update refs when callbacks change
    useEffect(() => {
        onCloseRef.current = onClose;
        onErrorRef.current = onError;
        onSuccessRef.current = onSuccess;
    }, [onClose, onError, onSuccess]);

    // Handle iframe messages from Place to Pay
    useEffect(() => {
        if (!url || typeof window === "undefined") {
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            // Verify message origin for security
            if (!event.origin.includes("placetopay.com")) {
                return;
            }

            try {
                const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

                // Handle Place to Pay response
                if (data.status?.status === "APPROVED" || data.status === "APPROVED") {
                    if (onSuccessRef.current) {
                        onSuccessRef.current();
                    }
                } else if (data.status?.status === "REJECTED" || data.status === "REJECTED") {
                    // Payment rejected - call error handler
                    if (onErrorRef.current) {
                        onErrorRef.current();
                    }
                } else if (data.status?.status === "PENDING" || data.status === "PENDING") {
                    // Payment pending - call close handler (user may close without completing)
                    if (onCloseRef.current) {
                        onCloseRef.current();
                    }
                }
            } catch (error) {
                // Ignore parsing errors
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [url]);

    const handleClose = () => {
        if (onCloseRef.current) {
            onCloseRef.current();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!url) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">

                {/* Iframe Container */}
                <div className="flex-1 overflow-hidden">
                    <iframe
                        ref={iframeRef}
                        src={url}
                        className="w-full h-full border-0"
                        title="Place to Pay Checkout"
                        allow="payment"
                        sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                    />
                </div>
            </div>
        </div>
    );
}

export default PlaceToPayLightbox;

