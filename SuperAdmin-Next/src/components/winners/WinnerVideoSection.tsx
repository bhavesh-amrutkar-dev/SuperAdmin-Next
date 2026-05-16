
"use client";

import { useState } from "react";
import WinnerVideoModal from "@/src/components/modals/WinnerVideoModal";
import { Button } from "../ui/button";
import { Video } from "lucide-react";
import { useTranslations } from "next-intl";

export default function WinnerVideoSection({ videoUrl }: { videoUrl: string }) {
    const t = useTranslations();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-gray-900 text-white rounded-3xl shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 opacity-30">
                {/* Placeholder pattern or blurred video thumbnail could go here */}
            </div>
            <div className="relative z-10 p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-yellow-400" fill="currentColor" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t("watchWinningMoment")}</h3>
                <p className="text-gray-300 text-sm mb-6">{t("seeReaction")}</p>
                <Button
                    onClick={() => setIsOpen(true)}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors"
                >
                    {t("playVideo")}
                </Button>
            </div>
            <WinnerVideoModal
                isOpen={isOpen}
                closeModal={() => setIsOpen(false)}
                videoUrl={videoUrl}
            />
        </div>
    );
}
