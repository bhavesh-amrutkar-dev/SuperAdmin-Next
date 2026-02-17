import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "../ui/dialog";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface WinnerVideoModalProps {
    isOpen: boolean;
    closeModal: () => void;
    videoUrl: string;
}

export default function WinnerVideoModal({
    isOpen,
    closeModal,
    videoUrl,
}: WinnerVideoModalProps) {
    const t = useTranslations();

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closeModal();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="
    bg-black border-none overflow-hidden text-white p-0 shadow-2xl
    
    w-full
    sm:w-[95vw]
    sm:max-w-4xl
    
    max-h-[85vh]
  "
            >

                <DialogHeader className="sr-only">
                    <DialogTitle>{t("winnerVideo")}</DialogTitle>
                </DialogHeader>

                <div className="relative w-full aspect-video max-h-[75vh] flex items-center justify-center bg-black">

                    {/* Custom Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute right-3 top-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
