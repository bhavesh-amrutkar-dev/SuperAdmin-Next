"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HomeBanner } from "@/src/models/api/response/home";

type Props = {
  banners: HomeBanner[];
  autoPlay?: boolean;
};

export default function HeroSlider({ banners, autoPlay = true }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners, autoPlay]);

  if (!banners.length) return null;

  const banner = banners[index];

  return (
    <section className="w-full">
      <div className="mx-auto pt-8 w-full max-w-[1648px] px-2 md:px-6">
        {/* Image container MUST be relative */}
        <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden rounded-2xl shadow-[0px_6px_20px_0px_#00000039]">
          <Image
            src={banner.imageWeb}
            alt="Home banner"
            fill
            priority={index === 0}
            sizes="(max-width: 640px) 100vw, 100vw"
            className="object-cover object-left rounded-2xl"
          />
        </div>

        {/* Dots BELOW image */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-3 py-4">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-200
                  ${
                    i === index
                      ? "bg-black scale-125"
                      : "bg-black/30 hover:bg-black/50"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
