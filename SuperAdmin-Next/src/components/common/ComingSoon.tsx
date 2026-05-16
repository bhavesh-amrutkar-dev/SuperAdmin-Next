"use client";

type ComingSoonProps = {
    title?: string;
    description?: string;
    className?: string;
};

const ComingSoon: React.FC<ComingSoonProps> = ({
    title = "Coming Soon",
    description,
    className = "",
}) => {
    return (
        <div className={`py-10 flex flex-col items-center justify-center text-center ${className}`}>
            <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#D4AF37] flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[#D4AF37]">?</span>
            </div>
            <p className="text-lg md:text-xl font-semibold text-[#2f2f2f] mb-2">
                {title}
            </p>
            {description && (
                <p className="text-sm md:text-base text-[#797979] max-w-md">
                    {description}
                </p>
            )}
        </div>
    );
};

export default ComingSoon;


