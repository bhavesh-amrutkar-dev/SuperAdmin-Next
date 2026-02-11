import { cn } from "@/src/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectClass?: string; // optional aspect ratio for image placeholder
}

export default function Skeleton({ className, aspectClass = "aspect-square", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gray-100 overflow-hidden flex flex-col items-center",
        className
      )}
      {...props}
    >
      {/* Image Placeholder */}
      <div className={cn(`w-full ${aspectClass} bg-gray-300`)} />

      {/* Text Placeholder */}
      <div className="w-3/4 h-4 mt-3 bg-gray-300 rounded-md" />

      {/* Price Placeholder */}
      <div className="w-1/2 h-4 mt-2 bg-yellow-300 rounded-md" />
    </div>
  );
}
