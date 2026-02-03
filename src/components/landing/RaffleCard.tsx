// src/components/sections/RaffleCard.tsx

import { RaffleItem } from "@/src/models/api/response/home";
import Image from "next/image";

export default function RaffleCard({
  item,
  cellType,
}: {
  item: RaffleItem;
  cellType: number;
}) {
  const aspect =
    cellType === 1 || cellType === 2
      ? "aspect-square"
      : "aspect-[2/1]";

  return (
    <div className="min-w-45 shrink-0 text-center">
      {/* Image Wrapper */}
      <div
        className={`
          relative
          w-full
          ${aspect}
          flex
          items-center
          justify-center
          bg-transparent
        `}
      >
        <Image
          src={item.image}
          alt={item.name || ""}
          fill
          unoptimized
          className="object-contain"
        />
      </div>

      {/* Name */}
      {item.name && (
        <p className="mt-2 text-sm font-medium text-[#797979] truncate">
          {item.name}
        </p>
      )}

      {/* Price */}
      {item.price && (
        <p className="text-sm text-[#9a9a9a]">
          {item.currencySymbol} {item.price}
        </p>
      )}
    </div>
  );
}
