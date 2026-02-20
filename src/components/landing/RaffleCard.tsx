import { RaffleItem } from "@/src/models/api/response/home";
import Image from "next/image";

interface RaffleCardProps {
  item: RaffleItem;
  cellType: number;
}

export default function RaffleCard({ item, cellType }: RaffleCardProps) {
  // Dynamic aspect ratio - keeping it simple for now, can be adjusted.
  // Using 4/3 or square often looks best for products.
  const aspect = "aspect-[4/3]";

  return (
    <div
      className="
        group
        relative
        flex flex-col
        h-full
        w-full
        rounded-2xl
        bg-white
        text-left
        shadow-xl
        transition-all
        duration-300
        hover:-translate-y-1
        overflow-hidden
      "
    >
      {/* Image Container */}
      <div className={`relative w-full ${aspect} bg-white overflow-hidden`}>
        {/* Badge/Tag placeholder if needed in future */}
        {/* <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm uppercase tracking-wide text-gray-800">
            Raffle
         </div> */}

        <Image
          src={item.image}
          alt={item.name || "Raffle Image"}
          fill
          className="
            object-contain
            p-4
            transition-transform
            duration-500
            ease-out
            group-hover:scale-105
          "
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-4 md:p-5 bg-gray-50">

        {/* Title */}
        {item.name && (
          <h3 className="
            text-base md:text-lg 
            font-bold 
            text-gray-900 
            text-center
            line-clamp-2 
            leading-tight
            mb-2
            min-h-[2.5em]
          ">
            {item.name}
          </h3>
        )}

        {/* Price Section */}
        <div className="mt-auto pt-3 flex items-center justify-center border-t border-gray-200">
          {item.price && (
            <span className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
              {item.currencySymbol} {item.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
