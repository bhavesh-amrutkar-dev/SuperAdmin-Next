import { RaffleItem } from "@/src/models/api/response/home";
import Image from "next/image";

interface RaffleCardProps {
  item: RaffleItem;
  cellType: number;
}

export default function RaffleCard({ item, cellType }: RaffleCardProps) {
  // Dynamic aspect ratio
  const aspect = cellType === 1 || cellType === 2 ? "aspect-square" : "aspect-[1/1]";

  return (
    <div className="shrink-0 text-center raffle-card w-full rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {/* Image Wrapper */}
      <div className={`w-full ${aspect} relative bg-gray-50 flex items-center justify-center rounded-t-2xl overflow-hidden`}>
        <Image
          src={item.image}
          alt={item.name || ""}
          fill
          className="object-contain p-3 transition-transform duration-300 ease-in-out hover:scale-105"
          priority={false}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
      </div>

      {/* Info */}
      <div className="raffle-card-info px-4 py-4 flex flex-col items-center justify-center flex-1">
        {item.name && (
          <h2 className="truncate text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-gray-800 text-center w-full">
            {item.name}
          </h2>
        )}

        {item.price && (
          <p className="mt-2 text-sm md:text-lg xl:text-[22px] font-bold text-yellow-500 w-full text-center">
            {item.currencySymbol} {item.price}
          </p>
        )}
      </div>
    </div>
  );
}
