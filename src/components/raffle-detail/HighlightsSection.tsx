import React from "react";
import { useTranslations } from "next-intl";

type HighlightsSectionProps = {
    highlights?: string[];
};

const HighlightsSection = ({ highlights }: HighlightsSectionProps) => {
    const t = useTranslations();

    if (!highlights || highlights.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-base font-bold text-black uppercase mb-3">
                {t("highlights") || "HIGHLIGHTS"} :
            </h3>
            <ul className="pl-6 space-y-2 list-none">
                {highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-[#555] relative flex items-start gap-2">
                        {/* We render the text directly as it might contain emojis from the backend 
                            based on the legacy implementation which just rendered {highlight}
                         */}
                        <span>{highlight}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HighlightsSection;
