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
      : "aspect-[1/1]";

  return (
    <div className="shrink-0 text-center raffle-card">
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
          raffle-card-image
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
      <div className="raffle-card-info">
        {/* Name */}
        {item.name && (
          <h2 className="mt-2 text-sm md:text-base lg:text-lg xl:text-xl font-bold text-[#2F2F2F] truncate">
            {item.name}
          </h2>
        )}

        {/* Price */}
        {item.price && (
          <p className="text-sm md:text-lg xl:text-[24px] font-semibold text-[#f3c200] mt-4">
            {item.currencySymbol} {item.price}
          </p>
        )}
      </div>
    </div>
  );
}
