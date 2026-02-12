"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod?: string;
}

export default function ComingSoonModal({ isOpen, onClose, paymentMethod }: ComingSoonModalProps) {
  const t = useTranslations();

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Disable body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
              {t("comingSoon") || "Coming Soon"}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-[#D4AF37] mx-auto"></div>
          </div>

          {/* Message */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-2 sm:mb-3">
              {paymentMethod === "athMovil"
                ? t("athMovilComingSoon") || "ATH Móvil payment method is coming soon!"
                : paymentMethod === "creditCard"
                  ? t("creditCardComingSoon") || "Credit card payment is coming soon!"
                  : t("paymentComingSoon") || "This payment method is coming soon!"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {t("comingSoonMessage") || "We're working hard to bring you this feature. Please check back soon!"}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 md:px-10 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              {t("close") || "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

