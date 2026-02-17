
"use client";

import Link from "next/link";
import { WinnerItem } from "@/src/models/api/response/winners";
import Image from "next/image";
import { useState } from "react";
import WinnerVideoModal from "../modals/WinnerVideoModal";
import { PROFILE_PLACE_HOLDER, WINNER } from "@/src/lib/config";
import { Play } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

interface WinnerCardProps {
    item: WinnerItem;
    customDrawDate?: string;
}

export default function WinnerCard({ item, customDrawDate }: WinnerCardProps) {
    const t = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const winner = item.winnersList && item.winnersList.length > 0 ? item.winnersList[0] : null;
    const videoUrl = item.winnersVideo && item.winnersVideo.length > 0 ? item.winnersVideo[0].videoUrl : null;

    // Use medium image if available, receive image array
    const productImage = item.image && item.image.length > 0 ? item.image[0].medium : "/images/placeholder.png";

    // Format Date - Use prop if available, otherwise fallback (which might cause hydration issue if not handled)
    // Server should pass customDrawDate to avoid hydration mismatch
    const drawDate = customDrawDate || (item.drawDateTimeStemp
        ? new Date(item.drawDateTimeStemp * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : "");


    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full group relative">
                <Link href={`/winners/${item._id}`} className="absolute inset-0 z-0">
                    <span className="sr-only">{t("viewWinnerDetails")}</span>
                </Link>

                {/* Product Image Section */}
                <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center p-4 overflow-hidden pointer-events-none">
                    <Image
                        src={productImage}
                        alt={item.productName}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Winner Badge/Overlay if needed */}
                    <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm flex items-center gap-1">
                        <Image src={WINNER} alt="Winner" width={12} height={12} />
                        {t("winner")}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Product Name */}
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1" title={item.productName}>
                        {item.productName}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">{drawDate}</p>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                        {winner ? (
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                    <Image
                                        src={winner.profilePic || PROFILE_PLACE_HOLDER}
                                        alt={winner.userName || "Winner"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {winner.firstName} {winner.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {winner.nationality || "Lucky Winner"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <span>{t("winnerToBeAnnounced")}</span>
                            </div>
                        )}
                    </div>

                    {/* Video Button */}
                    {videoUrl && (
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                openModal();
                            }}
                            className="mt-4 w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 relative z-10"
                        >
                            <Play className="w-4 h-4 text-yellow-400" fill="currentColor" />
                            {t("watchWinningMoment")}
                        </Button>
                    )}
                </div>
            </div>

            {videoUrl && (
                <WinnerVideoModal
                    isOpen={isOpen}
                    closeModal={closeModal}
                    videoUrl={videoUrl}
                />
            )}
        </>
    );
}
